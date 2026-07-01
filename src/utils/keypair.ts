import crypto from "node:crypto";

export interface GeneratedKeyPair {
  publicKey: string;
  privateKey: string;
}

export const generateKeyPair = (): GeneratedKeyPair => {
  const publicKey = crypto.randomBytes(64).toString("hex");
  const privateKey = crypto.randomBytes(64).toString("hex");
  return {
    publicKey,
    privateKey,
  };
};
