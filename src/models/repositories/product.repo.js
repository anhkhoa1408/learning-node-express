"use strict";

const { product, clothing, electronic, furniture } = require("./../product.model");

const findAllDraftsForShop = async ({ query, limit = 50, skip = 0 }) => {
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

module.exports = {
  findAllDraftsForShop,
};
