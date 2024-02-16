"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/auth.utils");
const { getInfoData } = require("./../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const { generateKeyPair } = require("../utils/keypair");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /* 
    1/ check email in dbs
    2/ match password
    3/ create AT & RT
    4/ generate tokens
    5/ get data return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    // 1/
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered!");
    }

    // 2.
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authentication error");
    }

    // 3.
    const { publicKey, privateKey } = generateKeyPair();

    // 4.
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      publicKey,
      privateKey,
    );

    await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      code: 200,
      metadata: {
        shop: getInfoData({ fields: ["_id", "name", "email"], object: foundShop }),
        tokens,
      },
    };
  };

  static signup = async ({ name, email, password, roles }) => {
    const holderShop = await shopModel.findOne({ email }).lean();
    // lean vs not lean
    // => lean will return javascript object
    // => not lean will return mongodb object with larger size

    if (holderShop) {
      throw new BadRequestError("Shop already registered!");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey: signed token, publicKey: verify token

      // SOLUTION 1: for large project
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });

      // SOLUTION 2: for normal project
      const { publicKey, privateKey } = generateKeyPair();

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Keystore error!");
      }

      // const publicKeyObject = crypto.createPublicKey(publicKeyString);

      const tokens = await createTokenPair(
        {
          user: newShop._id,
          email,
        },
        publicKey,
        privateKey,
      );

      return {
        code: 200,
        metadata: {
          shop: getInfoData({ fields: ["_id", "name", "email"], object: newShop }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
