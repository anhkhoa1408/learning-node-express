import type { Types } from "mongoose";
import { BadRequestError } from "../core/error.response";
import { clothing, electronic, furniture, product } from "../models/product.model";
import { insertInventory } from "../models/repositories/inventory.repo";
import {
  findAllDraftsForShop,
  findAllProducts,
  findAllPublishForShop,
  findProduct,
  publishProductByShop,
  searchProductByUser,
  unPublishProductByShop,
  updateProductById,
} from "../models/repositories/product.repo";
import { convertToObjectId, flattenObject, removeInvalidPropsInObject } from "../utils";
import type {
  ClothingAttributes,
  ElectronicAttributes,
  FurnitureAttributes,
  ProductAttributes,
  ProductType,
} from "../types/domain";

type ServiceProductInput = Record<string, unknown> & {
  productShop: Types.ObjectId | string;
  productType: ProductType;
  productName?: string | undefined;
  productThumb?: string | undefined;
  productDescription?: string | undefined;
  productPrice?: number | undefined;
  productQuantity?: number | undefined;
  productAttributes?: ProductAttributes | undefined;
};

type ProductUpdatePayload = ServiceProductInput;

interface ProductCtor {
  new (payload: ServiceProductInput): Product;
}

interface ProductShopQueryInput {
  productShop: Types.ObjectId | string;
  limit?: number;
  skip?: number;
}

interface ProductShopActionInput {
  productShop: Types.ObjectId | string;
  productId: string;
}

interface SearchProductInput {
  keySearch: string;
}

interface FindAllProductsInput {
  limit?: number;
  page?: number;
  sort?: string;
  filter?: Record<string, unknown>;
}

interface FindProductInput {
  productId: string;
}

class ProductFactory {
  private static productRegistry: Partial<Record<ProductType, ProductCtor>> = {};

  static registerProductType(type: ProductType, classRef: ProductCtor): void {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type: ProductType, payload: ServiceProductInput) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError("Invalid product type");

    return new productClass(payload).createProduct();
  }

  static async updateProduct(type: ProductType, productId: string, payload: ProductUpdatePayload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass) throw new BadRequestError("Invalid product type");

    return new productClass(removeInvalidPropsInObject(payload) as ServiceProductInput).updateProduct(productId);
  }

  static async publishProductByShop({ productShop, productId }: ProductShopActionInput) {
    return publishProductByShop({ productShop, productId });
  }

  static async unPublishProductByShop({ productShop, productId }: ProductShopActionInput) {
    return unPublishProductByShop({ productShop, productId });
  }

  static async findAllDraftsForShop({ productShop, limit = 50, skip = 0 }: ProductShopQueryInput) {
    const query = { productShop: convertToObjectId(productShop), isDraft: true };
    return findAllDraftsForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ productShop, limit = 50, skip = 0 }: ProductShopQueryInput) {
    const query = { productShop: convertToObjectId(productShop), isPublished: true };
    return findAllPublishForShop({ query, limit, skip });
  }

  static async searchProductByUser({ keySearch }: SearchProductInput) {
    return searchProductByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    page = 1,
    sort = "ctime",
    filter = {
      isPublished: true,
    },
  }: FindAllProductsInput) {
    return findAllProducts({
      limit,
      page,
      sort,
      filter,
      select: ["productName", "productPrice", "productThumb"],
    });
  }

  static async findProduct({ productId }: FindProductInput) {
    return findProduct({ productId, unSelect: ["__v", "productVariations"] });
  }
}

class Product {
  protected productName: string | undefined;
  protected productThumb: string | undefined;
  protected productDescription: string | undefined;
  protected productShop: Types.ObjectId;
  protected productPrice: number | undefined;
  protected productQuantity: number | undefined;
  protected productType: ProductType | undefined;
  protected productAttributes: ProductAttributes | undefined;

  constructor({
    productName,
    productThumb,
    productDescription,
    productShop,
    productPrice,
    productQuantity,
    productType,
    productAttributes,
  }: ServiceProductInput) {
    this.productName = productName;
    this.productThumb = productThumb;
    this.productDescription = productDescription;
    this.productShop = convertToObjectId(productShop);
    this.productPrice = productPrice;
    this.productQuantity = productQuantity;
    this.productType = productType;
    this.productAttributes = productAttributes;
  }

