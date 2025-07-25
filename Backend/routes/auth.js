const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { getToken, verifyToken } = require("../utils/helpers");
const passport = require("passport");

router.post("/signup", async (req, res) => {
  let { firstName, lastName, email, phone, password } = req.body;

  // explicitly set undefined so Mongoose skips the field
  if (!email || email.trim() === "") email = undefined;

  if (!phone || !password || !firstName || !lastName)
    return res.status(400).json({ error: "Phone, password, firstName and lastName are required" });

  const existing = await User.findOne({ phone });
  if (existing) return res.status(409).json({ error: "Phone already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    firstName,
    lastName,
    ...(email && { email }),
    phone,
    password: hashed
  });

  const token = await getToken(phone, newUser);
  const userToReturn = { ...newUser.toJSON(), token };
  delete userToReturn.password;
  return res.status(201).json(userToReturn);
});

router.post("/login", async (req,res) => {
    const { phone, password } =req.body;

    const user = await User.findOne({ phone :phone });
    if(!user){
        return res.status(401).json({ err : "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare( password,user.password );
    if(!isPasswordValid){
        return res.status(401).json({ err : "Invalid credentials" });
    }

    const token = await getToken(user.phone, user);
    const userToReturn = { ...user.toJSON(), token};
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

router.get("/me", verifyToken, passport.authenticate("user-jwt", { session: false }), async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/get/user/:userId", passport.authenticate("user-jwt", { session: false }), async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const authenticate = async (req, res, next) => {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token.' });
        const token = auth.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.TOKEN_VALUE);
            req.user = { id: payload.id };
            next();
        } catch {
            return res.status(401).json({ message: 'Invalid/expired token.' });
        }
    };

router.post('/change-password', authenticate, async (req, res) => {
    
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
        }
        if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized.' });
        }
        // Find user by id from JWT
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
        }

        // Optionally check if new password is strong, not same as old, etc.
        if (newPassword.length <= 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });

        // Hash and set new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password successfully changed.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
    });


module.exports = router;