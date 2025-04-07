const { Client } = require('pg');
const config = require('../config/config');

// Initialize PostgreSQL client
const dbClient = new Client({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

dbClient.connect();

module.exports = dbClient;

