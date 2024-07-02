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
    default: "",
  },
  ip: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "ONLINE", // if printer is online, it can be used for printing
      "OFFLINE", // if printer is offline, it cannot be used for printing
      "PAPER_JAM", // if printer has paper jam, it cannot be used for printing
      "NO_PAPER", // if printer has no paper, it cannot be used for printing
      "NO_TONER", // if printer has no toner, it cannot be used for printing
    ],
    required: true,
    default: "OFFLINE",
  },
  printingOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null,
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
