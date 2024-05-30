const mqtt = require("mqtt");
const { v4: uuidv4 } = require("uuid");

const MQTT_BROKER = "mqtt://broker.hivemq.com";
const MQTT_PORT = "1883";
const MQTT_TOPIC = "sohoz_print";

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

function sendAndGetBackResponse(message) {
  return new Promise((resolve, reject) => {
    const responseTopic = `response/${uuidv4()}`;
    const timeout = setTimeout(() => {
      client.unsubscribe(responseTopic);
      reject(new Error("Response timed out"));
    }, 5000); // Timeout after 5 seconds

    client.subscribe(responseTopic, (err) => {
      if (err) {
        reject(err);
      } else {
        client.publish(
          MQTT_TOPIC,
          JSON.stringify({ ...message, responseTopic }),
          { qos: 1 },
          (error) => {
            if (error) {
              client.unsubscribe(responseTopic);
              reject(error);
            }
          }
        );

        const onMessage = (topic, message) => {
          if (topic === responseTopic) {
            clearTimeout(timeout);
            client.unsubscribe(responseTopic);
            client.removeListener("message", onMessage);
            resolve(JSON.parse(message.toString()));
          }
        };

        client.on("message", onMessage);
      }
    });
  });
}

module.exports = { sendMessage, sendAndGetBackResponse };
