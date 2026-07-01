import type { Types } from "mongoose";
import keyTokenModel from "../models/keyToken.model";
import type { KeyTokenAttrs, KeyTokenDocument, ObjectIdLike } from "../types/domain";

interface CreateKeyTokenInput {
  userId: ObjectIdLike;
  publicKey: string;
  privateKey: string;
  refreshToken?: string;
}

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken = "",
  }: CreateKeyTokenInput): Promise<string | null> => {
    const filter = {
      user: userId,
    };
    const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken };
    const options = { upsert: true, new: true };

    const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);
    return tokens ? tokens.publicKey : null;
  };

  static findByUserId = async (userId: ObjectIdLike): Promise<KeyTokenDocument | null> =>
    keyTokenModel.findOne({ user: userId });

  static removeKeyById = async (keyStoreId: Types.ObjectId | string): Promise<unknown> =>
    keyTokenModel.deleteOne({
      _id: keyStoreId,
    });

  static findByRefreshTokenUsed = async (refreshToken: string): Promise<KeyTokenAttrs | null> =>
    keyTokenModel
      .findOne({
        refreshTokensUsed: refreshToken,
      })
      .lean<KeyTokenAttrs>()
      .exec();

  static deleteKeyById = async (userId: ObjectIdLike): Promise<unknown> =>
    keyTokenModel.deleteOne({
      user: userId,
    });

  static findByRefreshToken = async (refreshToken: string): Promise<KeyTokenDocument | null> =>
    keyTokenModel.findOne({
      refreshToken,
    });
}

export default KeyTokenService;
