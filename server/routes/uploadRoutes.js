const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

const uploadsRoot = path.join(__dirname, "..", "uploads");
const imageDir = path.join(uploadsRoot, "images");
const modelDir = path.join(uploadsRoot, "models");

[uploadsRoot, imageDir, modelDir].forEach((directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
});

const imageExtPattern = /\.(png|jpe?g|webp)$/i;
const modelExtPattern = /\.(glb|gltf|obj|fbx)$/i;

const createUploader = (type) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, type === "image" ? imageDir : modelDir);
      },
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const safeName = file.originalname
          .replace(extension, "")
          .replace(/[^a-zA-Z0-9_-]/g, "-")
          .slice(0, 40);
        cb(null, `${Date.now()}-${safeName}${extension.toLowerCase()}`);
      },
    }),
    limits: {
      fileSize: 70 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      const isValid =
        type === "image"
          ? imageExtPattern.test(file.originalname)
          : modelExtPattern.test(file.originalname);

      if (!isValid) {
        return cb(
          new Error(
            type === "image"
              ? "Invalid image format. Use png, jpg, jpeg, or webp."
              : "Invalid model format. Use glb, gltf, obj, or fbx."
          )
        );
      }

      cb(null, true);
    },
  });

const handleUploadSuccess = (type) => (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });
  }

  const relativePath = type === "image"
    ? `/uploads/images/${req.file.filename}`
    : `/uploads/models/${req.file.filename}`;

  return res.status(201).json({
    success: true,
    data: {
      url: relativePath,
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });
};

router.post("/image", createUploader("image").single("file"), handleUploadSuccess("image"));
router.post("/model", createUploader("model").single("file"), handleUploadSuccess("model"));

module.exports = router;
