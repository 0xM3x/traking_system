const mqtt = require('mqtt');
const pool = require('../config/db');
require('dotenv').config();

const client = mqtt.connect(process.env.MQTT_BROKER_URL);

client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    client.subscribe('door/+/status', (err) => {
        if (err) {
            console.error('Failed to subscribe:', err);
        } else {
            console.log('Subscribed to door/+/status');
        }
    });
});

client.on('message', async (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    
    const doorId = topic.split('/')[1];  // Extract door ID from topic (e.g., door/1/status -> 1)
    const status = message.toString();  // The message content (e.g., "Person is close")
    const timestamp = new Date().toISOString();

    // Insert the status update into the database
    try {
        await pool.query('INSERT INTO door_status (door_id, status, timestamp) VALUES ($1, $2, $3)', [doorId, status, timestamp]);
        console.log('Status logged to database');
    } catch (err) {
        console.error('Error inserting status into database:', err);
    }
});

module.exports = client;

