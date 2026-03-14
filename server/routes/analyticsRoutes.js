const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard metrics with time filter
 * @access  Admin only
 * @query   timeFilter: "Last 7 Days" | "Last 30 Days" | "Last 90 Days" | "Last Year"
 */
router.get("/dashboard", analyticsController.getDashboardAnalytics);

/**
 * @route   GET /api/analytics/consultations-orders
 * @desc    Get consultations vs orders chart data
 * @access  Admin only
 * @query   timeFilter: "Last 7 Days" | "Last 30 Days" | "Last 90 Days" | "Last Year"
 */
router.get("/consultations-orders", analyticsController.getConsultationsOrdersChart);

/**
 * @route   GET /api/analytics/top-assets
 * @desc    Get most placed furniture assets
 * @access  Admin only
 * @query   limit: number (default: 5)
 */
router.get("/top-assets", analyticsController.getTopAssets);

/**
 * @route   GET /api/analytics/report
 * @desc    Get comprehensive analytics report data for PDF export
 * @access  Admin only
 * @query   timeFilter: "Last 7 Days" | "Last 30 Days" | "Last 90 Days" | "Last Year"
 */
router.get("/report", analyticsController.getAnalyticsReport);

module.exports = router;
