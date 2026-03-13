const mongoose = require("mongoose");
const Design   = require("../models/Design");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---------------------------------------------------------------------------
// Normalise & whitelist incoming payload fields
// ---------------------------------------------------------------------------
const normalizeDesignPayload = (payload = {}) => {
  const data = {};

  if (payload.name !== undefined)
    data.name = String(payload.name).trim() || "Untitled Design";

  if (payload.clientName !== undefined)
    data.clientName = String(payload.clientName || "").trim();

  if (payload.status !== undefined)
    data.status = ["Draft", "Published"].includes(payload.status) ? payload.status : "Draft";

  if (payload.isFinalized !== undefined)
    data.isFinalized = Boolean(payload.isFinalized);

  const DESIGN_STYLES = ['Scandinavian','Minimalist','Traditional','Modern','Industrial',
                          'Bohemian','Contemporary','Coastal','Rustic','Art Deco','Other',''];
  const ROOM_TYPES    = ['Living Room','Bedroom','Kitchen','Dining Room','Office','Bathroom',
                          'Kids Room','Hallway','Balcony','Studio','Other',''];
  if (payload.designStyle !== undefined)
    data.designStyle = DESIGN_STYLES.includes(payload.designStyle) ? payload.designStyle : '';
  if (payload.roomType !== undefined)
    data.roomType = ROOM_TYPES.includes(payload.roomType) ? payload.roomType : '';

  if (payload.room !== undefined)
    data.room = payload.room;

  if (payload.placedItems !== undefined)
    data.placedItems = Array.isArray(payload.placedItems) ? payload.placedItems : [];

  return data;
};

// ---------------------------------------------------------------------------
// GET /api/designs
// Query params: search, status, isFinalized, clientName, page, limit, sortBy, order
// ---------------------------------------------------------------------------
const listDesigns = async (req, res, next) => {
  try {
    const {
      search,
      status,
      isFinalized,
      clientName,
      designStyle,
      roomType,
      page   = 1,
      limit  = 20,
      sortBy = "updatedAt",
      order  = "desc",
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name:       { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
      ];
    }
    if (status)     filter.status     = status;
    if (clientName) filter.clientName = { $regex: clientName, $options: "i" };
    if (isFinalized !== undefined && isFinalized !== "")
      filter.isFinalized = isFinalized === "true" || isFinalized === true;
    if (designStyle) filter.designStyle = designStyle;
    if (roomType)    filter.roomType    = roomType;

    const safePage   = Math.max(Number(page)  || 1,  1);
    const safeLimit  = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const sortOrder  = order === "asc" ? 1 : -1;
    const ALLOWED    = new Set(["createdAt", "updatedAt", "name", "status", "clientName", "designStyle", "roomType"]);
    const finalSort  = ALLOWED.has(sortBy) ? sortBy : "updatedAt";

    const [items, total] = await Promise.all([
      Design.find(filter)
        .sort({ [finalSort]: sortOrder })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      Design.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    items,
      pagination: {
        total,
        page:       safePage,
        limit:      safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (err) { next(err); }
};

// ---------------------------------------------------------------------------
// GET /api/designs/:id
// ---------------------------------------------------------------------------
const getDesignById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ success: false, message: "Invalid design ID." });

    const item = await Design.findById(id).lean();
    if (!item)
      return res.status(404).json({ success: false, message: "Design not found." });

    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

// ---------------------------------------------------------------------------
// POST /api/designs
// ---------------------------------------------------------------------------
const createDesign = async (req, res, next) => {
  try {
    const payload = normalizeDesignPayload(req.body || {});
    const doc     = new Design(payload);
    const created = await doc.save();               // always fires pre-save hooks
    res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

// ---------------------------------------------------------------------------
// PUT /api/designs/:id  — full update (workspace save / edit save)
// ---------------------------------------------------------------------------
const updateDesign = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ success: false, message: "Invalid design ID." });

    const item = await Design.findById(id);
    if (!item)
      return res.status(404).json({ success: false, message: "Design not found." });

    const payload = normalizeDesignPayload(req.body || {});
    Object.assign(item, payload);

    const updated = await item.save();
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// ---------------------------------------------------------------------------
// PATCH /api/designs/:id/publish
// ---------------------------------------------------------------------------
const publishDesign = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ success: false, message: "Invalid design ID." });

    const item = await Design.findByIdAndUpdate(
      id,
      { status: "Published" },
      { new: true }
    );
    if (!item)
      return res.status(404).json({ success: false, message: "Design not found." });

    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

// ---------------------------------------------------------------------------
// DELETE /api/designs/:id  — permanent hard delete
// ---------------------------------------------------------------------------
const deleteDesign = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ success: false, message: "Invalid design ID." });

    const deleted = await Design.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Design not found." });

    res.json({ success: true, message: "Design permanently deleted." });
  } catch (err) { next(err); }
};

module.exports = {
  listDesigns,
  getDesignById,
  createDesign,
  updateDesign,
  publishDesign,
  deleteDesign,
};