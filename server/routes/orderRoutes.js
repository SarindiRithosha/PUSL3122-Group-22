const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/customer/me", orderController.getCustomerOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id", orderController.updateOrderStatus);

module.exports = router;
