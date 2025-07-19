const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { createAccessToken, createRefreshToken } = require('../utils/helpers');
const passport = require('passport');

const router = express.Router();

// Middleware: check masterKey OR logged-in admin
const adminOrMasterKey = async (req, res, next) => {
    const { masterKey } = req.body;
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
        // Bootstrapping first admin
        if (!masterKey || masterKey !== process.env.ADMIN_MASTER_KEY) {
            return res.status(403).json({ err: 'Invalid master key' });
        }
        return next();
    } else {
        // For subsequent admins, require authentication
        passport.authenticate('jwt', { session: false }, (err, user) => {
            if (err || !user || user.role !== 'admin') {
                return res.status(403).json({ err: 'Admin privileges required' });
            }
            req.user = user;
            return next();
        })(req, res, next);
    }
};

/* ---------- REGISTER ---------- */
router.post(
    '/register',
    body('phone').isMobilePhone('any').withMessage('Invalid phone number'),
    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage('Weak password'),
    adminOrMasterKey,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone, password , email, firstName, lastName} = req.body;

          if (!phone || !password || !email || !firstName || !lastName)
                return res.status(400).json({ error: "Phone, email,  password, firstName and lastName are required" });

        try {
            // Check if phone already exists
            const exists = await Admin.findOne({ phone });
            if (exists) {
                return res.status(409).json({ err: 'Phone already exists' });
            }

                    const admin = await Admin.create({
                        firstName,
                        lastName,
                        ...(email && { email }),
                        phone,
                        password
                    });
            return res.status(201).json({ msg: 'Admin created successfully' });
        } catch (err) {
            console.error('Admin registration error:', err);
            return res.status(500).json({ err: 'Server error' });
        }
    }
);

/* ---------- LOGIN ---------- */
router.post(
    '/login',
    body('phone').isMobilePhone('any'),
    body('password').exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const { phone, password } = req.body;
        const admin = await Admin.findOne({ phone });

        if (!admin || !(await admin.comparePassword(password)))
            return res.status(401).json({ err: 'Invalid credentials' });

        const accessToken  = createAccessToken({ id: admin._id, role: admin.role });
        const refreshToken = createRefreshToken({ id: admin._id });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        return res.status(200).json({
            admin: safeAdmin,
            accessToken
        });
    }
);

/* ---------- LOGOUT ---------- */
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ msg: 'Logged out' });
});

/* ---------- ACCESS TOKEN REFRESH ---------- */
router.post('/token', (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ err: 'No refresh token' });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err)
            return res.status(403).json({ err: 'Invalid refresh token' });

        // Provide role info if needed
        const newAccess = createAccessToken({ id: payload.id, role: payload.role });
        res.json({ accessToken: newAccess });
    });
});

// Admin profile
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const admin = await Admin.findById(req.user._id).select('-password');
  res.json({ admin });
});

// Add user
router.post('/add-user', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { name, email, phone } = req.body;
  const user = await User.create({ name, email, phone });
  res.json({ user });
});

// Add product
router.post('/add-product', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { name, price, description } = req.body;
  const product = await Product.create({ name, price, description });
  res.json({ product });
});


module.exports = router;
