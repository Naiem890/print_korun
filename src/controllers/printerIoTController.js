const router = require("express").Router();
const { checkAdminRole } = require("../middlewares/checkAdminRole");
const { validateToken } = require("../middlewares/validateToken");
const PrinterIoT = require("../models/printerIoT");
const Order = require("../models/order");
const { Types } = require("mongoose");

// Create a new printer
router.post("/", validateToken, checkAdminRole, async (req, res) => {
  try {
    const {
      name,
      location,
      googleMapLink,
      ip,
      status,
      colorPrintPrice,
      BWPrintPrice,
    } = req.body;

    // Create a new printer instance
    const newPrinterIoT = new PrinterIoT({
      name,
      location,
      googleMapLink,
      ip,
      status,
      colorPrintPrice,
      BWPrintPrice,
    });

    // Save the printer to the database
    const savedPrinterIoT = await newPrinterIoT.save();

    res.status(200).json({
      printerIoT: savedPrinterIoT,
      message: "Printer created successfully",
    });
  } catch (error) {
    console.error("Error creating printer:", error);
    res.status(500).json({ error: "Failed to create printer" });
  }
});

router.get("/:printerIoTId?", validateToken, async (req, res) => {
  try {
    const { printerIoTId } = req.params;
    const { role } = req.user;

    let pipeline = [];

    if (printerIoTId && printerIoTId.toLowerCase() !== "all") {
      pipeline.push({ $match: { _id: new Types.ObjectId(printerIoTId) } });
    }

    pipeline.push({
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "printerId",
        as: "orderQueue",
        pipeline: [
          { $match: { status: { $in: ["IN_QUEUE", "PRINTING"] } } },
          { $project: { file: 0 } },
        ],
      },
    });

    if (role !== "admin") {
      pipeline.push({
        $project: {
          ip: 0,
          "orders.file": 0,
        },
      });
    } else {
      pipeline.push({
        $project: {
          "orders.file": 0,
        },
      });
    }

    const result = await PrinterIoT.aggregate(pipeline);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(404).json({ error: "Printer(s) not found" });
    }

    res.status(200).json({
      printerIoTs: result.length === 1 ? result[0] : result,
      statusEnum: PrinterIoT.schema.path("status").enumValues,
      message: printerIoTId ? "Printer retrieved successfully" : "All printers retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching printer(s):", error);
    res.status(500).json({ error: "Failed to retrieve printer(s)" });
  }
});


// Update an existing printer
router.put(
  "/:printerIoTId",
  validateToken,
  checkAdminRole,
  async (req, res) => {
    try {
      const { printerIoTId } = req.params;
      const {
        name,
        location,
        googleMapLink,
        ip,
        colorPrintPrice,
        BWPrintPrice,
      } = req.body;

      // Find the printer by ID
      const existingPrinterIoT = await PrinterIoT.findById(printerIoTId);

      if (!existingPrinterIoT) {
        return res.status(404).json({ error: "Printer not found" });
      }

      // Create an object with fields that are present in the request body
      const updateFields = {
        name,
        location,
        googleMapLink,
        ip,
        colorPrintPrice,
        BWPrintPrice,
      };

      // Filter out undefined values (fields that were not provided in the request body)
      const filteredUpdateFields = Object.fromEntries(
        Object.entries(updateFields).filter(
          ([key, value]) => value !== undefined
        )
      );

      // Update the printer details
      Object.assign(existingPrinterIoT, filteredUpdateFields);

      // Save the updated printer to the database
      const updatedPrinterIoT = await existingPrinterIoT.save();

      res.status(200).json({
        printerIoT: updatedPrinterIoT,
        message: "Printer updated successfully",
      });
    } catch (error) {
      console.error("Error updating printer:", error);
      res.status(500).json({ error: "Failed to update printer" });
    }
  }
);

router.delete(
  "/:printerIoTId",
  validateToken,
  checkAdminRole,
  async (req, res) => {
    try {
      const { printerIoTId } = req.params;

      // Find the printer by ID and delete it
      const deletedPrinterIoT = await PrinterIoT.findByIdAndDelete(
        printerIoTId
      );

      if (!deletedPrinterIoT) {
        return res.status(404).json({ error: "Printer not found" });
      }

      res.status(200).json({
        printerIoT: {
          _id: deletedPrinterIoT._id, // Access the _id directly
          name: deletedPrinterIoT.name,
          // Include other fields as needed
        },
        message: "Printer deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting printer:", error);
      res.status(500).json({ error: "Failed to delete printer" });
    }
  }
);
module.exports = router;
