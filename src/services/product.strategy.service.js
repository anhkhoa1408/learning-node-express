"use strict";

/* product_name: {
  type: String,
  required: true,
},
product_thumb: {
  type: String,
  required: true,
},
product_description: String,
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
}, */

const { BadRequestError, NotFoundError } = require("../core/error.response");
const { product, clothing, electronic, furniture } = require("../models/product.model");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
} = require("../models/repositories/product.repo");

// Following factory - strategy design pattern (should use in complex - reusable project)

/* 
  1. Create product factory class
*/

class ProductFactory {
  /* 1. Define an object which key is type - value is ref to class */
  static productRegistry = {};

  /* 2. Define a function which create instance base on productRegistry object */
  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError("Invalid product type");

    return await new productClass(payload).createProduct();
  }

  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }

  // QUERY //
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }
}

/* 
  2. Create base product class
*/
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_shop,
    product_price,
    product_quantity,
    product_type,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_shop = product_shop;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_attributes = product_attributes;
  }

  async createProduct(product_id) {
    return await product.create({
      ...this,
      _id: product_id,
    });
  }
}

/* 
  3. Create specific product type class extends base class
*/

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError("Create new clothing product failed!");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new product failed!");

    return newProduct;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics) throw new BadRequestError("Create new electronic product failed!");

    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) throw new BadRequestError("Create new product failed!");

    return newProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) throw new BadRequestError("Create new furniture product failed!");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new product failed!");

    return newProduct;
  }
}

// Register product type
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
