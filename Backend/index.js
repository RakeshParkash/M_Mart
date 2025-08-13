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
const productRoutes = require('./routes/product');
const contactRoutes = require('./routes/contact');

const Admin = require('./models/Admin');
const User = require('./models/User');

const port = process.env.PORT || 8080;

// ==== MONGO CONNECTION ====
mongoose.connect(
    `mongodb+srv://Main:${process.env.MONGO_PASSWORD}@cluster0.umnlmnl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
)
    .then(async () => {
        console.log("Connected to MongoDB!");

        const db = mongoose.connection.db;
        try {
            await db.collection('users').dropIndex('email_1');
            console.log(" Dropped existing index 'email_1'");
        } catch (err) {
            console.log("ℹNo existing 'email_1' index to drop.");
        }

        await db.collection('users').createIndex(
            { email: 1 },
            { unique: true, partialFilterExpression: { email: { $type: "string" } } }
        );
        console.log(" Partial unique index created on 'email'");
    })
    .catch(err => console.error(" Error while connecting to MongoDB:", err));

// ==== MIDDLEWARES ====
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: ["http://localhost:5173", "https://m-mart-eight.vercel.app"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use(helmet());

// Rate limiting, only for /admin routes
const adminLimiter = rateLimit({
    windowMs: 1000 * 60 * 1000,
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/admin', adminLimiter);


// Passport JWT setup
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_VALUE,
};

passport.use('user-jwt', new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) return done(null, user);
        return done(null, false);
    } catch (err) {
        return done(err, false);
    }
}));

passport.use('admin-jwt', new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const admin = await Admin.findById(jwt_payload.id);
        if (admin) return done(null, admin);
        return done(null, false);
    } catch (err) {
        return done(err, false);
    }
}));

// CSRF protection for state-changing endpoints
const csrfProtection = csrf({ 
    cookie: { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production' 
    }
});
app.use(passport.initialize());

// CSRF token endpoint
app.get('/admin/csrf-token', csrfProtection, (req, res) =>
    res.json({ csrfToken: req.csrfToken() })
);

// === ROUTES ===
app.get("/", (req, res) => res.send("Hello, World!"));

app.use(authRoutes); // Public auth routes
app.use('/admin',  adminAuthRoutes); // Admin routes, rate-limited
app.use("/products", productRoutes);
app.use("/contact", contactRoutes);
// ==== START SERVER ====
app.listen(port, () => console.log("App is running on port " + port));
