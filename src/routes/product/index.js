"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

// init router
const router = express.Router();

// public routes - this route will not be restricted by authentication
router.get("", asyncHandler(productController.findAllProducts));
router.get("/:id", asyncHandler(productController.findProduct));
router.get("/search/:key", asyncHandler(productController.searchProductsByUser));

// authentication
router.use(authenticationV2);

// protected routes
router.post("", asyncHandler(productController.createProduct));
router.post("/publish/:id", asyncHandler(productController.publishProductByShop));
router.post("/unpublish/:id", asyncHandler(productController.unPublishProductByShop));
router.patch("/:id", asyncHandler(productController.updateProduct));

// QUERY //
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get("/publish/all", asyncHandler(productController.getAllPublishForShop));

module.exports = router;
