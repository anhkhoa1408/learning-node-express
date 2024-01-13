const app = require("./src/app");

// init port to start server
const server = app.listen(3005, () => {
  console.log("Ecommerce project start at port", 3005);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit Express server"));
});
