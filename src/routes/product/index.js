"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");

// init router
const router = express.Router();

// authentication
router.use(authentication);

// protected routes
router.post("", asyncHandler(productController.createProduct));

module.exports = router;
