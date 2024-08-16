"use strict";

const { HEADER } = require("../auth/checkAuth");
const { SuccessResponse } = require("../core/success.response");

// Solution 1: Implement using factory pattern
// const ProductService = require("../services/product.factory.service");

// Solution 2: Implement using strategy pattern
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

  /**
   *
   * @description Get all Drafts for shop
   * @param {Number} limit
   * @param {Number} skip
   * @returns {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Get list draft products successfully!",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.headers[HEADER.CLIENT_ID],
        limit: 50,
        skip: 0,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
