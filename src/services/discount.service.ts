import type { Types, UpdateQuery } from "mongoose";
import { BadRequestError, NotFoundError } from "../core/error.response";
import discount from "../models/discount.model";
import {
  checkDiscountExists,
  findAllDiscountCodesUnSelect,
  updateDiscountById,
} from "../models/repositories/discount.repos";
import { findAllProducts } from "../models/repositories/product.repo";
import { convertToObjectId, removeInvalidPropsInObject } from "../utils";
import type { DiscountAppliesTo, DiscountAttrs, DiscountType } from "../types/domain";

interface CreateDiscountCodeInput {
  code: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  shopId: string;
  minOrderValue?: number;
  productIds?: string[];
  appliesTo: DiscountAppliesTo;
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  usersUsed?: string[];
  maxUses: number;
  usesCount: number;
  maxUsesPerUser: number;
}

type UpdateDiscountCodeInput = Partial<CreateDiscountCodeInput>;

interface DiscountListInput {
  code: string;
  shopId: string;
  userId?: string;
  limit: number;
  page: number;
}

interface ShopDiscountListInput {
  shopId: string;
  limit: number;
  page: number;
}

interface OrderProductInput {
  productId: string;
  quantity: number;
  shopId: string;
  price: number;
  name: string;
}

interface DiscountAmountInput {
  codeId: string;
  userId: string;
  shopId: string;
  products: OrderProductInput[];
}

const toObjectIds = (ids: string[] = []): Types.ObjectId[] => ids.map((id) => convertToObjectId(id));

class DiscountService {
  static async checkValidDiscount(code: string, shopId: string) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discountCode: code,
        discountShopId: convertToObjectId(shopId),
      },
      model: discount,
    });

    if (foundDiscount && foundDiscount.discountIsActive) {
      throw new BadRequestError("Discount existed");
    }

    return foundDiscount;
  }

  static async createDiscountCode(payload: CreateDiscountCodeInput) {
    const {
      code,
      startDate,
      endDate,
      isActive,
      shopId,
      minOrderValue,
      productIds,
      appliesTo,
      name,
      description,
      type,
      value,
      usersUsed,
      maxUses,
      usesCount,
      maxUsesPerUser,
    } = payload;

    if (new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
      throw new BadRequestError("Invalid date");
    }

    await this.checkValidDiscount(code, shopId);

    return discount.create({
      discountName: name,
      discountDescription: description,
      discountType: type,
      discountValue: value,
      discountCode: code,
      discountStartDate: new Date(startDate),
      discountEndDate: new Date(endDate),
      discountMaxUses: maxUses,
      discountUsesCount: usesCount,
      discountUsersUsed: toObjectIds(usersUsed),
      discountMaxUsesPerUser: maxUsesPerUser,
      discountMinOrderValue: minOrderValue || 0,
      discountShopId: convertToObjectId(shopId),
      discountIsActive: isActive,
      discountAppliesTo: appliesTo,
      discountProductIds: appliesTo === "all" ? [] : toObjectIds(productIds),
    });
  }

  static async updateDiscountCode(id: string, payload: UpdateDiscountCodeInput) {
    const finalPayload = removeInvalidPropsInObject(payload as Record<string, unknown>);

    if (
      (finalPayload.startDate && new Date() < new Date(finalPayload.startDate as string | Date)) ||
      (finalPayload.endDate && new Date() > new Date(finalPayload.endDate as string | Date))
    ) {
      throw new BadRequestError("Invalid date");
    }

    const updatePayload: UpdateQuery<DiscountAttrs> = {};
    if (finalPayload.name) updatePayload.discountName = finalPayload.name as string;
    if (finalPayload.description) updatePayload.discountDescription = finalPayload.description as string;
    if (finalPayload.type) updatePayload.discountType = finalPayload.type as DiscountType;
    if (finalPayload.value) updatePayload.discountValue = finalPayload.value as number;
    if (finalPayload.code) updatePayload.discountCode = finalPayload.code as string;
    if (finalPayload.startDate) updatePayload.discountStartDate = new Date(finalPayload.startDate as string | Date);
    if (finalPayload.endDate) updatePayload.discountEndDate = new Date(finalPayload.endDate as string | Date);
    if (finalPayload.maxUses) updatePayload.discountMaxUses = finalPayload.maxUses as number;
    if (finalPayload.usesCount) updatePayload.discountUsesCount = finalPayload.usesCount as number;
    if (finalPayload.maxUsesPerUser) updatePayload.discountMaxUsesPerUser = finalPayload.maxUsesPerUser as number;
    if (finalPayload.minOrderValue) updatePayload.discountMinOrderValue = finalPayload.minOrderValue as number;
    if (finalPayload.isActive !== undefined) updatePayload.discountIsActive = finalPayload.isActive as boolean;
    if (finalPayload.appliesTo) updatePayload.discountAppliesTo = finalPayload.appliesTo as DiscountAppliesTo;

    const updatedDiscount = await updateDiscountById({
      id: convertToObjectId(id),
      payload: updatePayload,
      model: discount,
      isNew: true,
    });

    if (!updatedDiscount) {
      throw new BadRequestError("Not found");
    }

    return updatedDiscount;
  }

  static async getAllDiscountCodesWithProduct({ code, shopId, limit, page }: DiscountListInput) {
    const foundDiscount = await this.checkValidDiscount(code, shopId);
    if (!foundDiscount) throw new NotFoundError("Discount code not found");

    if (foundDiscount.discountAppliesTo === "all") {
      return findAllProducts({
        filter: {
          productShop: convertToObjectId(shopId),
          isPublished: true,
        },
        limit: Number(limit),
        page: Number(page),
        sort: "ctime",
        select: ["productName"],
      });
    }

    if (foundDiscount.discountAppliesTo === "specific") {
      return findAllProducts({
        filter: {
          _id: {
            $in: foundDiscount.discountProductIds,
          },
          productShop: convertToObjectId(shopId),
          isPublished: true,
        },
        limit: Number(limit),
        page: Number(page),
        sort: "ctime",
        select: ["productName"],
      });
    }

    return [];
  }

  static async getAllDiscountCodesByShop({ shopId, limit, page }: ShopDiscountListInput) {
    return findAllDiscountCodesUnSelect({
      filter: {
        discountShopId: convertToObjectId(shopId),
        discountIsActive: true,
      },
      limit: Number(limit),
      page: Number(page),
      sort: "ctime",
      unSelect: ["__v", "discountShopId"],
      model: discount,
    });
  }

  static async getDiscountAmount({ codeId, shopId, products }: DiscountAmountInput) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        _id: convertToObjectId(codeId),
        discountShopId: convertToObjectId(shopId),
        discountIsActive: true,
      },
      model: discount,
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount code not found");
    }

    const { discountIsActive, discountMaxUses, discountStartDate, discountEndDate } = foundDiscount;

    if (!discountIsActive) {
      throw new BadRequestError("Discount code is not active");
    }

    if (!discountMaxUses) {
      throw new BadRequestError("Discount code has reached its maximum uses");
    }

    if (new Date() < new Date(discountStartDate) || new Date() > new Date(discountEndDate)) {
      throw new BadRequestError("Discount code is not valid at this time");
    }

    return {
      totalProducts: products.length,
      discount: foundDiscount,
    };
  }
}

export default DiscountService;
