"use strict";

const { Types } = require("mongoose");
const { product } = require("./../product.model");
const { getSelectData, unGetSelectData } = require("../../utils");

/**
 * Repositories Pattern:
 * This pattern separates all database logic from the service layer.
 * The service layer only calls these functions and handles business logic,
 * while the repository handles direct interactions with the database.
 */

// Get all draft products for a shop
const findAllDraftsForShop = async ({ query, limit = 50, skip = 0 }) => {
  return await queryProduct({ query, limit, skip });
};

// Get all published products for a shop
const findAllPublishForShop = async ({ query, limit = 50, skip = 0 }) => {
  return await queryProduct({ query, limit, skip });
};

// Get all products with optional filters, pagination, sorting, and field selection
const findAllProducts = async ({ limit, page, sort, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 }; // Sort by creation time
  const products = await product.find(filter).skip(skip).limit(limit).sort(sortBy).select(getSelectData(select)).lean();
  return products;
};

// Find a product by its ID, with optional field exclusion
const findProduct = async ({ product_id, unSelect }) => {
  return await product.findById(new Types.ObjectId(product_id)).select(unGetSelectData(unSelect)).lean();
};

// Update a product by its ID
const updateProductById = async ({ productId, payload, model, isNew = true }) => {
  return await model.findByIdAndUpdate(productId, payload, {
    new: isNew,
  });
};

// Query products with pagination, sorting, and shop population
const queryProduct = async ({ query, limit = 50, skip = 0 }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  /**
   * Why use .exec()?
   * Mongoose operations like find(), findOne(), etc., return thenable objects, not real Promises.
   * To ensure proper Promise behavior, especially when using async/await, it's best to call .exec().
   * Note: .exec() is optional for most read operations but good practice when consistency is needed.
   */
};

// Mark a product as published for a specific shop
const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    _id: new Types.ObjectId(product_id),
    product_shop: new Types.ObjectId(product_shop),
  });

  if (!foundShop) return null;

  foundShop.isPublished = true;
  foundShop.isDraft = false;

  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

// Mark a product as unpublished (draft) for a specific shop
const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    _id: new Types.ObjectId(product_id),
    product_shop: new Types.ObjectId(product_shop),
  });

  if (!foundShop) return null;

  foundShop.isPublished = false;
  foundShop.isDraft = true;

  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

// Full-text search for products by user search key
const searchProductByUser = async ({ keySearch }) => {
  const searchRegex = new RegExp(keySearch);
  return await product
    .find(
      {
        isPublished: true,
        $text: {
          $search: searchRegex,
        },
      },
      {
        score: {
          $meta: "textScore",
        },
      },
    )
    .lean();
};

module.exports = {
  findAllDraftsForShop,
  findAllPublishForShop,
  findAllProducts,
  findProduct,
  updateProductById,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
};
