const express = require("express");
const app = express();

const mongoose = require("mongoose");
const passport = require("passport");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const cors = require("cors");

const port = process.env.PORT || 8080;

app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));


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
    .then((x) => {
        console.log("connected to mongo!");
    })
    .catch((err) => {
        console.log("Error while connecting to mongo\n",err);
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

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


app.get("/",(req,res) => {
    res.send("Hello , World!");

}); 

app.use("", authRoutes);
app.listen(port , () => {
    console.log("App is running on port http://localhost:8080: " + port);
});
