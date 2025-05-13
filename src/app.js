// Load environment variables from .env file
require("dotenv").config();

const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const { checkOverload } = require("./helpers/check.connect");

const app = express();

/////////////////////////
// Morgan - HTTP request logger middleware
// Helps track incoming requests for debugging and monitoring
// Logging formats:
// - 'combined': Standard Apache combined log output (IP, timestamp, method, etc.)
// - 'common': Standard log format without detailed info
// - 'short': Minimal log format with essential info
// - 'tiny': Very short output
// - 'dev': Concise colored output for development
/////////////////////////
app.use(morgan("dev"));

/////////////////////////
// Helmet - Security middleware
// Helps secure the app by setting various HTTP headers
// Example: removes the 'X-Powered-By' header to avoid exposing backend tech stack
/////////////////////////
app.use(helmet());

/////////////////////////
// Compression - Response compression middleware
// Compresses response bodies for all requests
// Reduces payload size and saves bandwidth for the client
/////////////////////////
app.use(compression());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Parse URL-encoded payloads (for form submissions)
app.use(
  express.urlencoded({
    extended: true, // Allows for rich objects and arrays to be encoded into the URL-encoded format
  }),
);

// Initialize database connection
require("./dbs/init.mongodb");

// Optionally check system resource usage to avoid server overload
// checkOverload();

// Initialize application routes
app.use("/", require("./routes"));

/////////////////////////
// 404 Error Handling Middleware
// Catches all requests to undefined routes and forwards a 404 error
/////////////////////////
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

/////////////////////////
// General Error Handling Middleware
// Handles all errors forwarded by previous middleware
/////////////////////////
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
