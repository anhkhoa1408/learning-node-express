import { AuthFailureError } from "../core/error.response";
import type { AuthJwtPayload, KeyTokenDocument } from "./domain";

interface AuthenticatedRequestFields {
  user?: AuthJwtPayload;
  keyStore?: KeyTokenDocument;
  refreshToken?: string;
}

export const requireAuthContext = (req: AuthenticatedRequestFields) => {
  if (!req.user || !req.keyStore) {
    throw new AuthFailureError("Invalid authorization");
  }

  return {
    user: req.user,
    keyStore: req.keyStore,
    refreshToken: req.refreshToken,
  };
};
