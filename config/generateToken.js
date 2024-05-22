const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, "chatapp", {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
