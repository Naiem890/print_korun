const express = require("express");
const multer = require("multer");
const Order = require("../models/order");
const { validateToken } = require("../middlewares/validateToken");
const router = express.Router();

// Multer setup
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage: storage });

router.post("/", validateToken, upload.single("file"), async (req, res) => {
  console.log("req.user=>>>", req.user);
  try {
    const userId = req.user._id;
    // Assuming the request body contains the necessary information for the order
    const {
      paymentId,
      printerId,
      printType,
      highPriority,
      scheduledAt,
      scheduledTime,
      status,
      pages,
      copies,
      totalCost,
    } = req.body;

    // Access the file buffer from the Multer middleware
    const fileBuffer = req.file.buffer;

    // Create a new order instance
    const newOrder = new Order({
      userId,
      paymentId,
      printerId,
      file: fileBuffer,
      printType,
      highPriority,
      scheduledAt,
      scheduledTime,
      status,
      pages,
      copies,
      totalCost,
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get orders (all or specific by ID)
router.get("/:orderId?", validateToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user._id;
    const role = req.user.role;

    if (orderId) {
      // If orderId is provided, find the specific order by ID
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      return res.status(200).json(order);
    } else {
      // If no orderId is provided, fetch all orders
      const orders = await Order.find();
      return res.status(200).json(orders);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
