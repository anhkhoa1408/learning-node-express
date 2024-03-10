"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.strategy.service");

class ProductController {
  createProduct = async (req, res, next) => {
    return new SuccessResponse({
      message: "Create product successfully!",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
