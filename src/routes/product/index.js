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
router.post("/publish/:id", asyncHandler(productController.publishProductByShop));
router.post("/unpublish/:id", asyncHandler(productController.unPublishProductByShop));

// QUERY //
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get("/publish/all", asyncHandler(productController.getAllPublishForShop));

module.exports = router;
