import React, { useState } from "react";
import "../../styles/CustomerOrder.css";

const ordersData = [
  {
    id: "#ORD-042",
    customer: "Sarah Jenkins",
    design: "Scandinavian Living",
    date: "Feb 22, 2026",
    amount: "$ 3,450.00",
    status: "Processing",
  },
  {
    id: "#ORD-039",
    customer: "TechCorp LLC",
    design: "Modern Office",
    date: "Feb 16, 2026",
    amount: "$ 8,200.00",
    status: "Delivered",
  },
  {
    id: "#ORD-035",
    customer: "David Miller",
    design: "Cozy Master Bed",
    date: "Feb 10, 2026",
    amount: "$ 2,150.00",
    status: "Pending",
  },
];

export default function CustomerOrders() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Processing", "Delivered", "Pending"];

  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

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
        <button className="co-export-btn">
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
                  ? ordersData.length
                  : ordersData.filter((o) => o.status === tab).length}
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

      {/* Table */}
      <div className="co-table-wrap">
        <table className="co-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Design Ref</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={index}>
                <td className="co-id">{order.id}</td>
                <td className="co-customer">{order.customer}</td>
                <td><span className="co-link">{order.design}</span></td>
                <td className="co-muted">{order.date}</td>
                <td className="co-amount">{order.amount}</td>
                <td>
                  <span className={`co-badge ${order.status.toLowerCase()}`}>
                    {order.status}
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
    </div>
  );
}
