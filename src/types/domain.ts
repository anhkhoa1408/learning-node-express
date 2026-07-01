import type { HydratedDocument, Model, Types } from "mongoose";

export type ObjectIdLike = Types.ObjectId | string;
export type ProjectionInclude = Record<string, 1>;
export type ProjectionExclude = Record<string, 0>;
export type SortMode = string;

export type ShopRole = "SHOP" | "WRITER" | "EDITOR" | "ADMIN";
export type ShopStatus = "active" | "inactive";

export interface ShopAttrs {
  name?: string;
  email?: string;
  password: string;
  status: ShopStatus;
  verify: boolean;
  roles: ShopRole[];
}

export type ShopDocument = HydratedDocument<ShopAttrs>;

export type ApiKeyPermission = "0000" | "1111" | "2222";

export interface ApiKeyAttrs {
  key: string;
  status: string | boolean;
  permissions: ApiKeyPermission[];
}

export interface KeyTokenAttrs {
  user: Types.ObjectId;
  publicKey: string;
  privateKey: string;
  refreshTokensUsed: string[];
  refreshToken: string;
}

export type KeyTokenDocument = HydratedDocument<KeyTokenAttrs>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthJwtPayload {
  userId: string;
  email: string;
}

export type ProductType = "Clothing" | "Electronics" | "Furniture";

export interface ClothingAttributes {
  brand: string;
  size?: string;
  material?: string;
}

export interface ElectronicAttributes {
  manufacture: string;
  model?: string;
  color?: string;
}

export interface FurnitureAttributes {
  brand: string;
  size?: string;
  material?: string;
}

export type ProductAttributesByType = {
  Clothing: ClothingAttributes;
  Electronics: ElectronicAttributes;
  Furniture: FurnitureAttributes;
};

export type ProductAttributes = ProductAttributesByType[ProductType];

export interface ProductVariation {
  name?: string;
  options?: string[];
  price?: number;
}

export interface ProductBaseAttrs {
  productName: string;
  productThumb: string;
  productDescription?: string;
  productSlug?: string;
  productShop: Types.ObjectId;
  productPrice: number;
  productQuantity: number;
  productType: ProductType;
  productAttributes: ProductAttributes;
  productAverageRating: number;
  productVariations: ProductVariation[];
  isDraft: boolean;
  isPublished: boolean;
}

export type ProductDocument = HydratedDocument<ProductBaseAttrs>;

export interface ProductSubtypeAttrs {
  productShop: Types.ObjectId;
}

export type ClothingDocument = HydratedDocument<ClothingAttributes & ProductSubtypeAttrs>;
export type ElectronicDocument = HydratedDocument<ElectronicAttributes & ProductSubtypeAttrs>;
export type FurnitureDocument = HydratedDocument<FurnitureAttributes & ProductSubtypeAttrs>;

export type ProductModel =
  | Model<ProductBaseAttrs>
  | Model<ClothingAttributes & ProductSubtypeAttrs>
  | Model<ElectronicAttributes & ProductSubtypeAttrs>
  | Model<FurnitureAttributes & ProductSubtypeAttrs>;

export type ProductCreateInput =
  | (Omit<ProductBaseAttrs, "productAttributes" | "productType" | "productAverageRating" | "productVariations" | "isDraft" | "isPublished" | "productSlug"> & {
      productType: "Clothing";
      productAttributes: ClothingAttributes;
    })
  | (Omit<ProductBaseAttrs, "productAttributes" | "productType" | "productAverageRating" | "productVariations" | "isDraft" | "isPublished" | "productSlug"> & {
      productType: "Electronics";
      productAttributes: ElectronicAttributes;
    })
  | (Omit<ProductBaseAttrs, "productAttributes" | "productType" | "productAverageRating" | "productVariations" | "isDraft" | "isPublished" | "productSlug"> & {
      productType: "Furniture";
      productAttributes: FurnitureAttributes;
    });

export type ProductUpdateInput = Partial<ProductCreateInput> & {
  productType: ProductType;
  productShop: Types.ObjectId | string;
};

export interface InventoryReservation {
  cartId: string;
  stock: number;
  createdAt: Date;
}

export interface InventoryAttrs {
  invenProductId?: Types.ObjectId;
  invenLocation: string;
  invenStock: number;
  invenShopId?: Types.ObjectId;
  invenReservations: InventoryReservation[];
}

export type DiscountType = "fixedAmount" | "percentage";
export type DiscountAppliesTo = "all" | "specific" | " ";

export interface DiscountAttrs {
  discountName: string;
  discountDescription: string;
  discountType: DiscountType;
  discountValue: number;
  discountCode: string;
  discountStartDate: Date;
  discountEndDate: Date;
  discountMaxUses: number;
  discountUsesCount: number;
  discountUsersUsed: Types.ObjectId[];
  discountMaxUsesPerUser: number;
  discountMinOrderValue: number;
  discountShopId?: Types.ObjectId;
  discountIsActive: boolean;
  discountAppliesTo: DiscountAppliesTo;
  discountProductIds: Types.ObjectId[];
}

export type DiscountDocument = HydratedDocument<DiscountAttrs>;
