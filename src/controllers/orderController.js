const express = require("express");
const multer = require("multer");
const Order = require("../models/order");
const { validateToken } = require("../middlewares/validateToken");
const { Types } = require("mongoose");
const { sendMessage } = require("../config/mqttClient");
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

    // send the savedOrderId to mqtt
    sendMessage({
      action: "PRINT_ORDER",
      payload: { orderId: savedOrder._id },
    });

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

    let pipeline = [];

    if (orderId) {
      // If orderId is provided, find the specific order by ID
      pipeline.push({ $match: { _id: new Types.ObjectId(orderId) } });
    }

    if (role === "admin") {
      // If the user is an admin, populate the user details
      pipeline.push({
        $lookup: {
          from: "users", // Replace with the actual collection name
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      });
      pipeline.push({
        $project: {
          "user.password": 0, // Exclude password field
        },
      });
    } else {
      // If the user is not an admin, only return orders belonging to the user
      pipeline.push({ $match: { userId: new Types.ObjectId(userId) } });
    }

    // Stage to populate printers data for all users
    pipeline.push({
      $lookup: {
        from: "printeriots", // Replace with the actual collection name
        localField: "printerId",
        foreignField: "_id",
        as: "printer",
      },
    });

    // Stage to project the necessary fields and exclude 'file'
    pipeline.push({
      $project: {
        file: 0,
        // Include other fields you need in the response
      },
    });

    // populate payment details
    pipeline.push({
      $lookup: {
        from: "payments",
        localField: "paymentId",
        foreignField: "_id",
        as: "payment",
      },
    });

    const orders = await Order.aggregate(pipeline);

    if (!orders || (Array.isArray(orders) && orders.length === 0)) {
      return res.status(404).json({ error: "Order(s) not found" });
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// download a print order file
router.get("/:orderId/download", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Assuming the file is stored as a Buffer in the 'file' field of the order
    const fileBuffer = order.file;

    res.send(fileBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
