const express = require('express');
const { Client } = require('pg');
const mqtt = require('mqtt');
const config = require('./config/config');
const doorRoutes = require('./routes/doorRoutes');
const pool = require('./config/db');

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

mqttClient.on('message', async (topic, message) => {
       console.log(`Received message on topic: ${topic}`);
       console.log(`Message content: ${message.toString()}`);

       // Extract door_id and status
       const doorId = topic.split('/')[1];
       const status = message.toString();
       const timestamp = new Date().toISOString();

        console.log(`Door ID: ${doorId}, Status: ${status}, Timestamp: ${timestamp}`);

       try {
               // Insert into the database
               const result = await pool.query(
                                   'INSERT INTO door_status (door_id, status, timestamp) VALUES ($1, $2, $3)',
                                   [doorId, status, timestamp]
                               );
               console.log('Status logged to database:', result);
       } catch (err) {
                     console.error('Error inserting status into database:', err);
       }


});

app.use(express.json());
app.use('/api/doors', doorRoutes(dbClient, mqttClient)); // Add routes here

// test database connection 
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.send(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error connecting to the database');
    }
});

// Register a new device (person unit or door unit)
app.post('/register-device', async (req, res) => {
    const { name, deviceType, distanceThreshold } = req.body;
    const timestamp = new Date().toISOString();
    
    // Insert the device into the database
    try {
        await pool.query('INSERT INTO devices (name, device_type, distance_threshold, created_at) VALUES ($1, $2, $3, $4)', 
        [name, deviceType, distanceThreshold, timestamp]);
        res.status(200).send('Device registered successfully');
    } catch (err) {
        console.error('Error registering device:', err);
        res.status(500).send('Error registering device');
    }
});

// Get logs of status changes
app.get('/get-logs', async (req, res) => {
    try {
        const logs = await pool.query('SELECT * FROM door_status ORDER BY timestamp DESC');
        res.json(logs.rows);
    } catch (err) {
        console.error('Error retrieving logs:', err);
        res.status(500).send('Error retrieving logs');
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

