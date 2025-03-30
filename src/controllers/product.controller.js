"use strict";

const { HEADER } = require("../auth/checkAuth");
const { SuccessResponse, OK } = require("../core/success.response");

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
   * @description Get all Draft product for shop
   * @param {Number} limit
   * @param {Number} skip
   * @returns {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Get list draft products successfully!",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
        limit: 50,
        skip: 0,
      }),
    }).send(res);
  };

  /**
   *
   * @description Get all Published product for shop
   * @param {Number} limit
   * @param {Number} skip
   * @returns {JSON}
   */
  getAllPublishForShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Get list published products successfully!",
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId,
        limit: 50,
        skip: 0,
      }),
    }).send(res);
  };

  /**
   *
   * @description Get all Products
   * @param {Number} limit
   * @param {Number} page
   * @param {String} sort
   * @param {Object} filter
   * @returns {JSON}
   */
  findAllProducts = async (req, res, next) => {
    return new SuccessResponse({
      message: "Get list products successfully!",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  /**
   *
   * @description Get Product by id
   * @param {String} product_id
   * @returns {JSON}
   */
  findProduct = async (req, res, next) => {
    return new SuccessResponse({
      message: "Get product successfully!",
      metadata: await ProductService.findProduct({
        product_id: req.params.id,
      }),
    }).send(res);
  };

  /**
   * @description Publish a product by shop
   * @param {String} product_id
   * @returns {JSON}
   */
  publishProductByShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Publish product for shop successfully|",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  /**
   * @description Unpublish a product by shop
   * @param {String} product_id
   * @returns {JSON}
   */
  unPublishProductByShop = async (req, res, next) => {
    return new SuccessResponse({
      message: "Unpublish product for shop successfully|",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  /**
   * @description Search product by user
   * @param {String} key
   * @returns {JSON}
   */
  searchProductsByUser = async (req, res, next) => {
    return new OK({
      message: "Success",
      metadata: await ProductService.searchProductByUser({
        keySearch: req.params.key,
      }),
    }).send(res);
  };

  /**
   * @description Update product
   * @param {String} product_id
   * @returns {JSON}
   */
  updateProduct = async (req, res, next) => {
    return new OK({
      message: "Update product successfully",
      metadata: await ProductService.updateProduct(req.body.product_type, req.params.id, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
