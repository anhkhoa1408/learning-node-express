const app = require("./src/app");
const {
  app: { port },
} = require("./src/configs/config.mongodb");

// init port to start server
const server = app.listen(port, () => {
  console.log("Ecommerce project start at port", port);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit Express server"));
});
