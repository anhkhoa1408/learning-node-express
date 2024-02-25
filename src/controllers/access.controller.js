"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    return new SuccessResponse({
      message: "Refresh token successfully!",
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    }).send(res);
  };

  logout = async (req, res, next) => {
    return new SuccessResponse({
      message: "Logout successfully!",
      metadata: await AccessService.logout({
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  login = async (req, res, next) => {
    return new SuccessResponse({
      message: "Login successfully!",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  signup = async (req, res, next) => {
    return new CREATED({
      message: "Registered successfully!",
      metadata: await AccessService.signup(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
