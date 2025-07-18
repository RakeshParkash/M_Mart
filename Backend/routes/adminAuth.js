const express = require('express');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { createAccessToken, createRefreshToken } = require('../utils/helpers');
const router = express.Router();


/* ---------- REGISTER ---------- */
router.post(
    '/register',
    body('phone').isMobilePhone('any').withMessage('Invalid phone'),
    body('password').isStrongPassword().withMessage('Weak password'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
            return res.status(400).json({ 
        errors: errors.array() 
    });

    const { phone, password, masterKey } = req.body;

/* Only an existing admin can create another admin */
    if (!masterKey) 
        return res.status(403).json({ 
            err: 'Master key missing' 
        });

    const parentExists = await Admin.findOne({ 
        role: 'admin' 
    });
    if (parentExists && masterKey !== process.env.ADMIN_MASTER_KEY)
        return res.status(403).json({ 
            err: 'Unauthorized registration' 
        });

    try {
        const admin = await Admin.create({ 
            phone, 
            password 
        });
            return res.status(201).json({ msg: 'Admin created' });
    } 
    catch (err) {
        if (err.code === 11000) 
            return res.status(409).json({ 
                err: 'Phone already exists' 
            });
        return res.status(500).json({ err: 'Server error' });
        }
    });


/* ---------- LOGIN ---------- */
router.post('/login',
        body('phone').isMobilePhone('any'),
        body('password').exists(),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) 
                return res.status(400).json({ 
                    errors: errors.array() 
                });

        const { phone, password } = req.body;
        const admin = await Admin.findOne({ phone });

        if (!admin || !(await admin.comparePassword(password)))
            return res.status(401).json({ err: 'Invalid credentials' });

        const accessToken  = createAccessToken({ 
            id: admin._id, role: admin.role 
        });
        const refreshToken = createRefreshToken({ 
            id: admin._id 
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
/* Store refresh token in httpOnly cookie */
        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        return res.status(200).json({ 
            admin: safeAdmin,
            accessToken 
        });

    });

/* ---------- LOGOUT ---------- */
    router.post('/logout', (req,res)=>{
        res.clearCookie('refreshToken');
        res.json({ msg: 'Logged out' });
    });

router.post('/token', 
    (req,res)=>{
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ 
            err: 'No refresh token' 
        });
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err,payload)=>{
            if (err) return res.status(403).json({ 
                err: 'Invalid refresh token' 
            });
        const newAccess = createAccessToken({ 
            id: payload.id, 
            role: payload.role 
        });
        res.json({ accessToken: newAccess });
    });
});

module.exports = router;