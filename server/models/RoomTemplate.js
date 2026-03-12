const mongoose = require("mongoose");

const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const dimensionsSchema = new mongoose.Schema(
  {
    width: { type: Number, required: true, min: 0.1, default: 1 },
    length: { type: Number, required: true, min: 0.1, default: 1 },
    height: { type: Number, required: true, min: 0.1, default: 2.5 },
  },
  { _id: false }
);

const roomTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shape: {
      type: String,
      required: true,
      enum: ["Rectangular", "Square", "L-Shape"],
    },
    dimensions: {
      type: dimensionsSchema,
      default: () => ({ width: 1, length: 1, height: 2.5 }),
    },
    floorMaterial: {
      type: String,
      enum: ["Wood", "Tile", "Carpet", "Concrete", "Laminate", "Marble", "Vinyl", "Other", ""],
      default: "",
    },
    floorColors: {
      type: [String],
      default: ["#FFFFFF"],
      validate: {
        validator(colors) {
          return colors.length > 0 && colors.every((color) => hexColorRegex.test(color));
        },
        message: "floorColors must contain valid hex colors.",
      },
    },
    wallColors: {
      type: [String],
      default: ["#FFFFFF"],
      validate: {
        validator(colors) {
          return colors.length > 0 && colors.every((color) => hexColorRegex.test(color));
        },
        message: "wallColors must contain valid hex colors.",
      },
    },
    snapping: { type: Boolean, default: true },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
    previewMode: { type: String, enum: ["2D", "3D"], default: "2D" },
  },
  { timestamps: true }
);

roomTemplateSchema.index({ name: "text", shape: "text", floorMaterial: "text" });
roomTemplateSchema.index({ shape: 1, status: 1 });

module.exports = mongoose.model("RoomTemplate", roomTemplateSchema);
