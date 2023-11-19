const mongoose = require("mongoose");

const printerIoTSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  googleMapLink: {
    type: String,
  },
  ip: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "ONLINE",
      "OFFLINE",
      "ACTIVE",
      "INACTIVE",
      "PAPER_JAM",
      "NO_PAPER",
      "NO_TONER",
    ],
    required: true,
    default: "OFFLINE",
  },
  colorPrintPrice: {
    type: Number,
    default: 0,
  },
  BWPrintPrice: {
    type: Number,
    default: 0,
  },
});

const PrinterIoT = mongoose.model("PrinterIoT", printerIoTSchema);

module.exports = PrinterIoT;
