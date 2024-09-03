const mongoose = require("mongoose");

const orderFileSchema = new mongoose.Schema(
  {
    data: Buffer, // The file data as a binary buffer
    filename: String, // The original file name
    contentType: String, // The MIME type of the file
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderFile", orderFileSchema);
