const Order = require("../models/Order");
const CustomerDesign = require("../models/CustomerDesign");
const Furniture = require("../models/Furniture");

/* Calculate date range based on filter */
const getDateRange = (filter) => {
  const now = new Date();
  let startDate = new Date();

  switch (filter) {
    case "Last 7 Days":
      startDate.setDate(now.getDate() - 7);
      break;
    case "Last 30 Days":
      startDate.setDate(now.getDate() - 30);
      break;
    case "Last 90 Days":
      startDate.setDate(now.getDate() - 90);
      break;
    case "Last Year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return { startDate, endDate: now };
};

/**Calculate previous period date range for comparison*/
const getPreviousPeriodRange = (startDate, endDate) => {
  const duration = endDate - startDate;
  const prevEndDate = new Date(startDate);
  const prevStartDate = new Date(startDate - duration);
  return { startDate: prevStartDate, endDate: prevEndDate };
};

/**
 * Get analytics dashboard data
 * @route GET /api/analytics/dashboard
 */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { timeFilter = "Last 30 Days" } = req.query;
    const { startDate, endDate } = getDateRange(timeFilter);
    const prevPeriod = getPreviousPeriodRange(startDate, endDate);

    const revenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: { $in: ["Paid", "Pending"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    const prevRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevPeriod.startDate, $lte: prevPeriod.endDate },
          paymentStatus: { $in: ["Paid", "Pending"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const prevRevenue = prevRevenueResult[0]?.total || 0;
    const revenueChange = prevRevenue > 0 
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;

    const activeConsultations = await CustomerDesign.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const prevConsultations = await CustomerDesign.countDocuments({
      createdAt: { $gte: prevPeriod.startDate, $lte: prevPeriod.endDate },
    });

    const consultationsChange = activeConsultations - prevConsultations;

    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const prevOrders = await Order.countDocuments({
      createdAt: { $gte: prevPeriod.startDate, $lte: prevPeriod.endDate },
    });

    const designToOrderRate = activeConsultations > 0 
      ? Math.round((totalOrders / activeConsultations) * 100)
      : 0;

    const prevDesignToOrderRate = prevConsultations > 0
      ? Math.round((prevOrders / prevConsultations) * 100)
      : 0;

    const designToOrderChange = designToOrderRate - prevDesignToOrderRate;

    res.json({
      success: true,
      data: {
        metrics: {
          totalRevenue: {
            value: totalRevenue,
            change: revenueChange,
          },
          activeConsultations: {
            value: activeConsultations,
            change: consultationsChange,
          },
          designToOrderRate: {
            value: designToOrderRate,
            change: designToOrderChange,
          },
        },
        timeFilter,
      },
    });
  } catch (err) {
    console.error("Error fetching dashboard analytics:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
      error: err.message,
    });
  }
};

/**
 * Get consultations vs orders chart data
 * @route GET /api/analytics/consultations-orders
 */
exports.getConsultationsOrdersChart = async (req, res) => {
  try {
    const { timeFilter = "Last 30 Days" } = req.query;
    const { startDate, endDate } = getDateRange(timeFilter);

    // Calculate week intervals
    const duration = endDate - startDate;
    const weekDuration = duration / 4; // Divide into 4 weeks
    
    const chartData = [];

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(startDate.getTime() + weekDuration * i);
      const weekEnd = new Date(startDate.getTime() + weekDuration * (i + 1));

      const consultations = await CustomerDesign.countDocuments({
        createdAt: { $gte: weekStart, $lt: weekEnd },
      });

      const orders = await Order.countDocuments({
        createdAt: { $gte: weekStart, $lt: weekEnd },
      });

      chartData.push({
        week: `Week ${i + 1}`,
        consultations,
        orders,
      });
    }

    res.json({
      success: true,
      data: chartData,
    });
  } catch (err) {
    console.error("Error fetching chart data:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chart data",
      error: err.message,
    });
  }
};

/**
 * Get most placed furniture assets
 * @route GET /api/analytics/top-assets
 */
exports.getTopAssets = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Aggregate furniture placement from customer designs
    const topAssets = await CustomerDesign.aggregate([
      { $unwind: "$placedItems" },
      {
        $group: {
          _id: "$placedItems.furnitureId",
          name: { $first: "$placedItems.name" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          name: 1,
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: topAssets,
    });
  } catch (err) {
    console.error("Error fetching top assets:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top assets",
      error: err.message,
    });
  }
};

/**
 * Get comprehensive report data for PDF export
 * @route GET /api/analytics/report
 */
exports.getAnalyticsReport = async (req, res) => {
  try {
    const { timeFilter = "Last 30 Days" } = req.query;
    const { startDate, endDate } = getDateRange(timeFilter);

    // Fetch all analytics data
    const [dashboardMetrics, chartData, topAssets, recentOrders] = await Promise.all([
      // Get metrics
      (async () => {
        const metrics = {};
        
        // Revenue
        const revenueResult = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
              paymentStatus: { $in: ["Paid", "Pending"] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total" },
            },
          },
        ]);
        metrics.totalRevenue = revenueResult[0]?.total || 0;

        // Consultations
        metrics.activeConsultations = await CustomerDesign.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        });

        // Orders
        metrics.totalOrders = await Order.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        });

        // Design to Order Rate
        metrics.designToOrderRate = metrics.activeConsultations > 0
          ? Math.round((metrics.totalOrders / metrics.activeConsultations) * 100)
          : 0;

        return metrics;
      })(),

      // Chart data
      (async () => {
        const duration = endDate - startDate;
        const weekDuration = duration / 4;
        const data = [];

        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(startDate.getTime() + weekDuration * i);
          const weekEnd = new Date(startDate.getTime() + weekDuration * (i + 1));

          const consultations = await CustomerDesign.countDocuments({
            createdAt: { $gte: weekStart, $lt: weekEnd },
          });

          const orders = await Order.countDocuments({
            createdAt: { $gte: weekStart, $lt: weekEnd },
          });

          data.push({
            week: `Week ${i + 1}`,
            consultations,
            orders,
          });
        }

        return data;
      })(),

      // Top assets
      CustomerDesign.aggregate([
        { $unwind: "$placedItems" },
        {
          $group: {
            _id: "$placedItems.furnitureId",
            name: { $first: "$placedItems.name" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Recent orders
      Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        timeFilter,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        metrics: dashboardMetrics,
        chartData,
        topAssets,
        recentOrders,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error generating analytics report:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate analytics report",
      error: err.message,
    });
  }
};
