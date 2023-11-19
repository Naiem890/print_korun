const router = require("express").Router();
const { checkAdminRole } = require("../middlewares/checkAdminRole");
const { validateToken } = require("../middlewares/validateToken");
const PrinterIoT = require("../models/printerIoT");

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
      bAndWPrintPrice,
    } = req.body;

    // Create a new printer instance
    const newPrinterIoT = new PrinterIoT({
      name,
      location,
      googleMapLink,
      ip,
      status,
      colorPrintPrice,
      bAndWPrintPrice,
    });

    // Save the printer to the database
    const savedPrinterIoT = await newPrinterIoT.save();

    res.status(200).json({printerIoT: savedPrinterIoT, message: "Printer created successfully"});
  } catch (error) {
    console.error("Error creating printer:", error);
    res.status(500).json({ error: "Failed to create printer" });
  }
});

router.get("/:printerIoTId", validateToken, async (req, res) => {
  try {
    const { printerIoTId } = req.params;

    if (printerIoTId && printerIoTId.toLowerCase() !== "all") {
      const result = await PrinterIoT.findById(printerIoTId);

      if (!result) {
        return res.status(404).json({ error: "Printer not found" });
      }

      return res.status(200).json({ printerIoTs: result, message: "Printer retrieved successfully" });
    }

    const result = await PrinterIoT.find();
    res.status(200).json({ printerIoTs: result, message: "All printers retrieved successfully" });

  } catch (error) {
    console.error("Error fetching printer(s):", error);
    res.status(500).json({ error: "Failed to retrieve printer(s)" });
  }
});
module.exports = router;
