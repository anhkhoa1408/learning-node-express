import { ReasonPhrases, StatusCodes } from "../utils/httpStatusCode";

export class ErrorResponse extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = new.target.name;
    this.status = status;
  }
}

export class ConflictRequestError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.conflict, statusCode: number = StatusCodes.conflict) {
    super(message, statusCode);
  }
}

export class BadRequestError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.badRequest, statusCode: number = StatusCodes.badRequest) {
    super(message, statusCode);
  }
}

export class AuthFailureError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.unauthorized, statusCode: number = StatusCodes.unauthorized) {
    super(message, statusCode);
  }
}

export class NotFoundError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.notFound, statusCode: number = StatusCodes.notFound) {
    super(message, statusCode);
  }
}

export class ForbiddenError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.forbidden, statusCode: number = StatusCodes.forbidden) {
    super(message, statusCode);
  }
}
