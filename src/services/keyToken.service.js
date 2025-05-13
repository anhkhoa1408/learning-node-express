"use strict";

const keyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      const filter = {
          user: userId,
        },
        update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken },
        options = { upsert: true, new: true };

      const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({ user: userId });
  };

  static removeKeyById = async (keyStoreId) => {
    return await keyTokenModel
      .deleteOne({
        _id: keyStoreId,
      })
      .lean();
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel
      .findOne({
        refreshTokensUsed: refreshToken,
      })
      .lean();
  };

  static deleteKeyById = async (userId) => {
    return await keyTokenModel
      .deleteOne({
        user: userId,
      })
      .lean();
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({
      refreshToken,
    });
  };
}

module.exports = KeyTokenService;
