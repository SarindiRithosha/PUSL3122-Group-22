const express = require("express");
const {
  listFurniture,
  getFurnitureById,
  createFurniture,
  updateFurniture,
  updateFurnitureScale,
  deleteFurniture,
} = require("../controllers/furnitureController");

const router = express.Router();

router.get("/", listFurniture);
router.get("/:id", getFurnitureById);
router.post("/", createFurniture);
router.put("/:id", updateFurniture);
router.patch("/:id/scale", updateFurnitureScale);
router.delete("/:id", deleteFurniture);

module.exports = router;
