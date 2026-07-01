import express from "express";
import productController from "../../controllers/product.controller";
import asyncHandler from "../../helpers/asyncHandler";
import { authenticationV2 } from "../../auth/authUtils";

const router = express.Router();

router.get("", asyncHandler(productController.findAllProducts));
router.get("/search/:key", asyncHandler(productController.searchProductsByUser));
router.get("/:id", asyncHandler(productController.findProduct));

router.use(authenticationV2);

router.post("", asyncHandler(productController.createProduct));
router.post("/publish/:id", asyncHandler(productController.publishProductByShop));
router.post("/unpublish/:id", asyncHandler(productController.unPublishProductByShop));
router.patch("/:id", asyncHandler(productController.updateProduct));

router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get("/publish/all", asyncHandler(productController.getAllPublishForShop));

export default router;
