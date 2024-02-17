"use strict";

const { ReasonPhrases } = require("../utils/httpStatusCode");
const statusCodes = require("../utils/statusCodes");

class SuccessResponse {
  constructor({ message, statusCode = statusCodes.OK, reasonStatusCode = ReasonPhrases.OK, metadata = {} }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({ message, statusCode = ReasonPhrases.CREATED, reasonStatusCode = statusCodes.CREATED, metadata }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

module.exports = {
  SuccessResponse,
  OK,
  CREATED,
};
