"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("./../helpers/asyncHandler");
const { HEADER } = require("./checkAuth");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
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
  if (!userId) throw new AuthFailureError("Invalid user");

  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Invalid request");

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid authorization");

  try {
    const decodeUser = JWT.decode(accessToken, keyStore.publicKey);
    console.log("authentication - accessToken:", accessToken);
    console.log("authentication - decodeUser:", decodeUser);
    if (userId !== decodeUser.userId) throw new AuthFailureError("Invalid userId");

    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = (token, keySecret) => {
  return JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
