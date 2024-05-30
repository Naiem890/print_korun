const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

async function dbConnect() {
  // eslint-disable-next-line no-undef
  const { DB_URI_CLOUD } = process.env;
  const dbUrl = DB_URI_CLOUD;

  console.log("DB_URI_CLOUD", DB_URI_CLOUD, process.env);

  try {
    await mongoose.connect(dbUrl, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database connected");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

module.exports = dbConnect;
