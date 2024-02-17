"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("./../helpers/asyncHandler");
const { HEADER } = require("./checkAuth");
const { AuthFailureError } = require("../core/error.response");
const KeyTokenService = require("../services/keyToken.service");

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

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new AuthFailureError("Invalid request");
});

module.exports = {
  createTokenPair,
};