  async createProduct(productId?: Types.ObjectId) {
    if (
      !this.productName ||
      !this.productThumb ||
      this.productPrice === undefined ||
      this.productQuantity === undefined ||
      !this.productType ||
      !this.productAttributes
    ) {
      throw new BadRequestError("Invalid product payload");
    }

    const createPayload: Record<string, unknown> = {
      productName: this.productName,
      productThumb: this.productThumb,
      productShop: this.productShop,
      productPrice: this.productPrice,
      productQuantity: this.productQuantity,
      productType: this.productType,
      productAttributes: this.productAttributes,
    };
    if (this.productDescription !== undefined) createPayload.productDescription = this.productDescription;
    if (productId) createPayload._id = productId;

    const newProduct = await product.create(createPayload);

    if (newProduct) {
      await insertInventory({
        productId: newProduct._id,
        shopId: newProduct.productShop,
        stock: newProduct.productQuantity,
      });
    }

    return newProduct;
  }

  async updateProduct(productId: string, payload: Record<string, unknown> = flattenObject(this.toRecord())) {
    return updateProductById({
      productId,
      payload,
      model: product,
    });
  }

  protected toRecord(): Record<string, unknown> {
    return removeInvalidPropsInObject({
      productName: this.productName,
      productThumb: this.productThumb,
      productDescription: this.productDescription,
      productShop: this.productShop,
      productPrice: this.productPrice,
      productQuantity: this.productQuantity,
      productType: this.productType,
      productAttributes: this.productAttributes,
    });
  }
}

class Clothing extends Product {
  async createProduct() {
    const attributes = this.productAttributes as ClothingAttributes | undefined;
    if (!attributes) throw new BadRequestError("Invalid clothing attributes");

    const newClothing = await clothing.create({
      ...attributes,
      productShop: this.productShop,
    });
    if (!newClothing) throw new BadRequestError("Create new clothing product failed!");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new product failed!");

    return newProduct;
  }

  async updateProduct(productId: string) {
    const objectParams = this.toRecord();
    const attributes = objectParams.productAttributes;
    if (typeof attributes === "object" && attributes !== null && !Array.isArray(attributes)) {
      await updateProductById({
        productId,
        payload: flattenObject(attributes as Record<string, unknown>),
        model: clothing,
      });
    }

    return super.updateProduct(productId, flattenObject(objectParams));
  }
}

class Electronics extends Product {
  async createProduct() {
    const attributes = this.productAttributes as ElectronicAttributes | undefined;
    if (!attributes) throw new BadRequestError("Invalid electronic attributes");

    const newElectronics = await electronic.create({
      ...attributes,
      productShop: this.productShop,
    });
    if (!newElectronics) throw new BadRequestError("Create new electronic product failed!");

    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) throw new BadRequestError("Create new product failed!");

    return newProduct;
  }

  async updateProduct(productId: string) {
    const objectParams = this.toRecord();
    const attributes = objectParams.productAttributes;
    if (typeof attributes === "object" && attributes !== null && !Array.isArray(attributes)) {
      await updateProductById({
        productId,
        payload: flattenObject(attributes as Record<string, unknown>),
        model: electronic,
      });
    }

    return super.updateProduct(productId, flattenObject(objectParams));
  }
}

class Furniture extends Product {
  async createProduct() {
    const attributes = this.productAttributes as FurnitureAttributes | undefined;
    if (!attributes) throw new BadRequestError("Invalid furniture attributes");

    const newFurniture = await furniture.create({
      ...attributes,
      productShop: this.productShop,
    });
    if (!newFurniture) throw new BadRequestError("Create new furniture product failed!");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new product failed!");

    return newProduct;
  }

  async updateProduct(productId: string) {
    const objectParams = this.toRecord();
    const attributes = objectParams.productAttributes;
    if (typeof attributes === "object" && attributes !== null && !Array.isArray(attributes)) {
      await updateProductById({
        productId,
        payload: flattenObject(attributes as Record<string, unknown>),
        model: furniture,
      });
    }

    return super.updateProduct(productId, flattenObject(objectParams));
  }
}

ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Furniture", Furniture);

export default ProductFactory;
