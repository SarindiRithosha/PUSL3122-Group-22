// server/controllers/customerDesignController.js
const CustomerDesign = require("../models/CustomerDesign");

// GET /api/customer/designs
const listMyDesigns = async (req, res, next) => {
  try {
    const designs = await CustomerDesign.find({ customerId: req.customerUser._id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, data: designs });
  } catch (err) { next(err); }
};

// GET /api/customer/designs/:id
const getMyDesignById = async (req, res, next) => {
  try {
    const design = await CustomerDesign.findOne({
      _id: req.params.id,
      customerId: req.customerUser._id,
    }).lean();
    if (!design) return res.status(404).json({ success: false, message: "Design not found." });
    res.json({ success: true, data: design });
  } catch (err) { next(err); }
};

// POST /api/customer/designs
const createMyDesign = async (req, res, next) => {
  try {
    const { name, room, placedItems } = req.body;
    const design = await new CustomerDesign({
      customerId:  req.customerUser._id,
      name:        String(name || "My Design").trim() || "My Design",
      room:        room        || {},
      placedItems: Array.isArray(placedItems) ? placedItems : [],
    }).save();
    res.status(201).json({ success: true, data: design });
  } catch (err) { next(err); }
};

// PUT /api/customer/designs/:id
const updateMyDesign = async (req, res, next) => {
  try {
    const { name, room, placedItems } = req.body;
    const patch = {};
    if (name        !== undefined) patch.name        = String(name).trim() || "My Design";
    if (room        !== undefined) patch.room        = room;
    if (placedItems !== undefined) patch.placedItems = Array.isArray(placedItems) ? placedItems : [];

    const design = await CustomerDesign.findOneAndUpdate(
      { _id: req.params.id, customerId: req.customerUser._id },
      patch,
      { new: true, runValidators: true }
    );
    if (!design) return res.status(404).json({ success: false, message: "Design not found." });
    res.json({ success: true, data: design });
  } catch (err) { next(err); }
};

// DELETE /api/customer/designs/:id
const deleteMyDesign = async (req, res, next) => {
  try {
    const result = await CustomerDesign.deleteOne({
      _id: req.params.id,
      customerId: req.customerUser._id,
    });
    if (!result.deletedCount)
      return res.status(404).json({ success: false, message: "Design not found." });
    res.json({ success: true, message: "Design deleted." });
  } catch (err) { next(err); }
};

module.exports = {
  listMyDesigns,
  getMyDesignById,
  createMyDesign,
  updateMyDesign,
  deleteMyDesign,
};