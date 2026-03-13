const mongoose = require("mongoose");

const placedItemSchema = new mongoose.Schema(
  {
    id:          { type: String, required: true },
    furnitureId: { type: mongoose.Schema.Types.Mixed },  // store as-is (ObjectId string from frontend)
    name:        { type: String, required: true },
    category:    { type: String },
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
    // metre-based positions used by the new canvas (replaces legacy x/y in px)
    xM:          { type: Number, default: 0 },
    yM:          { type: Number, default: 0 },
    // legacy – kept for backwards compat
    x:           { type: Number, default: 0 },
    y:           { type: Number, default: 0 },
    rotation:    { type: Number, default: 0 },
    scale:       { type: Number, default: 1 },
    shading:     { type: Boolean, default: true },
  },
  { _id: false }
);

const roomSnapshotSchema = new mongoose.Schema(
  {
    isTemplate:      { type: Boolean, default: false },
    templateId:      { type: mongoose.Schema.Types.Mixed, ref: "RoomTemplate", default: null },  // Mixed avoids null→ObjectId cast error
    name:            { type: String, default: "Room" },
    shape:           { type: String, default: "Rectangular" },  // no enum - custom rooms may have other shape names
    dimensions: {
      width:  { type: Number, default: 4 },
      length: { type: Number, default: 4 },
      height: { type: Number, default: 2.8 },
    },
    floorMaterial:   { type: String, default: "" },
    floorColor:      { type: String, default: "#C8A882" },
    floorColors:     { type: [String], default: ["#C8A882"] },
    wallColor:       { type: String, default: "#F5F5F0" },
    wallColors:      { type: [String], default: ["#F5F5F0"] },
    activeFloorColor:{ type: String, default: "#C8A882" },
    activeWallColor: { type: String, default: "#F5F5F0" },
  },
  { _id: false }
);

const designSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, default: "Untitled Design" },
    clientName:  { type: String, trim: true, default: "" },
    status: {
      type:    String,
      enum:    ["Draft", "Published"],
      default: "Draft",
    },
    isFinalized:  { type: Boolean, default: false },
    designStyle: {
      type: String,
      enum: ['Scandinavian','Minimalist','Traditional','Modern','Industrial',
             'Bohemian','Contemporary','Coastal','Rustic','Art Deco','Other',''],
      default: '',
    },
    roomType: {
      type: String,
      enum: ['Living Room','Bedroom','Kitchen','Dining Room','Office','Bathroom',
             'Kids Room','Hallway','Balcony','Studio','Other',''],
      default: '',
    },
    room:        { type: roomSnapshotSchema, default: () => ({}) },
    placedItems: { type: [placedItemSchema], default: [] },
    itemCount:   { type: Number, default: 0 },       // denormalised count stored on save
    totalPrice:  { type: Number, default: 0 },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Auto-calculate totalPrice and itemCount before every save (async style — Mongoose 7+)
designSchema.pre("save", async function () {
  const items = this.placedItems || [];
  this.itemCount  = items.length;
  this.totalPrice = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
});

designSchema.index({ name: "text", clientName: "text", designStyle: "text", roomType: "text" });
designSchema.index({ status: 1, createdAt: -1 });
designSchema.index({ isFinalized: 1 });
designSchema.index({ designStyle: 1 });
designSchema.index({ roomType: 1 });

module.exports = mongoose.model("Design", designSchema);