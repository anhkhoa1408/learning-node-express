"use strict";

const mongoose = require("mongoose");
const {
  db: { host, port, name },
} = require("./../configs/config.mongodb");

const connectionString = `mongodb://${host}:${port}/${name}`;
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
      .then((_) => countCounnect())
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
