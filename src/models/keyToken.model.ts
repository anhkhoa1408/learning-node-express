import { model, Schema } from "mongoose";
import type { KeyTokenAttrs } from "../types/domain";

const documentName = "Key";
const collectionName = "Keys";

const keyTokenSchema = new Schema<KeyTokenAttrs>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    refreshTokensUsed: {
      type: [String],
      default: [],
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    collection: collectionName,
    timestamps: true,
  },
);

export default model<KeyTokenAttrs>(documentName, keyTokenSchema);
