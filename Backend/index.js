const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const cors = require('cors');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');

const User = require('./models/User');

const port = process.env.PORT || 8080;

// ==== MONGO CONNECTION ====
mongoose.connect(
    `mongodb+srv://Main:${process.env.MONGO_PASSWORD}@cluster0.umnlmnl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
)
    .then(async () => {
        console.log("✅ Connected to MongoDB!");

        const db = mongoose.connection.db;
        try {
            await db.collection('users').dropIndex('email_1');
            console.log("❌ Dropped existing index 'email_1'");
        } catch (err) {
            console.log("ℹ️ No existing 'email_1' index to drop.");
        }

        await db.collection('users').createIndex(
            { email: 1 },
            { unique: true, partialFilterExpression: { email: { $type: "string" } } }
        );
        console.log("✅ Partial unique index created on 'email'");
    })
    .catch(err => console.error("❌ Error while connecting to MongoDB:", err));

// ==== MIDDLEWARES ====
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use(helmet());

// Rate limiting, only for /admin routes
const adminLimiter = rateLimit({
    windowMs: 100 * 60 * 1000,
    max: 1100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/admin', adminLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// CSRF protection for state-changing endpoints
const csrfProtection = csrf({ 
    cookie: { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production' 
    }
});

// Passport JWT setup
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_VALUE,
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) return done(null, user);
        return done(null, false);
    } catch (err) {
        return done(err, false);
    }
}));
app.use(passport.initialize());

// === ROUTES ===
app.get("/", (req, res) => res.send("Hello, World!"));

app.use(authRoutes); // Public auth routes
app.use('/admin', adminLimiter, adminAuthRoutes); // Admin routes, rate-limited

// CSRF token endpoint
app.get('/admin/csrf-token', csrfProtection, (req, res) =>
    res.json({ csrfToken: req.csrfToken() })
);

// ==== START SERVER ====
app.listen(port, () => console.log("App is running on port " + port));
