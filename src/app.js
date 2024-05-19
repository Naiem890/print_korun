const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const dbConnect = require("./config/database");
const apiRoutes = require("./routes/index");
const { sendSMS } = require("./utils/helper");
const mqtt = require("mqtt");

// load env variables
require("dotenv").config();

// eslint-disable-next-line no-undef
const port = process.env.PORT || 5000;

// Middleware Array
const middleware = [
  logger("dev"),
  cors(),
  express.static("public"),
  express.urlencoded({ extended: true }),
  express.json(),
];

app.use(middleware);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Print Korun app!");
});

// Api routes
app.use("/api", apiRoutes);

// test sms route
app.get("/sms/:phoneNumber?", async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    const response = await sendSMS(
      "SMS request received successfully!",
      phoneNumber || "01790732717"
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Connect to the database
dbConnect();

const MQTT_BROKER = "mqtt://broker.hivemq.com";
const MQTT_PORT = "1883";
const MQTT_TOPIC = "sohoz_print";

// Connect to the local MQTT broker
const client = mqtt.connect(MQTT_BROKER, {
  port: MQTT_PORT,
});

client.on("connect", (data) => {
  console.log("Connected to MQTT Broker", MQTT_BROKER);
});

function sendMessage(message) {
  client.publish(MQTT_TOPIC, JSON.stringify(message), { qos: 1 }, (error) => {
    if (error) {
      console.error("Failed to publish message:", error);
    }
  });
}

// Example route to send a command to all Pi clients
app.get("/send-command", (req, res) => {
  sendMessage({
    action: "PRINT_ORDER",
    payload: { orderId: "664a0dc9e3eccbf285ff79ed" },
  });
  res.send("Command sent to all connected devices.");
});

app.listen(port, () => {
  console.log(`Print Korun app listening on port ${port}`);
  console.log(`Running on: http://localhost:${port}`);
});
