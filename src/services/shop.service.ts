import shopModel from "../models/shop.model";

interface FindByEmailInput {
  email: string;
  select?: Record<string, 0 | 1>;
}

export const findByEmail = async ({
  email,
  select = {
    email: 1,
    password: 1,
    name: 1,
    status: 1,
    roles: 1,
  },
}: FindByEmailInput) => shopModel.findOne({ email }).select(select);
