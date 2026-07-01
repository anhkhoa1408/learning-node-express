import type { NextFunction, Request, RequestHandler, Response } from "express";
import JWT, { type JwtPayload } from "jsonwebtoken";
import asyncHandler from "../helpers/asyncHandler";
import { HEADER } from "./checkAuth";
import { AuthFailureError, ForbiddenError, NotFoundError } from "../core/error.response";
import KeyTokenService from "../services/keyToken.service";
import type { AuthJwtPayload, TokenPair } from "../types/domain";

const isAuthJwtPayload = (payload: string | JwtPayload): payload is AuthJwtPayload =>
  typeof payload !== "string" && typeof payload.userId === "string" && typeof payload.email === "string";

export const createTokenPair = (
  payload: AuthJwtPayload,
  publicKey: string,
  privateKey: string,
): TokenPair => {
  const accessToken = JWT.sign(payload, privateKey, {
    expiresIn: "2 days",
  });

  const refreshToken = JWT.sign(payload, privateKey, {
    expiresIn: "7 days",
  });

  JWT.verify(accessToken, publicKey, (err, decoded) => {
    if (err || !decoded) {
      throw new ForbiddenError("Something wrong happened, please re-login!");
    }
    console.log("Decode ", decoded);
  });

  return { accessToken, refreshToken };
};

export const verifyJWT = (token: string, keySecret: string): AuthJwtPayload => {
  const decoded = JWT.verify(token, keySecret);
  if (!isAuthJwtPayload(decoded)) {
    throw new AuthFailureError("Invalid token payload");
  }
  return decoded;
};

const getHeaderString = (req: Request, headerName: string): string | undefined => {
  const value = req.headers[headerName];
  return Array.isArray(value) ? value[0] : value;
};

export const authentication: RequestHandler = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const userId = getHeaderString(req, HEADER.clientId);
  if (!userId) throw new AuthFailureError("Invalid user");

  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Invalid request");

  const accessToken = getHeaderString(req, HEADER.authorization);
  if (!accessToken) throw new AuthFailureError("Invalid authorization");

  const decodedUser = verifyJWT(accessToken, keyStore.publicKey);
  if (userId !== decodedUser.userId) throw new AuthFailureError("Invalid userId");

  req.keyStore = keyStore;
  req.user = decodedUser;
  return next();
});

export const authenticationV2: RequestHandler = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const userId = getHeaderString(req, HEADER.clientId);
  if (!userId) throw new AuthFailureError("Invalid user");

  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Invalid request");

  const refreshToken = getHeaderString(req, HEADER.refreshToken);
  if (refreshToken) {
    const decodedUser = verifyJWT(refreshToken, keyStore.publicKey);
    if (userId !== decodedUser.userId) throw new AuthFailureError("Invalid userId");

    req.keyStore = keyStore;
    req.user = decodedUser;
    req.refreshToken = refreshToken;
    return next();
  }

  const accessToken = getHeaderString(req, HEADER.authorization);
  if (!accessToken) throw new AuthFailureError("Invalid authorization");

  const decodedUser = verifyJWT(accessToken, keyStore.publicKey);
  if (userId !== decodedUser.userId) throw new AuthFailureError("Invalid userId");

  req.keyStore = keyStore;
  req.user = decodedUser;
  return next();
});
