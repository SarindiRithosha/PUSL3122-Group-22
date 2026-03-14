const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/dashboard", analyticsController.getDashboardAnalytics);
router.get("/consultations-orders", analyticsController.getConsultationsOrdersChart);
router.get("/top-assets", analyticsController.getTopAssets);
router.get("/report", analyticsController.getAnalyticsReport);

module.exports = router;
