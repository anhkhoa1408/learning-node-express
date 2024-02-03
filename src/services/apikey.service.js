"use strict";

const apikeyModel = require("../models/apikey.model");

const findById = async (key) => {
  try {
    const objKey = await apikeyModel.findOne({ key }).lean();
    return objKey;
  } catch (error) {}
};

module.exports = {
  findById,
};
