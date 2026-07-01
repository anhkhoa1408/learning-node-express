import express from "express";
import accessController from "../../controllers/access.controller";
import asyncHandler from "../../helpers/asyncHandler";
import { authenticationV2 } from "../../auth/authUtils";

const router = express.Router();

router.post("/shop/signup", asyncHandler(accessController.signup));
router.post("/shop/login", asyncHandler(accessController.login));

router.use(authenticationV2);

router.post("/shop/logout", asyncHandler(accessController.logout));
router.post("/shop/refresh-token", asyncHandler(accessController.handleRefreshToken));

export default router;
