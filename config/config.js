module.exports = {
  port: process.env.PORT || 8080, // App port, NOT database port (3306)
  env: process.env.NODE_ENV || 'production',
  db: {
    host: process.env.MYSQLHOST, // Railway private domain ONLY
    port: process.env.MYSQLPORT || 3306, // Database port = 3306
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE || 'railway',
    publicUrl: process.env.MYSQL_PUBLIC_URL,
    privateUrl: process.env.MYSQL_URL
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
