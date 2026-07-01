import type { NextFunction, Request, RequestHandler, Response } from "express";
import { findById } from "../services/apikey.service";
import type { ApiKeyPermission } from "../types/domain";

export const HEADER = {
  apiKey: "x-api-key",
  clientId: "x-client-id",
  authorization: "authorization",
  refreshToken: "refreshtoken",
} as const;

export const apiKey: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers[HEADER.apiKey]?.toString();
    if (!key) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden error",
      });
    }

    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden error",
      });
    }

    req.objKey = objKey;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const permission = (permissionCode: ApiKeyPermission): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.objKey?.permissions) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    const validPermission = req.objKey.permissions.includes(permissionCode);
    if (!validPermission) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    return next();
  };
};
