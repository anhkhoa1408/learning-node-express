"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object }) => {
  return _.pick(object, fields);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeInvalidPropsInObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].filter((item) => item !== null && item !== undefined);
    } else if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      removeInvalidPropsInObject(obj[key]);
    }
  });

  return obj;
};

const flattenObject = (currentObj, finalObj = {}, prevKey = "") => {
  Object.keys(currentObj).forEach((key) => {
    const fullKey = prevKey ? `${prevKey}.${key}` : key;
    if (typeof currentObj[key] === "object" && !Array.isArray(currentObj[key])) {
      flattenObject(currentObj[key], finalObj, fullKey);
    } else {
      finalObj[fullKey] = currentObj[key];
    }
  });
  return finalObj;
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeInvalidPropsInObject,
  flattenObject,
};
