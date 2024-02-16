"use strict";

const { CREATED } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signup = async (req, res, next) => {
    return new CREATED({
      message: "Registered successfully!",
      metadata: await AccessService.signup(req.body),
    }).send(res);
    // return res.status(200).json(await AccessService.signup(req.body));
  };
}

module.exports = new AccessController();
