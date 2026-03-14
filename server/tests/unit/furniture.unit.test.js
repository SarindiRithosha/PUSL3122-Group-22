const { createFurniture, deleteFurniture, getFurnitureById } = require("../../controllers/furnitureController");

// ── Mock the Furniture model 
jest.mock("../../models/Furniture");
const Furniture = require("../../models/Furniture");

// Helper: build a minimal Express-like req/res pair
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe("Furniture Controller — Unit Tests", () => {

  afterEach(() => jest.clearAllMocks());

  //  1. Create furniture 
  describe("createFurniture", () => {
    it("should return 201 and the created item on valid payload", async () => {
      const saved = {
        _id: "abc123",
        modelId: "CHAIR-001",
        name: "Oak Chair",
        category: "Chair",
        price: 12000,
        status: "Draft",
      };

      // Furniture.create() resolves with the saved doc
      Furniture.create = jest.fn().mockResolvedValue(saved);

      const req = {
        body: {
          modelId:  "CHAIR-001",
          name:     "Oak Chair",
          category: "Chair",
          price:    12000,
        },
      };
      const res  = mockRes();
      const next = jest.fn();

      await createFurniture(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: saved })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() when Furniture.create throws", async () => {
      Furniture.create = jest.fn().mockRejectedValue(new Error("DB error"));

      const req  = { body: { name: "Bad Item", category: "X", price: 0 } };
      const res  = mockRes();
      const next = jest.fn();

      await createFurniture(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should return 409 on duplicate modelId", async () => {
      const dupError = new Error("duplicate key");
      dupError.code  = 11000;
      Furniture.create = jest.fn().mockRejectedValue(dupError);

      const req  = { body: { modelId: "CHAIR-001", name: "Oak Chair", category: "Chair", price: 100 } };
      const res  = mockRes();
      const next = jest.fn();

      await createFurniture(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  //  2. Get furniture by ID 
  describe("getFurnitureById", () => {
    it("should return 200 and the item for a valid existing ID", async () => {
      const item = { _id: "64a1f2b3c4d5e6f7a8b9c0d1", name: "Sofa", category: "Sofa", price: 50000 };
      Furniture.findById = jest.fn().mockResolvedValue(item);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d1" } };
      const res  = mockRes();
      const next = jest.fn();

      await getFurnitureById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: item })
      );
    });

    it("should return 404 when furniture is not found", async () => {
      Furniture.findById = jest.fn().mockResolvedValue(null);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d1" } };
      const res  = mockRes();
      const next = jest.fn();

      await getFurnitureById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it("should return 400 for a malformed ID", async () => {
      const req  = { params: { id: "not-a-valid-mongo-id" } };
      const res  = mockRes();
      const next = jest.fn();

      await getFurnitureById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  //  3. Delete furniture 
  describe("deleteFurniture", () => {
    it("should return 200 and success message when item is deleted", async () => {
      Furniture.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: "64a1f2b3c4d5e6f7a8b9c0d1" });

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d1" } };
      const res  = mockRes();
      const next = jest.fn();

      await deleteFurniture(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("should return 404 when item to delete does not exist", async () => {
      Furniture.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d1" } };
      const res  = mockRes();
      const next = jest.fn();

      await deleteFurniture(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});