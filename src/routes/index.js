const router = require("express").Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const printerIoTController = require("../controllers/printerIoTController");
const paymentController = require("../controllers/paymentController");
const orderController = require("../controllers/orderController");

router.use("/auth", authController);
router.use("/user", userController);
router.use("/printerIoT", printerIoTController);
router.use("/payment", paymentController);
router.use("/order", orderController);

module.exports = router;
