const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const dbConnect = require("./config/database");
const apiRoutes = require("./routes/index");
// load env variables
require("dotenv").config();

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Connect to the database
dbConnect();

app.listen(port, () => {
  console.log(`Print Korun app listening on port ${port}`);
  console.log(`Running on: http://localhost:${port}`);
});
