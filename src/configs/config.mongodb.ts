interface AppConfig {
  app: {
    port: string | number;
  };
  db: {
    host: string;
    port: string | number;
    name: string;
  };
}

const dev: AppConfig = {
  app: {
    port: process.env.PORT || 3005,
  },
  db: {
    host: process.env.DEV_DB_HOST || "127.0.0.1",
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || "shopDEV",
  },
};

const pro: AppConfig = {
  app: {
    port: process.env.PORT || 3005,
  },
  db: {
    host: process.env.PRO_DB_HOST || "127.0.0.1",
    port: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || "shopPRO",
  },
};

const configs = { dev, pro } satisfies Record<string, AppConfig>;
const env = process.env.NODE_ENV === "pro" ? "pro" : "dev";

export default configs[env];
