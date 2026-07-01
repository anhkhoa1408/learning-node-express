import type { Model, SortOrder, Types, UpdateQuery } from "mongoose";
import { getSelectData, unGetSelectData } from "../../utils";
import type { DiscountAttrs, SortMode } from "../../types/domain";

interface DiscountQueryInput {
  limit?: number;
  page?: number;
  sort: SortMode;
  filter: Record<string, unknown>;
  model: Model<DiscountAttrs>;
}

interface FindDiscountUnselectInput extends DiscountQueryInput {
  unSelect: string[];
}

interface FindDiscountSelectInput extends DiscountQueryInput {
  select: string[];
}

interface UpdateDiscountByIdInput {
  id: Types.ObjectId;
  payload: UpdateQuery<DiscountAttrs>;
  isNew?: boolean;
  model: Model<DiscountAttrs>;
}

interface CheckDiscountExistsInput {
  filter: Record<string, unknown>;
  model: Model<DiscountAttrs>;
}

const sortByCreated = (sort: SortMode): Record<string, SortOrder> => (sort === "ctime" ? { _id: -1 } : { _id: 1 });

export const findAllDiscountCodesUnSelect = async ({
  limit = 50,
  page = 1,
  sort,
  filter,
  unSelect,
  model,
}: FindDiscountUnselectInput) => {
  const skip = (page - 1) * limit;
  return model.find(filter).skip(skip).limit(limit).sort(sortByCreated(sort)).select(unGetSelectData(unSelect)).lean();
};

export const findAllDiscountCodesSelect = async ({
  limit = 50,
  page = 1,
  sort,
  filter,
  select,
  model,
}: FindDiscountSelectInput) => {
  const skip = (page - 1) * limit;
  return model.find(filter).skip(skip).limit(limit).sort(sortByCreated(sort)).select(getSelectData(select)).lean();
};

export const updateDiscountById = async ({ id, payload, isNew = true, model }: UpdateDiscountByIdInput) =>
  model.findByIdAndUpdate(id, payload, {
    new: isNew,
  });

export const checkDiscountExists = async ({ filter, model }: CheckDiscountExistsInput) => model.findOne(filter).lean();
