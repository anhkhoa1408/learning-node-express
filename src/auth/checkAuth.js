"use strict";

// const apikeyModel = require("../models/apikey.model");
const { findById } = require("../services/apiKey.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "refreshtoken",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
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
  } catch (error) {}
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    const validPersmission = req.objKey.permissions.includes(permission);
    if (!validPersmission) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    return next();
  };
};

module.exports = {
  apiKey,
  permission,
  HEADER,
};
