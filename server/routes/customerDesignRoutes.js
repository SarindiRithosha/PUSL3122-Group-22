// server/routes/customerDesignRoutes.js
const express = require("express");
const router  = express.Router();
const {
  listMyDesigns,
  getMyDesignById,
  createMyDesign,
  updateMyDesign,
  deleteMyDesign,
} = require("../controllers/customerDesignController");

router.get    ("/",    listMyDesigns);
router.get    ("/:id", getMyDesignById);
router.post   ("/",    createMyDesign);
router.put    ("/:id", updateMyDesign);
router.delete ("/:id", deleteMyDesign);

module.exports = router;