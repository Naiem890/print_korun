const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const dbConnect = require("./config/database");
const apiRoutes = require("./routes/index");
const { sendSMS } = require("./utils/helper");
const { sendMessage, sendAndGetBackResponse } = require("./config/mqttClient");

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

// Example route to send a command to all Pi clients
app.get("/send-command", (req, res) => {
  sendAndGetBackResponse({
    action: "EXECUTE_COMMAND",
    payload: "cd / && node -v && npm -v",
  })
    .then((data) => {
      console.log("data", data);
      res.json(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).send({ error: error.message });
    });
});

app.listen(port, () => {
  console.log(`Print Korun app listening on port ${port}`);
  console.log(`Running on: http://localhost:${port}`);
});
