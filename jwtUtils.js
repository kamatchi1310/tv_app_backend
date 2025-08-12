const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (payload) => {
  const secretKey = process.env.JWT_SECRET;
  const options = {
    expiresIn: "24h",
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
};

module.exports = {
  generateToken,
};
