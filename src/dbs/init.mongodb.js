"use strict";

const mongoose = require("mongoose");
const {
  db: { host, port, name },
} = require("./../configs/config.mongodb");

const connectionString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require("./../helpers/check.connect");

// Apply Singleton Pattern to ensure only one DB connection instance
class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    // Enable Mongoose debug mode to log queries
    mongoose.set("debug", true);
    mongoose.set("debug", { color: true }); // Optional: enable colored logs if supported

    mongoose
      .connect(connectionString, {
        // maxPoolSize:
        // Specifies the maximum number of sockets the MongoDB driver will keep open for this connection.
        // Benefits:
        // - Improves performance by reusing database connections
        // - Prevents frequent open/close operations
        // - If the number of concurrent requests exceeds the pool size, new requests will be queued
        maxPoolSize: 50,
      })
      .then(() => countConnect()) // Custom function to count and log active connections
      .catch((err) => console.error("Connection error: ", err));
  }

  // Static method to enforce singleton behavior
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

// Export the single MongoDB connection instance
const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
