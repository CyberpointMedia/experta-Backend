var jwt = require("jsonwebtoken");
const config = require("../config/config");

/* 604800 = 7 * 24 * 60 * 60 for 7 days */
const tokenExpires = 604800;

module.exports.generateToken = function (dataToEncrypt) {
  var token = jwt.sign(dataToEncrypt.toObject(), config.jwt.secret, {
    expiresIn: tokenExpires, // expires in 24 hours
  });

  return token;
};
