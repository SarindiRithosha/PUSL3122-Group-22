const mongoose = require("mongoose");
const Furniture = require("../models/Furniture");

const toPositiveNumber = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
};

const normalizeFurniturePayload = (payload, options = { requireModelId: true }) => {
  const data = {};

  if (payload.modelId !== undefined) data.modelId = String(payload.modelId).trim();
  if (payload.name !== undefined) data.name = String(payload.name).trim();
  if (payload.category !== undefined) data.category = String(payload.category).trim();
  if (payload.price !== undefined) data.price = Number(payload.price);
  if (payload.description !== undefined) data.description = String(payload.description).trim();

  if (payload.colors !== undefined) {
    data.colors = Array.isArray(payload.colors)
      ? payload.colors.map((color) => String(color).trim())
      : [];
  }

  if (payload.dimensions !== undefined || payload.width !== undefined || payload.depth !== undefined || payload.height !== undefined) {
    const dimensionsSource = payload.dimensions || {};
    data.dimensions = {
      width: toPositiveNumber(dimensionsSource.width ?? payload.width, 1),
      depth: toPositiveNumber(dimensionsSource.depth ?? payload.depth, 1),
      height: toPositiveNumber(dimensionsSource.height ?? payload.height, 1),
    };
  }

  if (payload.shading !== undefined) data.shading = Boolean(payload.shading);
  if (payload.previewMode !== undefined) data.previewMode = payload.previewMode;
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.image2DUrl !== undefined) data.image2DUrl = String(payload.image2DUrl).trim();

  if (payload.model3D !== undefined || payload.model3DUrl !== undefined || payload.modelFormat !== undefined || payload.scale !== undefined) {
    const source = payload.model3D || {};
    data.model3D = {
      fileUrl: String(source.fileUrl ?? payload.model3DUrl ?? "").trim(),
      format: String(source.format ?? payload.modelFormat ?? "").toLowerCase().trim(),
      scale: {
        x: toPositiveNumber(source?.scale?.x ?? payload?.scale?.x, 1),
        y: toPositiveNumber(source?.scale?.y ?? payload?.scale?.y, 1),
        z: toPositiveNumber(source?.scale?.z ?? payload?.scale?.z, 1),
      },
    };
  }

  if (options.requireModelId && !data.modelId) {
    data.modelId = `FUR-${Date.now()}`;
  }

  return data;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const listFurniture = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 20, 1);
    const sortOrder = order === "asc" ? 1 : -1;

    const allowedSort = new Set(["createdAt", "updatedAt", "name", "price", "category"]);
    const finalSortField = allowedSort.has(sortBy) ? sortBy : "createdAt";

    const [items, total] = await Promise.all([
      Furniture.find(filter)
        .sort({ [finalSortField]: sortOrder })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
      Furniture.countDocuments(filter),
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

const getFurnitureById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid furniture ID." });
    }

    const furniture = await Furniture.findById(id);
    if (!furniture) {
      return res.status(404).json({ success: false, message: "Furniture not found." });
    }

    res.json({ success: true, data: furniture });
  } catch (error) {
    next(error);
  }
};

const createFurniture = async (req, res, next) => {
  try {
    const payload = normalizeFurniturePayload(req.body, { requireModelId: true });
    const created = await Furniture.create(payload);

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "modelId must be unique." });
    }
    next(error);
  }
};

const updateFurniture = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid furniture ID." });
    }

    const payload = normalizeFurniturePayload(req.body, { requireModelId: false });
    const furniture = await Furniture.findById(id);
    if (!furniture) {
      return res.status(404).json({ success: false, message: "Furniture not found." });
    }

    if (payload.dimensions) {
      furniture.dimensions = {
        ...furniture.dimensions.toObject(),
        ...payload.dimensions,
      };
      delete payload.dimensions;
    }

    if (payload.model3D) {
      const currentModel3D = furniture.model3D?.toObject?.() || {};
      const currentScale = currentModel3D.scale || {};

      furniture.model3D = {
        ...currentModel3D,
        ...payload.model3D,
        scale: {
          ...currentScale,
          ...(payload.model3D.scale || {}),
        },
      };
      delete payload.model3D;
    }

    Object.assign(furniture, payload);
    const updated = await furniture.save();

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "modelId must be unique." });
    }
    next(error);
  }
};

const updateFurnitureScale = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid furniture ID." });
    }

    const furniture = await Furniture.findById(id);
    if (!furniture) {
      return res.status(404).json({ success: false, message: "Furniture not found." });
    }

    const requestedScale = req.body || {};
    const hasAnyAxis =
      requestedScale.x !== undefined ||
      requestedScale.y !== undefined ||
      requestedScale.z !== undefined;

    if (!hasAnyAxis) {
      return res.status(400).json({
        success: false,
        message: "At least one scale axis (x, y, z) is required.",
      });
    }

    const currentScale = furniture.model3D?.scale?.toObject?.() || { x: 1, y: 1, z: 1 };
    furniture.model3D.scale = {
      x: toPositiveNumber(requestedScale.x, currentScale.x),
      y: toPositiveNumber(requestedScale.y, currentScale.y),
      z: toPositiveNumber(requestedScale.z, currentScale.z),
    };

    const updated = await furniture.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteFurniture = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid furniture ID." });
    }

    const deleted = await Furniture.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Furniture not found." });
    }

    res.json({ success: true, message: "Furniture deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listFurniture,
  getFurnitureById,
  createFurniture,
  updateFurniture,
  updateFurnitureScale,
  deleteFurniture,
};
