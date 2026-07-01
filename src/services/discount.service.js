"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const {
  findAllDiscountCodesUnSelect,
  updateDiscountById,
  checkDiscountExists,
} = require("../models/repositories/discount.repos");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectId, removeInvalidPropsInObject } = require("../utils");

/**
 * Discount services
 * 1 - Generator discount code [Shop | Admin]
 * 2 - Get discount amount [User]
 * 3 - Get all discount codes [User | Shop]
 * 4 - Verify discount code [User]
 * 5 - Delete discount code [Shop | Admin]
 * 6 - Cancel discount code [User]
 */

class DiscountService {
  static async checkValidDiscount(code, shopId) {
    const foundDiscount = await checkDiscountExists(discount, {
      discount_code: code,
      discount_shopId: convertToObjectId(shopId),
    });

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount existed");
    }

    return foundDiscount;
  }

  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      users_used,
      max_uses,
      uses_count,
      max_uses_per_user,
    } = payload;

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Invalid date");
    }

    await this.checkValidDiscount(code, shopId);

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: convertToObjectId(shopId),
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  static async updateDiscountCode(id, payload) {
    const finalPayload = removeInvalidPropsInObject(payload);

    if (
      (finalPayload.start_date && new Date() < new Date(finalPayload.start_date)) ||
      (finalPayload.end_date && new Date() > new Date(finalPayload.end_date))
    ) {
      throw new BadRequestError("Invalid date");
    }

    const updatedDiscount = await updateDiscountById({
      id: convertToObjectId(id),
      payload: finalPayload,
      model: discount,
      isNew: true,
    });

    if (!updatedDiscount) {
      throw new BadRequestError("Not found");
    }

    return updatedDiscount;
  }

  static async getAllDiscountCodesWithProduct({ code, shopId, userId, limit, page }) {
    const { discount_applies_to, discount_type } = this.checkValidDiscount(code, shopId);

    let products;
    if (discount_type === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_type === "specific") {
      products = await findAllProducts({
        filter: {
          _id: {
            $in: discount_applies_to,
          },
          product_shop: convertToObjectId(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime", // latest
        select: ["product_name"],
      });
    }

    return products;
  }

  static async getAllDiscountCodesByShop({ shopId, limit, page }) {
    return await findAllDiscountCodesUnSelect({
      filter: {
        discount_shopId: convertToObjectId(shopId),
        discount_is_active: true,
      },
      limit: +limit,
      page: +page,
      sort: "ctime",
      unSelect: ["__v", "discount_shopId"],
      model: discount,
    });
  }

  /**
   * Apply discount code to order
   * products [
   *  { productId, quantity, shopId, price, name },
   * ]
   */
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        _id: convertToObjectId(codeId),
        discount_shopId: convertToObjectId(shopId),
        discount_is_active: true,
      },
      model: discount,
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount code not found");
    }

    const { discount_is_active, discount_max_uses, discount_start_date, discount_end_date } = foundDiscount;

    if (!discount_is_active) {
      throw new BadRequestError("Discount code is not active");
    }

    if (!discount_max_uses) {
      throw new BadRequestError("Discount code has reached its maximum uses");
    }

    if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
      throw new BadRequestError("Discount code is not valid at this time");
    }
  }
}

module.exports = DiscountService;
