const router = require("express").Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const printerIoTController = require("../controllers/printerIoTController");

router.use("/auth", authController);
router.use("/user", userController);
router.use("/printerIoT", printerIoTController);

module.exports = router;
