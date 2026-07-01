import type { ApiKeyAttrs, AuthJwtPayload, KeyTokenDocument } from "./domain";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      objKey?: ApiKeyAttrs;
      keyStore?: KeyTokenDocument;
      user?: AuthJwtPayload;
      refreshToken?: string;
    }
  }
}

export {};
