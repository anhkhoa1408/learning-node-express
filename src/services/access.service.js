"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/auth.utils");
const { getInfoData } = require("./../utils");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signup = async ({ name, email, password, roles }) => {
    try {
      const holderShop = await shopModel.findOne({ email }).lean();
      // lean vs not lean
      // => lean will return javascript object
      // => not lean will return mongodb object with larger size

      if (holderShop) {
        return {
          code: "xxxx",
          message: "Shop already registered",
        };
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
        const publicKey = crypto.randomBytes(64).toString("hex");
        console.log("signup= - publicKey:", publicKey);
        const privateKey = crypto.randomBytes(64).toString("hex");
        console.log("signup= - privateKey:", privateKey);

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });
        console.log("signup= - keyStore:", keyStore);

        if (!keyStore) {
          return {
            code: "xxxx",
            message: "Shop already registered",
          };
        }

        // const publicKeyObject = crypto.createPublicKey(publicKeyString);

        const tokens = await createTokenPair(
          {
            userId: newShop._id,
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
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
