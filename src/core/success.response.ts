import type { Response } from "express";
import { ReasonPhrases } from "../utils/httpStatusCode";
import statusCodes from "../utils/statusCodes";

interface SuccessResponseInput<T> {
  message?: string | undefined;
  statusCode?: number | undefined;
  reasonStatusCode?: string | undefined;
  metadata?: T | undefined;
}

export class SuccessResponse<T = unknown> {
  readonly message: string;
  readonly status: number;
  readonly metadata: T;

  constructor({
    message,
    statusCode = statusCodes.ok,
    reasonStatusCode = ReasonPhrases.ok,
    metadata = {} as T,
  }: SuccessResponseInput<T>) {
    this.message = message || reasonStatusCode;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res: Response, _headers: Record<string, string> = {}): Response {
    return res.status(this.status).json(this);
  }
}

export class OK<T = unknown> extends SuccessResponse<T> {
  constructor({ message, metadata }: SuccessResponseInput<T>) {
    super({ message, metadata });
  }
}

export class CREATED<T = unknown> extends SuccessResponse<T> {
  constructor({
    message,
    statusCode = statusCodes.created,
    reasonStatusCode = ReasonPhrases.created,
    metadata,
  }: SuccessResponseInput<T>) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}
