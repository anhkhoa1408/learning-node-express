import { model, Schema } from "mongoose";
import type { InventoryAttrs, InventoryReservation } from "../types/domain";

const documentName = "Inventory";
const collectionName = "Inventories";

const reservationSchema = new Schema<InventoryReservation>(
  {
    cartId: { type: String, required: true },
    stock: { type: Number, required: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false },
);

const inventorySchema = new Schema<InventoryAttrs>(
  {
    invenProductId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    invenLocation: {
      type: String,
      default: "unknown",
    },
    invenStock: {
      type: Number,
      required: true,
    },
    invenShopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    invenReservations: {
      type: [reservationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: collectionName,
  },
);

export default model<InventoryAttrs>(documentName, inventorySchema);
