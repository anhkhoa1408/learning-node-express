import { model, Schema } from "mongoose";
import type { DiscountAttrs } from "../types/domain";

const documentName = "Discount";
const collectionName = "Discounts";

const discountSchema = new Schema<DiscountAttrs>(
  {
    discountName: {
      type: String,
      required: true,
    },
    discountDescription: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      default: "fixedAmount",
    },
    discountValue: {
      type: Number,
      required: true,
    },
    discountCode: {
      type: String,
      required: true,
    },
    discountStartDate: {
      type: Date,
      required: true,
    },
    discountEndDate: {
      type: Date,
      required: true,
    },
    discountMaxUses: {
      type: Number,
      required: true,
    },
    discountUsesCount: {
      type: Number,
      required: true,
    },
    discountUsersUsed: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    discountMaxUsesPerUser: {
      type: Number,
      required: true,
    },
    discountMinOrderValue: {
      type: Number,
      required: true,
    },
    discountShopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    discountIsActive: {
      type: Boolean,
      default: true,
    },
    discountAppliesTo: {
      type: String,
      required: true,
      enum: ["all", "specific", " "],
    },
    discountProductIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: collectionName,
  },
);

export default model<DiscountAttrs>(documentName, discountSchema);
