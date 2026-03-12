const express = require("express");
const {
  listRoomTemplates,
  getRoomTemplateById,
  createRoomTemplate,
  updateRoomTemplate,
  deleteRoomTemplate,
} = require("../controllers/roomTemplateController");

const router = express.Router();

router.get("/", listRoomTemplates);
router.get("/:id", getRoomTemplateById);
router.post("/", createRoomTemplate);
router.put("/:id", updateRoomTemplate);
router.delete("/:id", deleteRoomTemplate);

module.exports = router;
