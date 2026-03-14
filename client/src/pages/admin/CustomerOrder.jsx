import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllOrders } from "../../services/orderApi";
import "../../styles/CustomerOrder.css";

export default function CustomerOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllOrders(token, { limit: 1000 });
        setOrders(response.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.designId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return `$ ${Number(amount).toFixed(2)}`;
  };

  // Export orders as CSV
  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "Order ID",
      "Customer Name",
      "Design Ref",
      "Date",
      "Subtotal",
      "Tax",
      "Shipping Cost",
      "Total",
      "Status",
      "Payment Status",
    ];

    // Convert orders to CSV rows
    const rows = filteredOrders.map((order) => [
      order.orderNumber || "N/A",
      order.shipping?.name || order.customerId?.name || "Guest",
      order.designId?.name || "N/A",
      formatDate(order.createdAt),
      order.subtotal || 0,
      order.tax || 0,
      order.shippingCost || 0,
      order.total || 0,
      order.status || "Pending",
      order.paymentStatus || "Pending",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell).replace(/"/g, '""');
          return cellStr.includes(",") ? `"${cellStr}"` : cellStr;
        }).join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `customer_orders_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="co-container">
      {/* Header */}
      <div className="co-header">
        <div>
          <h1>Customer Orders</h1>
          <p className="co-subtitle">
            Track and manage furniture purchases from finalized design consultations.
          </p>
        </div>
        <button className="co-export-btn" onClick={exportToCSV} disabled={loading || filteredOrders.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Tabs + Search in one row */}
      <div className="co-controls">
        <div className="co-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`co-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="co-tab-count">
                {tab === "All"
                  ? orders.length
                  : orders.filter((o) => o.status === tab).length}
              </span>
            </button>
          ))}
        </div>
        <div className="co-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="co-loading">
          <p>Loading orders...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="co-error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="co-table-wrap">
          <table className="co-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Design Ref</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="co-id">{order.orderNumber || "N/A"}</td>
                  <td className="co-customer">
                    {order.shipping?.name || order.customerId?.name || "Guest"}
                  </td>
                  <td className="co-design-ref">
                    {order.designId?.name || "N/A"}
                  </td>
                  <td className="co-muted">{formatDate(order.createdAt)}</td>
                  <td className="co-amount">{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`co-badge ${order.status?.toLowerCase() || "pending"}`}>
                      {order.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="co-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p>No orders found</p>
              <span>Try adjusting your search or filter.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
