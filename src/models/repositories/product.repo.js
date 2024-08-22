"use strict";

const { Types } = require("mongoose");
const { product, clothing, electronic, furniture } = require("./../product.model");

// This is repositories pattern - this pattern will split all the logic from service class, service will only call
// function and get the result, then communicate with controller

const findAllDraftsForShop = async ({ query, limit = 50, skip = 0 }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit = 50, skip = 0 }) => {
  return await queryProduct({ query, limit, skip });
};

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

const queryProduct = async ({ query, limit = 50, skip = 0 }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  // Why using exec, because mongoose operation do not return Promise, they return thenable,
  // so if we want to really return promise, use exec instead
  // For findOne, findById, find, exec is optional
};

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
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
};
