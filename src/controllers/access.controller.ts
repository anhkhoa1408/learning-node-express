import type { NextFunction, Request, Response } from "express";
import { CREATED, SuccessResponse } from "../core/success.response";
import AccessService from "../services/access.service";
import { requireAuthContext } from "../types/guards";

class AccessController {
  handleRefreshToken = async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken, user, keyStore } = requireAuthContext(req);
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    return new SuccessResponse({
      message: "Refresh token successfully!",
      metadata: await AccessService.handleRefreshTokenV2({
        refreshToken,
        user,
        keyStore,
      }),
    }).send(res);
  };

  logout = async (req: Request, res: Response, _next: NextFunction) => {
    const { keyStore } = requireAuthContext(req);
    return new SuccessResponse({
      message: "Logout successfully!",
      metadata: await AccessService.logout({
        keyStore,
      }),
    }).send(res);
  };

  login = async (req: Request, res: Response, _next: NextFunction) =>
    new SuccessResponse({
      message: "Login successfully!",
      metadata: await AccessService.login(req.body as { email: string; password: string }),
    }).send(res);

  signup = async (req: Request, res: Response, _next: NextFunction) =>
    new CREATED({
      message: "Registered successfully!",
      metadata: await AccessService.signup(req.body as { name: string; email: string; password: string }),
    }).send(res);
}

export default new AccessController();
