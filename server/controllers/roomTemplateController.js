const mongoose = require("mongoose");
const RoomTemplate = require("../models/RoomTemplate");

const toPositiveNumber = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
};

const normalizeColorList = (value, fallback = ["#FFFFFF"]) => {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }

  return value.map((color) => String(color).trim().toUpperCase());
};

const normalizeRoomPayload = (payload) => {
  const data = {};

  if (payload.name !== undefined) data.name = String(payload.name).trim();
  if (payload.shape !== undefined) data.shape = String(payload.shape).trim();
  if (payload.floorMaterial !== undefined) data.floorMaterial = String(payload.floorMaterial).trim();
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.previewMode !== undefined) data.previewMode = payload.previewMode;
  if (payload.snapping !== undefined) data.snapping = Boolean(payload.snapping);

  const dimensionsSource = payload.dimensions || {};
  if (
    payload.dimensions !== undefined ||
    payload.width !== undefined ||
    payload.length !== undefined ||
    payload.height !== undefined
  ) {
    data.dimensions = {
      width: toPositiveNumber(dimensionsSource.width ?? payload.width, 1),
      length: toPositiveNumber(dimensionsSource.length ?? payload.length, 1),
      height: toPositiveNumber(dimensionsSource.height ?? payload.height, 2.5),
    };
  }

  if (payload.floorColors !== undefined) {
    data.floorColors = normalizeColorList(payload.floorColors);
  }

  if (payload.wallColors !== undefined) {
    data.wallColors = normalizeColorList(payload.wallColors);
  }

  return data;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const listRoomTemplates = async (req, res, next) => {
  try {
    const {
      search,
      shape,
      status,
      page = 1,
      limit = 20,
      sortBy = "updatedAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { shape: { $regex: search, $options: "i" } },
        { floorMaterial: { $regex: search, $options: "i" } },
      ];
    }
    if (shape) filter.shape = shape;
    if (status) filter.status = status;

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const sortOrder = order === "asc" ? 1 : -1;
    const allowedSort = new Set(["createdAt", "updatedAt", "name", "shape", "status"]);
    const finalSort = allowedSort.has(sortBy) ? sortBy : "updatedAt";

    const [items, total] = await Promise.all([
      RoomTemplate.find(filter)
        .sort({ [finalSort]: sortOrder })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
      RoomTemplate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRoomTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid room template ID." });
    }

    const item = await RoomTemplate.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Room template not found." });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const createRoomTemplate = async (req, res, next) => {
  try {
    const payload = normalizeRoomPayload(req.body || {});
    const created = await RoomTemplate.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

const updateRoomTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid room template ID." });
    }

    const item = await RoomTemplate.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Room template not found." });
    }

    const payload = normalizeRoomPayload(req.body || {});

    if (payload.dimensions) {
      item.dimensions = {
        ...item.dimensions.toObject(),
        ...payload.dimensions,
      };
      delete payload.dimensions;
    }

    Object.assign(item, payload);
    const updated = await item.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteRoomTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid room template ID." });
    }

    const deleted = await RoomTemplate.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Room template not found." });
    }

    res.json({ success: true, message: "Room template deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRoomTemplates,
  getRoomTemplateById,
  createRoomTemplate,
  updateRoomTemplate,
  deleteRoomTemplate,
};
