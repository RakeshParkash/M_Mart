// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const bcrypt = require("bcrypt");
// const { getToken } = require("../utils/helpers") 

// router.post("/register",async (req,res) => {

//     const { email, password, firstName, lastName, userName } = req.body;
    
//     if (!email || !password || !firstName || !lastName || !userName) {
//         return res.status(400).json({ error: "All fields are required" });
//     }

//     const user = await User.findOne({ email : email });
//     if(user) {
//         return res
//         .status(403)
//         .json({ err : "A user with this email already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUserData = { 
//         email, 
//         password : hashedPassword,
//         firstName, 
//         lastName, 
//         userName ,
//     };
//     const newUser = await User.create(newUserData);

//     const token = await getToken(email, newUser);

//     const userToReturn = {...newUser.toJSON(), token };
//     delete userToReturn.password;
//     return res.status(200).json(userToReturn);

// });

// router.post("/login", async (req,res) => {
//     const { email, password } =req.body;

//     const user = await User.findOne({ email : email });
//     if(!user){
//         return res.status(401).json({ err : "Invalid credentials" });
//     }

//     const isPasswordValid = await bcrypt.compare( password,user.password );
//     if(!isPasswordValid){
//         return res.status(401).json({ err : "Invalid credentials" });
//     }

//     const token = await getToken(user.email, user);
//     const userToReturn = { ...newUser.toJSON(), token};
//     delete userToReturn.password;
//     return res.status(200).json(userToReturn);

// });

// module.exports = router;