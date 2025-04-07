const express = require('express');
const { Client } = require('pg');
const mqtt = require('mqtt');
const config = require('./config/config');
const doorRoutes = require('./routes/doorRoutes');

const app = express();
const port = 3000;

// Initialize PostgreSQL client
const dbClient = new Client({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

dbClient.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Database connection error', err.stack));

// Initialize MQTT client
const mqttClient = mqtt.connect(config.mqtt.url);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');
  mqttClient.subscribe('door/+/status', (err) => {
    if (err) {
      console.error('Subscription error:', err);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
  // Here, you'll process the message (e.g., update logs)
});

app.use(express.json());
app.use('/api/doors', doorRoutes(dbClient, mqttClient)); // Add routes here

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

