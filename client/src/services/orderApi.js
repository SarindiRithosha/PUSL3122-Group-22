import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/public/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error.response?.data || { success: false, message: "Failed to create order" };
  }
};

export const getCustomerOrders = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/customer/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch orders" };
  }
};

export const getAllOrders = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error.response?.data || { success: false, message: "Failed to fetch orders" };
  }
};

export const updateOrderStatus = async (token, orderId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/orders/${orderId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error.response?.data || { success: false, message: "Failed to update order" };
  }
};
