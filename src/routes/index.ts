import express from "express";
import { apiKey, permission } from "../auth/checkAuth";
import accessRouter from "./access";
import productRouter from "./product";

const router = express.Router();

router.use(apiKey);
router.use(permission("0000"));

router.use("/v1/api/product", productRouter);
router.use("/v1/api", accessRouter);

export default router;
