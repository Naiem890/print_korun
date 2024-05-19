const mqtt = require('mqtt');

// MQTT Settings
const MQTT_BROKER = 'mqtt://broker.hivemq.com';
const MQTT_PORT = '1883';
const MQTT_TOPIC = 'commands/pi';

// Connect to the MQTT broker with additional options for reconnection
const client = mqtt.connect(MQTT_BROKER, {
  port: MQTT_PORT,
  reconnectPeriod: 5000, // Try to reconnect every 5000 milliseconds (5 seconds)
  connectTimeout: 30 * 1000 // 30-second connection timeout
});

// Event handler for successful connection
client.on('connect', () => {
  console.log('Connected to MQTT Broker at ' + MQTT_BROKER);
  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('Failed to subscribe to topic:', err);
    } else {
      console.log(`Subscribed to topic '${MQTT_TOPIC}'`);
    }
  });
});

// Event handler for receiving messages
client.on('message', (topic, message) => {
  const command = message.toString();
  console.log(`Received command: ${command}`);

  const { exec } = require('child_process');
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
    }
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log("Command executed successfully");
  });
});

// Error handling for the client
client.on('error', (err) => {
  console.error('MQTT client error:', err);
});

// Reconnection handling
client.on('reconnect', () => {
  console.log('Reconnecting to MQTT Broker...');
});

// Close handling
client.on('close', () => {
  console.log('Disconnected from MQTT Broker');
});
