import { model, Schema } from "mongoose";
import slugify from "slugify";
import type {
  ClothingAttributes,
  ElectronicAttributes,
  FurnitureAttributes,
  ProductAttributes,
  ProductBaseAttrs,
  ProductSubtypeAttrs,
  ProductVariation,
} from "../types/domain";

const documentName = "Product";
const collectionName = "Products";

const variationSchema = new Schema<ProductVariation>(
  {
    name: String,
    options: { type: [String], default: [] },
    price: Number,
  },
  { _id: false },
);

const productSchema = new Schema<ProductBaseAttrs>(
  {
    productName: {
      type: String,
      required: true,
    },
    productThumb: {
      type: String,
      required: true,
    },
    productDescription: String,
    productSlug: String,
    productShop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productQuantity: {
      type: Number,
      required: true,
    },
    productType: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    productAttributes: {
      type: Schema.Types.Mixed,
      required: true,
    } as unknown as ProductAttributes,
    productAverageRating: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be larger than 1"],
      max: [5, "Rating must be smaller than 5"],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    productVariations: {
      type: [variationSchema],
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
  },
  {
    collection: collectionName,
    timestamps: true,
  },
);

productSchema.index({
  productName: "text",
  productDescription: "text",
});

productSchema.pre("save", function () {
  this.productSlug = slugify(this.productName, { lower: true });
});

const clothingSchema = new Schema<ClothingAttributes & ProductSubtypeAttrs>(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    productShop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
  },
  {
    collection: "Clothes",
    timestamps: true,
  },
);

const electronicSchema = new Schema<ElectronicAttributes & ProductSubtypeAttrs>(
  {
    manufacture: {
      type: String,
      required: true,
    },
    model: String,
    color: String,
    productShop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
  },
  {
    collection: "Electronics",
    timestamps: true,
  },
);

const furnitureSchema = new Schema<FurnitureAttributes & ProductSubtypeAttrs>(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    productShop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
  },
  {
    collection: "Furnitures",
    timestamps: true,
  },
);

export const product = model<ProductBaseAttrs>(documentName, productSchema);
export const clothing = model<ClothingAttributes & ProductSubtypeAttrs>("Clothing", clothingSchema);
export const electronic = model<ElectronicAttributes & ProductSubtypeAttrs>("Electronic", electronicSchema);
export const furniture = model<FurnitureAttributes & ProductSubtypeAttrs>("Furniture", furnitureSchema);
