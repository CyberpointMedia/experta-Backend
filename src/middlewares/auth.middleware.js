var jwt = require("jsonwebtoken");
const config = require("../config/config");

const createResponse = require("../utils/response");
const User = require("../models/user.model");

const globalConstants = require("../constants/global-constants");

module.exports.authMiddleware = function (req, res, next) {
  if (
    !req.headers.authorization ||
    "" == req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    res.status(403);
    res.send(
      createResponse.unauthorized(
        globalConstants.TOKEN_ISSUE_CODE,
        "You are unauthorized.",
        "Not a valid token or token is empty."
      )
    );
    return;
  }
  try {
    let authToken = req.headers.authorization.split(" ");
    jwt.verify(authToken[1], config.jwt.secret, async function (err, decoded) {
      if (err) {
        res.status(403);
        res.send(
          createResponse.unauthorized(
            globalConstants.TOKEN_ISSUE_CODE,
            "You are unauthorized.",
            "Not a valid token or token is expired."
          )
        );
        return;
      }
      let user =  await User.findById(decoded._id);
      if (
        !user ||
        (decoded.phoneNo && user.phoneNo != decoded.phoneNo) ||
        (decoded.id && user.id != decoded.id)
      ) {
        res.status(403);
        res.send(
          createResponse.unauthorized(
            globalConstants.TOKEN_ISSUE_CODE,
            "You are unauthorized.",
            "Invalid user or user does not exist."
          )
        );
        return;
      }
      req.body["user"] = decoded;
      next();
    });
  } catch (e) {
    console.log(e);
    res.status(403);
    res.send(
      createResponse.unauthorized(
        globalConstants.TOKEN_ISSUE_CODE,
        "You are unauthorized.",
        e.message
      )
    );
    return;
  }
};
