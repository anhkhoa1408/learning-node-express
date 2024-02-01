"use strict";

const AccessService = require("../services/access.service");

class AccessController {
  signup = async (req, res, next) => {
    try {
      console.log(`[P]::signUp:`, req.body);
      return res.status(200).json(await AccessService.signup(req.body));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
