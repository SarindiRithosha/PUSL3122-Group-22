const orderController = require("../../controllers/orderController");

jest.mock("../../models/Order");
const Order = require("../../models/Order");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

const validOrderBody = {
  items: [
    {
      furnitureId: "64a1f2b3c4d5e6f7a8b9c0d9",
      name:        "Oak Chair",
      price:       12000,
      quantity:    2,
      subtotal:    24000,
    },
  ],
  shipping: {
    name:    "John Doe",
    email:   "john@example.com",
    address: "123 Main St",
    city:    "Colombo",
    zip:     "00100",
  },
  subtotal:     24000,
  tax:          1920,
  shippingCost: 0,
  total:        25920,
};

describe("Order Controller — Unit Tests", () => {

  afterEach(() => jest.clearAllMocks());

  //  1. Create order 
  describe("createOrder", () => {
    it("should return 201 with order data on valid payload", async () => {
      const savedOrder = { _id: "ord123", ...validOrderBody, orderNumber: "ORD-001" };
      const mockInstance = { save: jest.fn().mockResolvedValue(savedOrder), ...savedOrder };
      Order.mockImplementation(() => mockInstance);

      const req  = { body: validOrderBody };
      const res  = mockRes();

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("should return 400 when items array is empty", async () => {
      const req = { body: { ...validOrderBody, items: [] } };
      const res = mockRes();

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it("should return 400 when shipping fields are missing", async () => {
      const req = {
        body: {
          ...validOrderBody,
          shipping: { name: "John" }, // incomplete
        },
      };
      const res = mockRes();

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on unexpected DB error", async () => {
      const mockInstance = { save: jest.fn().mockRejectedValue(new Error("DB crash")) };
      Order.mockImplementation(() => mockInstance);

      const req = { body: validOrderBody };
      const res = mockRes();

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  //  2. Update order status 
  describe("updateOrderStatus", () => {
    it("should return 200 with the updated order", async () => {
      const updated = { _id: "ord123", status: "Shipped" };
      Order.findByIdAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(updated),
      });

      const req  = { params: { id: "ord123" }, body: { status: "Shipped" } };
      const res  = mockRes();

      await orderController.updateOrderStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: updated })
      );
    });

    it("should return 404 when order is not found", async () => {
      Order.findByIdAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const req  = { params: { id: "nonexistent" }, body: { status: "Shipped" } };
      const res  = mockRes();

      await orderController.updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});