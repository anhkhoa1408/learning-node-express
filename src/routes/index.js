"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
// init router
const router = express.Router();

// check apikey
router.use(apiKey);

// check valid routes
router.use(permission("0000"));

// routes
router.use("/v1/api/product", require("./product"));
router.use("/v1/api", require("./access"));

module.exports = router;
