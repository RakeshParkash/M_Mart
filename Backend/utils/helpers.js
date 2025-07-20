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

    const verifyToken = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token provided" });

        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) return res.status(403).json({ message: "Invalid token" });

          req.user = decoded; // contains user.id and role (admin/user)
          next();
        });
      };

      const isAdmin = (req, res, next) => {
        if (!req.user || req.user.role !== "admin") {
          return res.status(403).json({ message: "Forbidden" });
        }
        next();
      };

      const validateBody = (req, res, next) => {
        const b = req.body;

        if (
          !b.name || !b.description || !b.quantity_Unit || !b.image || !b.category ||
          !b.stock || typeof b.stock !== "object" ||
          !["packet", "weight"].includes(b.stock.type) ||
          typeof b.stock.value !== "number" ||
          !b.stock.unit ||
          !b.selling_Price || typeof b.selling_Price !== "object" ||
          typeof b.selling_Price.price !== "number" || !b.selling_Price.unit ||
          !b.buying_Price || typeof b.buying_Price !== "object" ||
          typeof b.buying_Price.price !== "number" || !b.buying_Price.unit
        ) {
          return res.status(400).json({ message: "Invalid or missing product data" });
        }

        next();
      };




  module.exports = { createAccessToken, createRefreshToken , getToken , verifyToken , isAdmin , validateBody };