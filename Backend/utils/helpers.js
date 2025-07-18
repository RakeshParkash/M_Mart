const jwt = require('jsonwebtoken');

function getToken(phone, user) {
  return jwt.sign(
    {
      id: user._id,
      phone: phone
    },
    process.env.TOKEN_VALUE,
    { expiresIn: "7d" }
  );
}

const createAccessToken  = payload =>

  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { 
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN 
  });

  const createRefreshToken = payload =>
  jwt.sign(
    payload, 
    process.env.REFRESH_TOKEN_SECRET, { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN 
    });

  module.exports = { createAccessToken, createRefreshToken , getToken };