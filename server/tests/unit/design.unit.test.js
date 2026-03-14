const {
  createDesign,
  publishDesign,
  deleteDesign,
} = require("../../controllers/designController");

jest.mock("../../models/Design");
const Design = require("../../models/Design");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe("Design Controller — Unit Tests", () => {

  afterEach(() => jest.clearAllMocks());

  //  1. Create design 
  describe("createDesign", () => {
    it("should return 201 with the saved design on valid payload", async () => {
      const savedDesign = {
        _id:     "64a1f2b3c4d5e6f7a8b9c0d3",
        name:    "Minimalist Studio",
        status:  "Draft",
        save:    jest.fn().mockResolvedValue(undefined),
        toObject:jest.fn().mockReturnValue({}),
      };

      // Design is used as a constructor — mock the instance
      Design.mockImplementation(() => savedDesign);
      savedDesign.save.mockResolvedValue(savedDesign);

      const req  = { body: { name: "Minimalist Studio", designStyle: "Minimalist", roomType: "Studio" } };
      const res  = mockRes();
      const next = jest.fn();

      await createDesign(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("should call next() when save throws", async () => {
      const failDoc = { save: jest.fn().mockRejectedValue(new Error("Validation failed")) };
      Design.mockImplementation(() => failDoc);

      const req  = { body: {} };
      const res  = mockRes();
      const next = jest.fn();

      await createDesign(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  //  2. Publish design 
  describe("publishDesign", () => {
    it("should return 200 with status:Published on valid ID", async () => {
      const updated = { _id: "64a1f2b3c4d5e6f7a8b9c0d3", status: "Published" };
      Design.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d3" } };
      const res  = mockRes();
      const next = jest.fn();

      await publishDesign(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: updated })
      );
    });

    it("should return 404 when design to publish is not found", async () => {
      Design.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d3" } };
      const res  = mockRes();
      const next = jest.fn();

      await publishDesign(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for an invalid ID", async () => {
      const req  = { params: { id: "not-valid" } };
      const res  = mockRes();
      const next = jest.fn();

      await publishDesign(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  //  3. Delete design 
  describe("deleteDesign", () => {
    it("should return 200 on successful deletion", async () => {
      Design.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: "64a1f2b3c4d5e6f7a8b9c0d3" });

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d3" } };
      const res  = mockRes();
      const next = jest.fn();

      await deleteDesign(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("should return 404 when design to delete is not found", async () => {
      Design.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const req  = { params: { id: "64a1f2b3c4d5e6f7a8b9c0d3" } };
      const res  = mockRes();
      const next = jest.fn();

      await deleteDesign(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});