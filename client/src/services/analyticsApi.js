import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Get analytics dashboard metrics
 */
export const getDashboardAnalytics = async (token, timeFilter = "Last 30 Days") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        timeFilter,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch dashboard analytics" };
  }
};

/**
 * Get consultations vs orders chart data
 */
export const getConsultationsOrdersChart = async (token, timeFilter = "Last 30 Days") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/consultations-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        timeFilter,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch chart data" };
  }
};

/**
 * Get most placed furniture assets
 */
export const getTopAssets = async (token, limit = 5) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/top-assets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching top assets:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch top assets" };
  }
};

/**
 * Get comprehensive analytics report
 */
export const getAnalyticsReport = async (token, timeFilter = "Last 30 Days") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        timeFilter,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching analytics report:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch analytics report" };
  }
};
