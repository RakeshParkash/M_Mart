const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { getToken } = require("../utils/helpers");
const passport = require("passport");

router.post("/signup",async (req,res) => {

    let { firstName, lastName, email , phone, password } = req.body;
    if (!email || email.trim() === "") {
        email = undefined;
    }
    if (!phone || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ phone : phone });
    if(user) {
        return res
        .status(403)
        .json({ err : "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserData = { 
        firstName, 
        lastName, 
        ...(email && { email }),
        phone,
        password : hashedPassword,
    };
    const newUser = await User.create(newUserData);

    const token = await getToken( phone, newUser);

    const userToReturn = {...newUser.toJSON(), token };
    delete userToReturn.password;
    return res.status(200).json(userToReturn);

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

router.get("/get/me", passport.authenticate("jwt", {session: false}), async (req, res) => {
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

router.get("/get/user/:userId", passport.authenticate("jwt", {session: false}), async (req, res) => {
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

module.exports = router;