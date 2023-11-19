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

router.get("/", validateToken, async (req, res) => {
  try {
    // Fetch all printers from the database
    const allPrinters = await PrinterIoT.find();

    res.status(200).json({ printers: allPrinters, message: "Printers retrieved successfully" });
  } catch (error) {
    console.error("Error fetching printers:", error);
    res.status(500).json({ error: "Failed to retrieve printers" });
  }
});

module.exports = router;
