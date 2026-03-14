const Order = require("../models/Order");

/**
 * Create a new order
 * @route POST /api/orders
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shipping, subtotal, tax, shippingCost, total, designId } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (!shipping || !shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.zip) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping information is required",
      });
    }

    // Get customer ID from auth token if available
    const customerId = req.user?.id || null;

    // Create order
    const order = new Order({
      customerId,
      designId: designId || null,
      items,
      shipping,
      subtotal,
      tax,
      shippingCost,
      total,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: err.message,
    });
  }
};

/**
 * Get all orders (admin)
 * @route GET /api/orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("customerId", "name email")
      .populate("designId", "name")
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
};

/**
 * Get single order
 * @route GET /api/orders/:id
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: err.message,
    });
  }
};

/**
 * Update order status (admin)
 * @route PATCH /api/orders/:id
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: err.message,
    });
  }
};

/**
 * Get customer's orders
 * @route GET /api/customer/orders
 */
exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.customerUser._id;
    const customerEmail = req.customerUser.email;

    // Find orders by customerId OR by email (for guest orders before login)
    const orders = await Order.find({
      $or: [
        { customerId: customerId },
        { "shipping.email": customerEmail }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
};
