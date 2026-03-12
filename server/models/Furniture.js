const mongoose = require("mongoose");

const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const dimensionsSchema = new mongoose.Schema(
  {
    width: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    depth: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    height: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
  },
  { _id: false }
);

const model3DScaleSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true, min: 0.01, default: 1 },
    y: { type: Number, required: true, min: 0.01, default: 1 },
    z: { type: Number, required: true, min: 0.01, default: 1 },
  },
  { _id: false }
);

const model3DSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, default: "" },
    format: {
      type: String,
      enum: ["glb", "gltf", "obj", "fbx", ""],
      default: "",
    },
    scale: { type: model3DScaleSchema, default: () => ({}) },
  },
  { _id: false }
);

const furnitureSchema = new mongoose.Schema(
  {
    modelId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: "" },
    colors: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return value.every((color) => hexColorRegex.test(color));
        },
        message: "All colors must be valid hex codes.",
      },
    },
    dimensions: {
      type: dimensionsSchema,
      default: () => ({ width: 1, depth: 1, height: 1 }),
    },
    shading: { type: Boolean, default: true },
    previewMode: { type: String, enum: ["2D", "3D"], default: "3D" },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
    image2DUrl: { type: String, default: "" },
    model3D: { type: model3DSchema, default: () => ({}) },
  },
  { timestamps: true }
);

furnitureSchema.index({ name: "text", category: "text", description: "text" });
furnitureSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Furniture", furnitureSchema);
