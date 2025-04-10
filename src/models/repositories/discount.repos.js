"use strict";

const discount = require("./../discount.model");
const { unGetSelectData, getSelectData } = require("./../../utils/index");

const findAllDiscountCodesUnSelect = async ({ limit = 50, page = 1, sort, filter, unSelect }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 }; // creation time;
  const discounts = await discount
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortBy)
    .select(unGetSelectData(unSelect))
    .lean();
  return discounts;
};

const findAllDiscountCodesSelect = async ({ limit = 50, page = 1, sort, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 }; // creation time;
  const discounts = await discount
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortBy)
    .select(getSelectData(select))
    .lean();
  return discounts;
};

const updateDiscountById = async ({ id, payload, isNew = true }) => {
  return await discount.findByIdAndUpdate(id, payload, {
    new: isNew,
  });
};

module.exports = {
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect,
  updateDiscountById,
};
