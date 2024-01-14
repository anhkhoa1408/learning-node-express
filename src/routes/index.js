"use strict";

const express = require("express");
// init router
const router = express.Router();

router.use("/v1/api", require("./access"));

module.exports = router;
