const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Public (can be guest or authenticated customer)
 */
router.post("/", orderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin only, handled by middleware)
 * @access  Admin
 */
router.get("/", orderController.getAllOrders);

/**
 * @route   GET /api/orders/customer/me
 * @desc    Get logged-in customer's orders
 * @access  Customer (authenticated)
 */
router.get("/customer/me", orderController.getCustomerOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Admin or order owner
 */
router.get("/:id", orderController.getOrderById);

/**
 * @route   PATCH /api/orders/:id
 * @desc    Update order status
 * @access  Admin
 */
router.patch("/:id", orderController.updateOrderStatus);

module.exports = router;
