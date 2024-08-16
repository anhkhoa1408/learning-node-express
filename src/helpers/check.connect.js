"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

// count connect
const countCounnect = () => {
  const numConnection = mongoose.connections.length;
  console.log("Init mongodb, number of connection is: ", numConnection);
};

// check overload
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCore = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    // Example my max connection per core is 5
    const maxConnections = numCore * 5;
    console.log("Active connection", numConnection);
    console.log("Memory usage", memoryUsage / Math.pow(1024, 2));

    if (numConnection > maxConnections) {
      console.log("Connection overload detected: ");
      // Khong can thiet dong ket noi mongodb lien tuc
      // Mongodb co pool size
    }
  }, _SECONDS);
};

module.exports = {
  countCounnect,
  checkOverload,
};
