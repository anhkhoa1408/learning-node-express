import type { Model, SortOrder, Types, UpdateQuery } from "mongoose";
import { product } from "../product.model";
import { getSelectData, unGetSelectData, convertToObjectId } from "../../utils";
import type { ProjectionExclude, ProjectionInclude, SortMode } from "../../types/domain";

interface ShopProductQueryInput {
  query: Record<string, unknown>;
  limit?: number;
  skip?: number;
}

interface FindAllProductsInput {
  limit: number;
  page: number;
  sort: SortMode;
  filter: Record<string, unknown>;
  select: string[];
}

interface FindProductInput {
  productId: string;
  unSelect: string[];
}

interface UpdateProductByIdInput<T extends object> {
  productId: Types.ObjectId | string;
  payload: UpdateQuery<T> | Record<string, unknown>;
  model: Model<T>;
  isNew?: boolean;
}

interface ProductShopInput {
  productShop: Types.ObjectId | string;
  productId: Types.ObjectId | string;
}

interface SearchProductInput {
  keySearch: string;
}

const sortByCreated = (sort: SortMode): Record<string, SortOrder> => (sort === "ctime" ? { _id: -1 } : { _id: 1 });

export const findAllDraftsForShop = async ({ query, limit = 50, skip = 0 }: ShopProductQueryInput) =>
  queryProduct({ query, limit, skip });

export const findAllPublishForShop = async ({ query, limit = 50, skip = 0 }: ShopProductQueryInput) =>
  queryProduct({ query, limit, skip });

export const findAllProducts = async ({ limit, page, sort, filter, select }: FindAllProductsInput) => {
  const skip = (page - 1) * limit;
  return product.find(filter).skip(skip).limit(limit).sort(sortByCreated(sort)).select(getSelectData(select)).lean();
};

export const findProduct = async ({ productId, unSelect }: FindProductInput) =>
  product.findById(convertToObjectId(productId)).select(unGetSelectData(unSelect)).lean();

export const updateProductById = async <T extends object>({
  productId,
  payload,
  model,
  isNew = true,
}: UpdateProductByIdInput<T>) =>
  model.findByIdAndUpdate(productId, payload, {
    new: isNew,
  });

const queryProduct = async ({ query, limit = 50, skip = 0 }: ShopProductQueryInput) =>
  product
    .find(query)
    .populate("productShop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

export const publishProductByShop = async ({ productShop, productId }: ProductShopInput): Promise<number | null> => {
  const foundShop = await product.findOne({
    _id: convertToObjectId(productId),
    productShop: convertToObjectId(productShop),
  });

  if (!foundShop) return null;

  foundShop.isPublished = true;
  foundShop.isDraft = false;

  const { modifiedCount } = await product.updateOne({ _id: foundShop._id }, { isPublished: true, isDraft: false });
  return modifiedCount;
};

export const unPublishProductByShop = async ({ productShop, productId }: ProductShopInput): Promise<number | null> => {
  const foundShop = await product.findOne({
    _id: convertToObjectId(productId),
    productShop: convertToObjectId(productShop),
  });

  if (!foundShop) return null;

  foundShop.isPublished = false;
  foundShop.isDraft = true;

  const { modifiedCount } = await product.updateOne({ _id: foundShop._id }, { isPublished: false, isDraft: true });
  return modifiedCount;
};

export const searchProductByUser = async ({ keySearch }: SearchProductInput) => {
  const searchRegex = new RegExp(keySearch);
  return product
    .find(
      {
        isPublished: true,
        $text: {
          $search: searchRegex.source,
        },
      },
      {
        score: {
          $meta: "textScore",
        },
      },
    )
    .lean();
};

export type ProductIncludeProjection = ProjectionInclude;
export type ProductExcludeProjection = ProjectionExclude;
