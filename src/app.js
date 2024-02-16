// Require package

/////////////////////////
// morgan:
// description: thu vien in ra cac log khi nguoi dung chay request (http request logger)
// mode:
// 1/ combined: log + apache standard (request ip, time request, method)
// 2/ common
// 3/ short
// 4/ tiny
// 5/ dev

////////////////////////
// helmet
// Vấn đề: khi sử dụng curl, voi flag --include => dễ dàng xác
// định được BE core sử dụng công nghệ gì với header option là X-Powered-by
// helmet là 1 middleware sinh ra để ẩn đi header option này
// chặn những thông tin riêng tư bị leak như cookie

///////////////////////
// conpression
// khi những dữ liệu payload được trả về cho client với số lượng lớn => nén lại
// tiết kiệm băng thông cho client

require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const { checkOverload } = require("./helpers/check.connect");
const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

// init db
require("./dbs/init.mongodb");
// checkOverload();

// init routes
app.use("/", require("./routes"));

// handle error
// this middleware will set status to 404 for any invalid route, and passing to below (next) middleware
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

// this middleware will handle errors so its has the first parameter named err
app.use((err, req, res, next) => {
  console.log("app.use - err:", err);
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: err.message || "Internal Server Error",
  });
});
module.exports = app;
