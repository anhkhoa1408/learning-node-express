import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";

type AsyncRequestHandler<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
  Locals extends Record<string, unknown> = Record<string, unknown>,
> = (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => Promise<unknown>;

const asyncHandler = <
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query,
  Locals extends Record<string, unknown> = Record<string, unknown>,
>(
  fn: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
