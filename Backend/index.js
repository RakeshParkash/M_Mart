const express = require("express");
const app = express();

const mongoose = require("mongoose");
const passport = require("passport");
const User = require("./models/User");
const authRoutes = require("./routes/auth");

const port = process.env.PORT || 8080;

const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

app.use(express.json());
require("dotenv").config();

// mongoose.connect(
//         "mongodb+srv://Jeevant:" +
//         process.env.MONGO_PASSWORD +
//         "@cluster0.afxf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
//         {}
//     )
//     .then((x) => {
//         console.log("connected to mongo!");
//     })
//     .catch((err) => {
//         console.log("Error while connecting to mongo\n",err);
//     });


    
// let opts = {}
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = "supposedtobesecret";

// passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
//     try {
//         const user = await User.findOne({ _id: jwt_payload.id });
//         if (user) {
//             return done(null, user);
//         } else {
//             return done(null, false);
//         }
//     } catch (err) {
//         return done(err, false);
//     }
// }));




app.get("/",(req,res) => {
    res.send("Hello , World!");

}); 

// app.use("/auth", authRoutes);
app.listen(port , () => {
    console.log("App is running on port http://localhost:8080: " + port);
});
