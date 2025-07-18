const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const adminAuthRoutes = require('./routes/adminAuth');

const helmet   = require('helmet');
const rateLimit= require('express-rate-limit');
const cookie   = require('cookie-parser');
const csrf     = require('csurf');

const port = process.env.PORT || 8080;

app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));



/* ---------- security headers ---------- */
app.use(helmet());
/* ---------- rate limiting ---------- */
const limiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 min
max: 20,                  // 20 requests / window
standardHeaders: true,
legacyHeaders: false,
});
app.use('/admin', limiter);
/* ---------- body parser & cookie ---------- */
app.use(express.json({ limit: '10kb' }));
app.use(cookie());
/* ---------- CSRF (state-changing routes only) ---------- */
    const csrfProtection = csrf({ 
        cookie: { 
            httpOnly: true, 
            secure: process.env.NODE_ENV==='production' 
        } 
    });

const protectedRouter = express.Router();
protectedRouter.use(csrfProtection);


const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

app.use(express.json());
require("dotenv").config();

mongoose.connect(
    "mongodb+srv://Main:" +
    process.env.MONGO_PASSWORD +
    "@cluster0.umnlmnl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {}
)
.then(async () => {
    console.log("✅ Connected to MongoDB!");
    
    const db = mongoose.connection.db;
    
    // Try to drop index if it exists
    try {
        await db.collection('users').dropIndex('email_1');
        console.log("❌ Dropped existing index 'email_1'");
    } catch (err) {
        console.log("ℹ️ No existing 'email_1' index to drop.");
    }

    // Create the partial unique index
    await db.collection('users').createIndex(
        { email: 1 },
        {
            unique: true,
            partialFilterExpression: { email: { $type: "string" } }

        }
    );
    console.log("✅ Partial unique index created on 'email'");
})
.catch((err) => {
    console.error("❌ Error while connecting to MongoDB:", err);
});



    

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.TOKEN_VALUE;

passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
try {
    const user = await User.findOne({ _id: jwt_payload.id });
    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
} catch (err) {
    return done(err, false);
}
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/",(req,res) => {
    res.send("Hello , World!");

}); 

app.use("", authRoutes);
protectedRouter.use('/admin', adminAuthRoutes);
app.use(protectedRouter);
app.get('/admin/csrf-token', csrfProtection, (req,res)=> 
    res.json({ csrfToken: req.csrfToken()
    }));

app.listen(port , () => {
    console.log("App is running on port http://localhost:8080: " + port);
});

