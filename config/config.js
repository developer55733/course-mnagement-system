module.exports = {
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'production',
  db: {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
    publicUrl: process.env.MYSQL_PUBLIC_URL,
    privateUrl: process.env.MYSQL_URL
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
