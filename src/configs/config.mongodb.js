"use strict";

const dev = {
  app: {
    port: process.env.PORT || 3005,
  },
  db: {
    host: process.env.DEV_DB_HOST || "127.0.0.1",
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || "shopDEV",
  },
};

const pro = {
  app: {
    port: process.env.PORT || 3005,
  },
  db: {
    host: process.env.PRO_DB_HOST || "127.0.0.1",
    port: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || "shopPRO",
  },
};

const configs = { dev, pro };
const env = process.env.NODE_ENV || "dev";

module.exports = configs[env];
