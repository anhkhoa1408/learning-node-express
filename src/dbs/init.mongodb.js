"use strict";

const mongoose = require("mongoose");
const connectionString = "mongodb://127.0.0.1:27017/shopDEV";
const { countCounnect } = require("./../helpers/check.connect");

// Apply Singleton pattern
class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (true) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectionString, {
        // Pool size: Tap hop cac ket noi cua csdl co the tai su dung
        // Loi ich: cai thien hieu suat, thay vi phai dong/mo csdl mot cach thu cong
        // Neu vuot qua pool size: connect do se vao queue, khi nao free thi su dung
        maxPoolSize: 50,
      })
      .then((_) => console.log("Connect success, number of connections is: ", countCounnect()))
      .catch((err) => console.log("Connect error: ", err));
  }

  // checker
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
