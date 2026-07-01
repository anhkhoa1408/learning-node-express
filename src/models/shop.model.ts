import { model, Schema } from "mongoose";
import type { ShopAttrs } from "../types/domain";

const documentName = "Shop";
const collectionName = "Shops";

const shopSchema = new Schema<ShopAttrs>(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: collectionName,
  },
);

export default model<ShopAttrs>(documentName, shopSchema);
