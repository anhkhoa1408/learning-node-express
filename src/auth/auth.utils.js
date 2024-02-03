"use strict";

const JWT = require("jsonwebtoken");

const createTokenPair = async (payload, publicKey, privateKey) => {
  // create access token
  const accessToken = JWT.sign(payload, privateKey, {
    // algorithm: "RS256",
    expiresIn: "2 days",
  });

  // create refresh token
  const refreshToken = JWT.sign(payload, privateKey, {
    // algorithm: "RS256",
    expiresIn: "7 days",
  });

  // verify
  JWT.verify(accessToken, publicKey, (err, decode) => {
    if (err) {
      console.error("Error ", err);
    } else {
      console.log("Decode ", decode);
    }
  });

  return { accessToken, refreshToken };
};

module.exports = {
  createTokenPair,
};
