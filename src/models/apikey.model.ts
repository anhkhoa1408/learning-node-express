import { model, Schema } from "mongoose";
import type { ApiKeyAttrs } from "../types/domain";

const documentName = "Apikey";
const collectionName = "Apikeys";

const apiKeySchema = new Schema<ApiKeyAttrs>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Schema.Types.Mixed,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ["0000", "1111", "2222"],
    },
  },
  {
    timestamps: true,
    collection: collectionName,
  },
);

export default model<ApiKeyAttrs>(documentName, apiKeySchema);
