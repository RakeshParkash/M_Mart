const jwt = require("jsonwebtoken");

const getToken = async (phone, user) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.TOKEN_VALUE
  );
  return token;
};

module.exports = { getToken };
