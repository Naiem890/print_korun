const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

async function dbConnect() {
  // eslint-disable-next-line no-undef
  const { DB_URI_CLOUD } = process.env;
  const dbUrl = DB_URI_CLOUD;

  try {
    await mongoose.connect(
      "mongodb+srv://solaimannaiem890:F6F6tUC4jmzOhghq@cluster0.ucvcm05.mongodb.net/sohoz_print",
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        serverSelectionTimeoutMS: 5000,
      }
    );
    console.log("Database connected");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

module.exports = dbConnect;
