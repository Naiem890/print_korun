const express = require("express");
const router = express.Router();
const Payment = require("../models/payment"); // Update the path based on your file structure
const { validateToken } = require("../middlewares/validateToken");

// POST endpoint to create a new payment
router.post("/", validateToken, async (req, res) => {
  try {
    const { amount, transactionId, status } = req.body;

    const newPayment = new Payment({
      amount,
      transactionId,
      status,
    });

    const savedPayment = await newPayment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint to retrieve payments
router.get("/",validateToken, async (req, res) => {
  try {
    let query = {}; // Default query for all payments

    // If paymentId is specified, update the query
    if (req.query.paymentId && req.query.paymentId.toLowerCase() !== "all") {
      query = { transactionId: req.query.paymentId };
    }

    const payments = await Payment.find(query);

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
