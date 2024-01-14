"use strict";

const mongoose = require("mongoose");

const connectionString = "mongodb://localhost:27017/shopDEV";

mongoose
  .connect(connectionString)
  .then((_) => console.log("Connect success: ", connectionString))
  .catch((err) => console.log("Connect error: ", err));

if (1 === 0) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;
