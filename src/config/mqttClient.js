const mqtt = require("mqtt");

const MQTT_BROKER = "mqtt://broker.hivemq.com";
const MQTT_PORT = "1883";
const MQTT_TOPIC = "sohoz_print";

// Connect to the local MQTT broker
const client = mqtt.connect(MQTT_BROKER, {
  port: MQTT_PORT,
});

client.on("connect", () => {
  console.log("Connected to MQTT Broker", MQTT_BROKER);
});

client.on("error", (error) => {
  console.error("Connection failed:", error);
});

function sendMessage(message) {
  client.publish(MQTT_TOPIC, JSON.stringify(message), { qos: 1 }, (error) => {
    if (error) {
      console.error("Failed to publish message:", error);
    }
  });
}

module.exports = { sendMessage };
