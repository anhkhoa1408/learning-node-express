import { pick } from "lodash";
import { Types } from "mongoose";
import type { ProjectionExclude, ProjectionInclude } from "../types/domain";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Types.ObjectId);

export const getInfoData = <T extends object, K extends keyof T>({
  fields = [],
  object,
}: {
  fields?: K[];
  object: T;
}): Pick<T, K> => pick(object, fields);

export const getSelectData = (select: string[] = []): ProjectionInclude =>
  Object.fromEntries(select.map((el) => [el, 1]));

export const unGetSelectData = (select: string[] = []): ProjectionExclude =>
  Object.fromEntries(select.map((el) => [el, 0]));

export const removeInvalidPropsInObject = <T extends UnknownRecord>(obj: T): Partial<T> => {
  const cleanedEntries = Object.entries(obj).flatMap(([key, value]) => {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) {
      return [[key, value.filter((item) => item !== null && item !== undefined)] as const];
    }
    if (isRecord(value)) {
      return [[key, removeInvalidPropsInObject(value)] as const];
    }
    return [[key, value] as const];
  });

  return Object.fromEntries(cleanedEntries) as Partial<T>;
};

export const flattenObject = (
  currentObj: UnknownRecord,
  finalObj: UnknownRecord = {},
  prevKey = "",
): UnknownRecord => {
  Object.entries(currentObj).forEach(([key, value]) => {
    const fullKey = prevKey ? `${prevKey}.${key}` : key;
    if (isRecord(value)) {
      flattenObject(value, finalObj, fullKey);
      return;
    }
    finalObj[fullKey] = value;
  });
  return finalObj;
};

export const convertToObjectId = (id: Types.ObjectId | string): Types.ObjectId =>
  id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
