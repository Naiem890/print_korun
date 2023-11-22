const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    transactionId: { type: String, unique: true, required: true },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "RECEIVED", "DECLINED"],
      set: (value) => value.toUpperCase(),
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
