import "dotenv/config";
import compression from "compression";
import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import "./dbs/init.mongodb";
import router from "./routes";
import { ErrorResponse } from "./core/error.response";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use("/", router);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new ErrorResponse("Not found", 404));
});

const errorHandler: ErrorRequestHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.log("app.use - err:", err);
  const statusCode = err instanceof ErrorResponse ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message,
  });
};

app.use(errorHandler);

export default app;
