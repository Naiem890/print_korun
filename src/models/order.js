const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    printerId: { type: Schema.Types.ObjectId, ref: "Printer", required: true },
    // eslint-disable-next-line no-undef
    file: { type: Buffer, required: true },
    printType: {
      type: String,
      enum: ["COLOR", "BLACKNWHITE"],
      required: true,
      set: (value) => value.toUpperCase(),
    },
    highPriority: { type: Boolean, required: true, default: false },
    scheduledAt: {
      type: String,
      enum: ["NOW", "LATER"],
      required: true,
      default: "NOW",
      set: (value) => value.toUpperCase(),
    },
    scheduledTime: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "IN_QUEUE",
        "PRINTING",
        "READY_FOR_PICKUP",
        "COMPLETED",
        "CANCELLED",
        "ON_HOLD",
      ],
      default: "ORDER_PLACED",
      required: true,
      set: (value) => value.toUpperCase(),
    },
    pages: { type: Number, required: true },
    copies: { type: Number, required: true },
    totalCost: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
