"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

// init router
const router = express.Router();

// authentication
router.use(authenticationV2);

// protected routes
router.post("", asyncHandler(productController.createProduct));
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));

module.exports = router;
