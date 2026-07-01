import app from "./src/app";
import config from "./src/configs/config.mongodb";

const {
  app: { port },
} = config;

const server = app.listen(port, () => {
  console.log("Ecommerce project start at port", port);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit Express server"));
});
