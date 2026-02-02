module.exports = {
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'production',
  db: {
    host: process.env.DB_HOST || 'railway',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
