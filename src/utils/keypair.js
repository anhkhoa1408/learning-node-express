"use strict";

const crypto = require("node:crypto");

const generateKeyPair = () => {
  const publicKey = crypto.randomBytes(64).toString("hex");
  const privateKey = crypto.randomBytes(64).toString("hex");
  return {
    publicKey,
    privateKey,
  };
};

module.exports = {
  generateKeyPair,
};
