"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;

// Count the number of active MongoDB connections
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log("Init MongoDB, number of connections:", numConnection);
};

// Periodically check if the number of connections exceeds system capacity
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCore = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    // Example threshold: allow up to 5 connections per CPU core
    const maxConnections = numCore * 5;

    console.log("Active connections:", numConnection);
    console.log("Memory usage (MB):", memoryUsage / Math.pow(1024, 2));

    if (numConnection > maxConnections) {
      console.warn("⚠️ Connection overload detected!");
      // No need to manually close MongoDB connections frequently
      // MongoDB uses a connection pool to manage connections efficiently
    }
  }, _SECONDS);
};

module.exports = {
  countConnect,
  checkOverload,
};
