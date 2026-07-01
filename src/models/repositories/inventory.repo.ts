import type { Types } from "mongoose";
import inventory from "../inventory.model";

interface InsertInventoryInput {
  productId: Types.ObjectId;
  shopId: Types.ObjectId;
  stock: number;
  location?: string;
}

export const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unknown",
}: InsertInventoryInput): Promise<void> => {
  await inventory.create({
    invenProductId: productId,
    invenShopId: shopId,
    invenStock: stock,
    invenLocation: location,
  });
};
