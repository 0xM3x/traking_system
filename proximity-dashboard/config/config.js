const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  mqtt: {
    url: process.env.MQTT_BROKER_URL,
  },
};

