import apikeyModel from "../models/apikey.model";
import type { ApiKeyAttrs } from "../types/domain";

export const findById = async (key: string): Promise<ApiKeyAttrs | null> => {
  try {
    return await apikeyModel.findOne({ key }).lean<ApiKeyAttrs>().exec();
  } catch {
    return null;
  }
};
