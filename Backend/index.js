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
const adminFeaturesRoutes = require('./routes/adminFeatures');
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
            { unique: true, partialFilterExpression: { email: { $type: "string", $gt: "" } } }
        );
        console.log(" Partial unique index created on 'email' ");
    })
    .catch(err => console.error(" Error while connecting to MongoDB:", err));

// ======================= MIDDLEWARES ===========================
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS to allow mobile and web requests
app.use(cors({
    origin: function(origin, callback) {
        // Allowed origins for web
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://m-mart-eight.vercel.app"
        ];
        
        // Allow requests with no origin (mobile apps, curl requests, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // In production, be more restrictive. For now, log and allow
            console.log("[CORS] Request from origin:", origin);
            callback(null, true); // Allow for now to support mobile
        }
    },
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["X-Total-Count"]
}));

app.use(helmet());

// Rate limiting, only for /admin routes
const adminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/admin', adminLimiter);


// Passport JWT setup
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
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

// ========================== ROUTES ================================
app.get("/", (req, res) => res.send("Hello, World!"));

app.use(authRoutes); // Public auth routes
app.use('/admin',  adminAuthRoutes); // Admin routes, rate-limited
app.use('/admin',  adminFeaturesRoutes); // Admin features
app.use("/products", productRoutes);
app.use("/contact", contactRoutes);
// ========================= START SERVER ==========================
app.listen(port, () => console.log("App is running on port " + port));
