import mongoose from "mongoose";
import os from "node:os";
import process from "node:process";

const SECONDS = 5000;

export const countConnect = (): void => {
  const numConnection = mongoose.connections.length;
  console.log("Init MongoDB, number of connections:", numConnection);
};

export const checkOverload = (): void => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCore = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    const maxConnections = numCore * 5;

    console.log("Active connections:", numConnection);
    console.log("Memory usage (MB):", memoryUsage / Math.pow(1024, 2));

    if (numConnection > maxConnections) {
      console.warn("Connection overload detected!");
    }
  }, SECONDS);
};
