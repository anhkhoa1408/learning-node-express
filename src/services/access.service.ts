import bcrypt from "bcrypt";
import shopModel from "../models/shop.model";
import KeyTokenService from "./keyToken.service";
import { createTokenPair, verifyJWT } from "../auth/authUtils";
import { getInfoData } from "../utils";
import { AuthFailureError, BadRequestError, ForbiddenError } from "../core/error.response";
import { findByEmail } from "./shop.service";
import { generateKeyPair } from "../utils/keypair";
import type { AuthJwtPayload, KeyTokenDocument, ShopRole, TokenPair } from "../types/domain";

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
} as const satisfies Record<string, ShopRole>;

interface LoginInput {
  email: string;
  password: string;
  refreshToken?: string | null;
}

interface SignupInput {
  name: string;
  email: string;
  password: string;
  roles?: ShopRole[];
}

interface RefreshTokenV2Input {
  refreshToken: string;
  user: AuthJwtPayload;
  keyStore: KeyTokenDocument;
}

interface LogoutInput {
  keyStore: KeyTokenDocument;
}

interface AuthResponse {
  code: number;
  metadata: {
    shop: Pick<{ _id: unknown; name?: string; email?: string }, "_id" | "name" | "email">;
    tokens: TokenPair;
  } | null;
}

class AccessService {
  static handleRefreshToken = async (refreshToken: string) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
    if (foundToken) {
      const { userId: foundUserId } = verifyJWT(refreshToken, foundToken.privateKey);
      await KeyTokenService.deleteKeyById(foundUserId);
      throw new ForbiddenError("Something wrong happened, please re-login!");
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop not registered");

    const { userId: holderUserId, email: holderEmail } = verifyJWT(refreshToken, holderToken.privateKey);

    const foundShop = await findByEmail({
      email: holderEmail,
    });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    const tokens = createTokenPair(
      {
        userId: holderUserId,
        email: holderEmail,
      },
      holderToken.publicKey,
      holderToken.privateKey,
    );

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user: { userId: holderUserId, email: holderEmail },
      tokens,
    };
  };

  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }: RefreshTokenV2Input) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happened, please re-login!");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registered");
    }

    const foundShop = await findByEmail({
      email,
    });
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    const tokens = createTokenPair(
      {
        userId,
        email,
      },
      keyStore.publicKey,
      keyStore.privateKey,
    );

    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async ({ keyStore }: LogoutInput) => KeyTokenService.removeKeyById(keyStore._id.toString());

  static login = async ({ email, password }: LoginInput): Promise<AuthResponse> => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered!");
    }

    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authentication error");
    }

    const { publicKey, privateKey } = generateKeyPair();

    const userId = foundShop._id.toString();
    const tokens = createTokenPair(
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
        shop: getInfoData({ fields: ["_id", "name", "email"], object: foundShop.toObject() }),
        tokens,
      },
    };
  };

  static signup = async ({ name, email, password }: SignupInput): Promise<AuthResponse> => {
    const holderShop = await shopModel.findOne({ email }).lean().exec();

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
      const { publicKey, privateKey } = generateKeyPair();

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id.toString(),
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Keystore error!");
      }

      const tokens = createTokenPair(
        {
          userId: newShop._id.toString(),
          email,
        },
        publicKey,
        privateKey,
      );

      return {
        code: 200,
        metadata: {
          shop: getInfoData({ fields: ["_id", "name", "email"], object: newShop.toObject() }),
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

export default AccessService;
