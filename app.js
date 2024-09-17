const { MongoClient, ObjectId } = require("mongodb");
const { exec } = require("child_process");
const fs = require("fs");
const mqtt = require("mqtt");

// Load environment variables
require("dotenv").config();

let Order = null;
let Printer = null;
let OrderFile = null
let db = null;

async function dbConnect() {
  const dbUrl = process.env.DB_URI_CLOUD;

  try {
    const client = new MongoClient(dbUrl);
    await client.connect();
    console.log("Database connected");
    db = client.db(); // Get the default database
    Order = db.collection("orders"); // Get the collection
    Printer = db.collection("printeriots");
    OrderFile = db.collection("orderfiles");
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

  console.log(`Received message: ${message}`, data);

  const { responseTopic } = data;

  switch (data.action) {
    case "PRINT_ORDER":
      const result = await handlePrintOrder(data.payload.orderId);
      if (responseTopic) {
        client.publish(responseTopic, JSON.stringify({ result }));
      }
      break;
    case "EXECUTE_COMMAND":
      exec(data.payload, (error, stdout, stderr) => {
        const response = {};
        if (error) {
          response.error = error.message;
        } else {
          response.stdout = stdout;
          response.stderr = stderr;
        }
        if (responseTopic) {
          client.publish(responseTopic, JSON.stringify(response));
        }
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
    const file = await OrderFile.findOne({_id: order.fileId})
    const printerId = order.printerId;

    console.log("order", order);
    console.log("printerId", printerId);

    console.log("file", file);

    if (order && file.data) {
      console.log("Order found, processing file...");

      // Convert MongoDB Binary to Buffer
      const fileBuffer = file.data.buffer;

      // Save file to temporary location
      fs.writeFileSync("/tmp/printfile", fileBuffer);
      console.log("File written to /tmp/printfile");

      const printer = await Printer.findOne({ 
        _id: printerId
      });

      console.log("printer", printer);
      
      const updatedPrinter =  await Printer.updateOne(
        { _id: printerId },
        { $set: { printingOrder: printerId } }
      );

      // update the order status to PRINTING
      await Order.updateOne(
        { _id: _id },
        { $set: { status: "PRINTING" } }
      );

      console.log("updatedPrinter", updatedPrinter);

      // Get the first available enabled printer
      exec(
        "lpstat -p | grep 'enabled' | awk '{print $2}' | head -n 1",
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error retrieving printers: ${error}`);
            return { error: error.message };
          }

          const firstEnabledPrinter = stdout.trim();
          if (firstEnabledPrinter) {
            console.log(`Using printer: ${firstEnabledPrinter}`);

            // Determine color option
            const colorOption =
              order.printType === "BLACKNWHITE"
                ? "ColorModel=Gray"
                : "ColorModel=RGB";

            // Print the file using the first available enabled printer
            exec(
              `lp -d ${firstEnabledPrinter} -o ${colorOption} /tmp/printfile`,
              // `sleep ${Math.floor(order.pages * 30)}`,
              async (error, stdout, stderr) => {q
                if (error) {
                  console.error(`Printing error: ${error}`);
                  await Printer.updateOne(
                    { _id: printerId },
                    { $set: { printingOrder: null } }
                  );

                  await Order.updateOne(
                    { _id: _id },
                    { $set: { status: "INCOMPLETE" } }
                  );

                  return { error: error.message };
                }
                stdout && console.log(`Printing stdout: ${stdout}`);
                stderr && console.error(`Printing stderr: ${stderr}`);
                
                // Update the printer's printingOrder to null after printing
               
                await Order.updateOne(
                  { _id: _id },
                  { $set: { status: "COMPLETED" } }
                );

                // first check if any other order is in queue
                const queue = await Order.find({
                  printerId: printerId,
                  status: { $in: ["IN_QUEUE"] },
                }).toArray();

                if (queue.length === 0) {
                  console.log("Updating printer's printingOrder to null");
                  
                  await Printer.updateOne(
                    { _id: printerId },
                    { $set: { printingOrder: null } }
                  );
                } else {
                  console.log("Queue not empty, printing next order...", queue);
                  // call this same function again with the first order in queue
                  const nextOrder = queue[0];
                  console.log("Next order in queue:", nextOrder);
                  handlePrintOrder(nextOrder._id);
                }

                return { stdout, stderr };
              }
            );
          } else {
            console.error("No enabled printers available.");
            return { error: "No enabled printers available" };
          }
        }
      );
    } else {
      console.log("Order not found or file missing");
      return { error: "Order not found or file missing" };
    }
  } catch (error) {
    console.error("Error retrieving order:", error);
    return { error: error.message };
  }
}

client.on("error", (err) => {
  console.error("MQTT client error:", err);
});

client.on("close", () => {
  console.log("Disconnected from MQTT Broker");
});
