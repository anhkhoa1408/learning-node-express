"use strict";

const { filter } = require("lodash");
const { unGetSelectData, getSelectData } = require("./../../utils/index");

const findAllDiscountCodesUnSelect = async ({ limit = 50, page = 1, sort, filter, unSelect, model }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 }; // creation time;
  const discounts = await model
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortBy)
    .select(unGetSelectData(unSelect))
    .lean();
  return discounts;
};

const findAllDiscountCodesSelect = async ({ limit = 50, page = 1, sort, filter, select, model }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 }; // creation time;
  const discounts = await model.find(filter).skip(skip).limit(limit).sort(sortBy).select(getSelectData(select)).lean();
  return discounts;
};

const updateDiscountById = async ({ id, payload, isNew = true, model }) => {
  return await model.findByIdAndUpdate(id, payload, {
    new: isNew,
  });
};

const checkDiscountExists = async ({ filter, model }) => {
  const foundDiscount = await model.findOne(filter).lean();
  return foundDiscount;
};

module.exports = {
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect,
  updateDiscountById,
  checkDiscountExists,
};
