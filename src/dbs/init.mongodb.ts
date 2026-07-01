import mongoose from "mongoose";
import config from "../configs/config.mongodb";
import { countConnect } from "../helpers/check.connect";

const {
  db: { host, port, name },
} = config;

const connectionString = `mongodb://${host}:${port}/${name}`;

class Database {
  private static instance: Database | undefined;

  private constructor() {
    this.connect();
  }

  private connect(): void {
    mongoose.set("debug", true);
    mongoose.set("debug", { color: true });

    void mongoose
      .connect(connectionString, {
        maxPoolSize: 50,
      })
      .then(() => countConnect())
      .catch((err: unknown) => console.error("Connection error: ", err));
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();

export default instanceMongodb;
