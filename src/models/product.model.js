"use strict";

const { Schema, model, set } = require("mongoose");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// make a string look like a slug in url
const slugify = require("slugify");

// Declare the Schema of the Mongo model
const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: String,
    product_slug: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    product_averageRating: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be larger than 1"],
      max: [5, "Rating must be smaller than 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: {
      type: Array,
      default: [],
    },
    // Don't use product prefix
    isDraft: {
      type: Boolean,
      default: true,
      // index for field often use
      index: true,
      // select false because when find document will not show this field
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      // index for field often use
      index: true,
      // select false because when find document will not show this field
      select: false,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  },
);

// index text is used full-text search
productSchema.index({
  product_name: "text",
  product_description: "text",
});

// Product middleware run before save() and create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
  },
  {
    collection: "Clothes",
    timestamp: true,
  },
);

const electronicSchema = new Schema(
  {
    manufacture: {
      type: String,
      required: true,
    },
    model: String,
    color: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
  },
  {
    collection: "Electronics",
    timestamp: true,
  },
);

const furnitureSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: String,
    material: String,
    product_shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
  },
  {
    collection: "Furnitures",
    timestamp: true,
  },
);

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model("Clothing", clothingSchema),
  electronic: model("Electronic", electronicSchema),
  furniture: model("Furniture", furnitureSchema),
};
