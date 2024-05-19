const { MongoClient, ObjectId } = require("mongodb");
const { exec } = require("child_process");
const fs = require("fs");
const mqtt = require("mqtt");

// Load environment variables
require("dotenv").config();

let Order = null;
let db = null;

async function dbConnect() {
  const dbUrl = process.env.DB_URI_CLOUD;

  try {
    const client = new MongoClient(dbUrl);
    await client.connect();
    console.log("Database connected");
    db = client.db(); // Get the default database
    Order = db.collection("orders"); // Get the collection
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

dbConnect();

// MQTT Settings and Connection
const MQTT_BROKER = "mqtt://broker.hivemq.com";
const MQTT_PORT = "1883";
const MQTT_TOPIC = "sohoz_print";

const client = mqtt.connect(MQTT_BROKER, {
  port: MQTT_PORT,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
});

client.on("connect", () => {
  console.log("Connected to MQTT Broker at " + MQTT_BROKER);
  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error("Failed to subscribe to topic:", err);
    } else {
      console.log(`Subscribed to topic '${MQTT_TOPIC}'`);
    }
  });
});

client.on("message", async (topic, message) => {
  let data;
  try {
    data = JSON.parse(message.toString());
  } catch (error) {
    console.error("Error parsing message:", error);
    return;
  }

  console.log(`Received message: ${message}`);

  switch (data.action) {
    case "PRINT_ORDER":
      await handlePrintOrder(data.payload.orderId);
      break;
    case "EXECUTE_COMMAND":
      exec(data.payload, (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

        console.log("--------finished---------");
      });
      break;
    default:
      console.log("Unknown action received");
  }
});

async function handlePrintOrder(orderId) {
  try {
    console.log("orderId", orderId);
    const _id = new ObjectId(orderId); // Use ObjectId from MongoDB driver
    const order = await Order.findOne({ _id: _id });

    if (order && order.file) {
      console.log("Order found, processing file...");

      // Convert MongoDB Binary to Buffer
      const fileBuffer = order.file.buffer;

      // Save file to temporary location
      fs.writeFileSync("/tmp/printfile", fileBuffer);
      console.log("File written to /tmp/printfile");

      // Print the file - adjust command according to your printer setup
      exec("lp /tmp/printfile", (error, stdout, stderr) => {
        if (error) {
          console.error(`Printing error: ${error}`);
          return;
        }
        console.log(`Printing stdout: ${stdout}`);
        console.error(`Printing stderr: ${stderr}`);
      });
    } else {
      console.log("Order not found or file missing");
    }
  } catch (error) {
    console.error("Error retrieving order:", error);
  }
}

client.on("error", (err) => {
  console.error("MQTT client error:", err);
});

client.on("close", () => {
  console.log("Disconnected from MQTT Broker");
});
