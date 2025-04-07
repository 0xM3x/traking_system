const mqtt = require('mqtt');
require('dotenv').config();

// Connect to the MQTT broker
const client = mqtt.connect(process.env.MQTT_BROKER_URL);

// Once connected, subscribe to the topic
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

// Handle incoming messages
client.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
    // Add logic to process the incoming data and store it in the database
});

module.exports = client;

