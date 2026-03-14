/**
 * Unit Tests — Room Template Controller
 * server/tests/unit/roomTemplate.unit.test.js
 */

const {
  createRoomTemplate,
  deleteRoomTemplate,
  getRoomTemplateById,
} = require("../../controllers/roomTemplateController");

jest.mock("../../models/RoomTemplate");
const RoomTemplate = require("../../models/RoomTemplate");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe("Room Template Controller — Unit Tests", () => {

  afterEach(() => jest.clearAllMocks());

  // ── 1. Create room template ───────────────────────────────────────────────
  describe("createRoomTemplate", () => {
    it("should return 201 with the created template for a valid payload", async () => {
      const saved = {
        _id: "64a1f2b3c4d5e6f7a8b9c0d2",
        name: "Living Room A",
        shape: "Rectangular",
        status: "Draft",
      };
      RoomTemplate.create = jest.fn().mockResolvedValue(saved);

      const req  = { body: { name: "Living Room A", shape: "Rectangular" } };
      const res  = mockRes();
      const next = jest.fn();

      await createRoomTemplate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: saved })
      );
    });

    it("should call next() on DB error", async () => {
      RoomTemplate.create = jest.fn().mockRejectedValue(new Error("DB write failed"));

      const req  = { body: { name: "Bad Room", shape: "Rectangular" } };
      const res  = mockRes();
      const next = jest.fn();

      await createRoomTemplate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ── 2. Get room template by ID ────────────────────────────────────────────
  describe("getRoomTemplateById", () => {
    it("should return 200 and the template for a valid existing ID", async () => {
      const template = { _id: "64a1f2b3c4d5e6f7a8b9c0d2", name: "Bedroom B", shape: "Square" };
      RoomTemplate.findById = jest.fn().mockResolvedValue(template);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d2" } };
      const res  = mockRes();
      const next = jest.fn();

      await getRoomTemplateById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: template })
      );
    });

    it("should return 404 when template not found", async () => {
      RoomTemplate.findById = jest.fn().mockResolvedValue(null);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d2" } };
      const res  = mockRes();
      const next = jest.fn();

      await getRoomTemplateById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for an invalid ID format", async () => {
      const req  = { params: { id: "bad-id" } };
      const res  = mockRes();
      const next = jest.fn();

      await getRoomTemplateById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ── 3. Delete room template ───────────────────────────────────────────────
  describe("deleteRoomTemplate", () => {
    it("should return 200 on successful deletion", async () => {
      RoomTemplate.findByIdAndDelete = jest.fn().mockResolvedValue({
        _id: "64a1f2b3c4d5e6f7a8b9c0d2",
      });

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d2" } };
      const res  = mockRes();
      const next = jest.fn();

      await deleteRoomTemplate(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("should return 404 when the template does not exist", async () => {
      RoomTemplate.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d2" } };
      const res  = mockRes();
      const next = jest.fn();

      await deleteRoomTemplate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});