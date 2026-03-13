const express = require("express");
const router  = express.Router();
const {
  listDesigns,
  getDesignById,
  createDesign,
  updateDesign,
  publishDesign,
  deleteDesign,
} = require("../controllers/designController");

router.get    ("/", listDesigns);
router.get    ("/:id", getDesignById);
router.post   ("/", createDesign);
router.put    ("/:id", updateDesign);
router.patch  ("/:id/publish", publishDesign);
router.delete ("/:id", deleteDesign);

module.exports = router;