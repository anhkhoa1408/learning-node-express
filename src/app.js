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

const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init db

// init routes
app.get("/", (req, res, next) => {
  const strCompress = "Hello";
  return res.status(200).json({
    message: "welcome",
    metadata: strCompress.repeat(1000),
  });
});

// handle error

module.exports = app;
