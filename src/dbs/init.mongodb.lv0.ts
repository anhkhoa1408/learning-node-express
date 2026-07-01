import mongoose from "mongoose";
import config from "../configs/config.mongodb";

const {
  db: { host, port, name },
} = config;

const connectionString = `mongodb://${host}:${port}/${name}`;

void mongoose
  .connect(connectionString)
  .then(() => console.log("Connected MongoDB success"))
  .catch((err: unknown) => console.error("Error connect!", err));
