const express = require("express");
const multer = require("multer");
const Order = require("../models/order");
const { validateToken } = require("../middlewares/validateToken");
const { Types } = require("mongoose");
const { sendMessage } = require("../config/mqttClient");
const orderFile = require("../models/orderFile");
const router = express.Router();

// Multer setup
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDFs are allowed."), false); // Reject the file
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post("/", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    // Assuming the request body contains the necessary information for the order
    const {
      paymentId,
      printerId,
      printType,
      highPriority,
      scheduledAt,
      // scheduledTime,
      status,
      pages,
      copies,
      totalCost,
      fileId,
    } = req.body;

    // Access the file buffer from the Multer middleware

    // Create a new order instance
    const newOrder = new Order({
      userId,
      paymentId,
      printerId,
      fileId,
      printType,
      highPriority,
      scheduledAt,
      // scheduledTime,
      status,
      pages,
      copies,
      totalCost,
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    // get order with status IN_QUEUE and PRINTING
    const queue = await Order.find({
      printerId: printerId,
      status: { $in: ["IN_QUEUE", "PRINTING"] },
    });

    console.log("queue", queue);

    if (queue.length === 0) {
      // If the queue is empty, send the order to the printer
      sendMessage({
        action: "PRINT_ORDER",
        payload: {
          orderId: savedOrder._id,
        },
      });
    } else {
      // If the queue is not empty, update the status of the order to IN_QUEUE
      savedOrder.status = "IN_QUEUE";
      await savedOrder.save();
    }
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }

    const fileBuffer = req.file.buffer;

    const newFile = new orderFile({
      data: fileBuffer,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const savedFile = await newFile.save();

    res
      .status(201)
      .json({ message: "File uploaded succesfully", fileId: savedFile._id });
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

    // Sort by createdAt in descending order
    pipeline.push({
      $sort: { createdAt: -1 },
    });

    console.log("pipeline", pipeline);

    const orders = await Order.aggregate(pipeline).allowDiskUse(true);

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

    const file = await orderFile.findById(order.fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    const fileBuffer = file.data;

    res.send(fileBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
