// server/models/CustomerDesign.js
const mongoose = require("mongoose");

const placedItemSchema = new mongoose.Schema(
  {
    id:          { type: String, required: true },
    furnitureId: { type: mongoose.Schema.Types.Mixed },
    name:        { type: String, required: true },
    category:    { type: String, default: "" },
    price:       { type: Number, default: 0 },
    image2DUrl:  { type: String, default: "" },
    model3DUrl:  { type: String, default: "" },
    colors:      { type: [String], default: [] },
    activeColor: { type: String, default: "" },
    width:       { type: Number, default: 1 },
    depth:       { type: Number, default: 1 },
    height:      { type: Number, default: 0.8 },
    baseWidth:   { type: Number, default: 1 },
    baseDepth:   { type: Number, default: 1 },
    baseHeight:  { type: Number, default: 0.8 },
    xM:          { type: Number, default: 0 },
    yM:          { type: Number, default: 0 },
    rotation:    { type: Number, default: 0 },
    scale:       { type: Number, default: 1 },
    shading:     { type: Boolean, default: true },
  },
  { _id: false }
);

const roomSnapshotSchema = new mongoose.Schema(
  {
    templateId:       { type: mongoose.Schema.Types.Mixed, default: null },
    name:             { type: String, default: "Room" },
    shape:            { type: String, default: "Rectangular" },
    dimensions: {
      width:  { type: Number, default: 4 },
      length: { type: Number, default: 4 },
      height: { type: Number, default: 2.8 },
    },
    floorColor:       { type: String, default: "#C8A882" },
    floorColors:      { type: [String], default: ["#C8A882"] },
    wallColor:        { type: String, default: "#F5F5F0" },
    wallColors:       { type: [String], default: ["#F5F5F0"] },
    activeFloorColor: { type: String, default: "#C8A882" },
    activeWallColor:  { type: String, default: "#F5F5F0" },
  },
  { _id: false }
);

const customerDesignSchema = new mongoose.Schema(
  {
    customerId:  { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    name:        { type: String, required: true, trim: true, default: "My Design" },
    room:        { type: roomSnapshotSchema, default: () => ({}) },
    placedItems: { type: [placedItemSchema],  default: [] },
    itemCount:   { type: Number, default: 0 },
    totalPrice:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Denormalise counts before every save
customerDesignSchema.pre("save", async function () {
  const items     = this.placedItems || [];
  this.itemCount  = items.length;
  this.totalPrice = items.reduce((s, i) => s + (Number(i.price) || 0), 0);
});

customerDesignSchema.index({ customerId: 1, updatedAt: -1 });

module.exports = mongoose.model("CustomerDesign", customerDesignSchema);