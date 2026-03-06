import React, { useState } from 'react';
import '../../styles/Analytics.css';

const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');

  // Mock data for analytics
  const metrics = {
    totalRevenue: { value: 12450, change: 14 },
    activeConsultations: { value: 45, change: 2 },
    designToOrderRate: { value: 68, change: 5 }
  };

  const chartData = [
    { week: 'Week 1', consultations: 13, orders: 10 },
    { week: 'Week 2', consultations: 25, orders: 15 },
    { week: 'Week 3', consultations: 15, orders: 14 },
    { week: 'Week 4', consultations: 38, orders: 27 }
  ];

  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Calculate SVG coordinates
  const maxValue = 40;
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 20;
  
  const getCoordinates = (data, key) => {
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - ((point[key] / maxValue) * chartHeight);
      return { x, y, value: point[key], week: point.week };
    });
  };

  const consultationsCoords = getCoordinates(chartData, 'consultations');
  const ordersCoords = getCoordinates(chartData, 'orders');

  const createPathD = (coords) => {
    const pathCommands = coords.map((coord, index) => 
      `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`
    ).join(' ');
    return pathCommands;
  };

  const createAreaPathD = (coords) => {
    const pathCommands = coords.map((coord, index) => 
      `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`
    ).join(' ');
    return `${pathCommands} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  };

  const mostPlacedAssets = [
    { name: 'Nordic Armchair', count: 142 },
    { name: 'Modular L-Sofa', count: 98 },
    { name: 'Oak Dining Table', count: 76 },
    { name: 'Glass Coffee Table', count: 65 },
    { name: 'Modern Bookshelf', count: 42 }
  ];

  const maxAssetCount = Math.max(...mostPlacedAssets.map(a => a.count));

  const handleDownloadReport = () => {
    // Placeholder for download functionality
    alert('Downloading report...');
  };

  return (
    <div className="analytics-container">
      {/* Header Section */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics & Insights</h1>
          <p className="header-subtitle">Visualize consultation metrics, furniture popularity, and sales data.</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="analytics-controls">
        <div className="filter-dropdown">
          <svg className="calendar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="time-filter"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
          </select>
        </div>
        <button className="download-report-btn" onClick={handleDownloadReport}>
          Download Report
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-change positive">+{metrics.totalRevenue.change}%</span>
          </div>
          <div className="metric-value">${metrics.totalRevenue.value.toLocaleString()}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Consultations</span>
            <span className="metric-change positive" style ={{ background: '#F4F5F7', color: '#666666' }}>+{metrics.activeConsultations.change}</span>
          </div>
          <div className="metric-value">{metrics.activeConsultations.value}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Design to Order Rate</span>
            <span className="metric-change positive">+{metrics.designToOrderRate.change}%</span>
          </div>
          <div className="metric-value">{metrics.designToOrderRate.value}%</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="analytics-main-grid">
        {/* Consultations vs Orders Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Consultations vs Orders</h2>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot consultations"></span>
                <span>Consultations</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot orders"></span>
                <span>Orders</span>
              </div>
            </div>
          </div>
          
          <div className="line-chart">
            <div className="chart-y-axis">
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>
            
            <div className="chart-content">
              <svg className="chart-svg" viewBox="0 0 800 300" preserveAspectRatio="none">
                {/* Gradient fills */}
                <defs>
                  <linearGradient id="consultationsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#FF8C42" stopOpacity="0.05"/>
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>

                {/* Consultations area */}
                <path
                  d={createAreaPathD(consultationsCoords)}
                  fill="url(#consultationsGradient)"
                />
                
                {/* Orders area */}
                <path
                  d={createAreaPathD(ordersCoords)}
                  fill="url(#ordersGradient)"
                />

                {/* Consultations line */}
                <path
                  d={createPathD(consultationsCoords)}
                  fill="none"
                  stroke="#FF8C42"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Orders line */}
                <path
                  d={createPathD(ordersCoords)}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Consultations point markers */}
                {consultationsCoords.map((coord, index) => (
                  <circle 
                    key={`consultation-${index}`}
                    cx={coord.x} 
                    cy={coord.y} 
                    r={hoveredPoint?.type === 'consultation' && hoveredPoint?.index === index ? "8" : "6"} 
                    fill="#FF8C42"
                    style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                    onMouseEnter={() => setHoveredPoint({ type: 'consultation', ...coord, index })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* Orders point markers */}
                {ordersCoords.map((coord, index) => (
                  <circle 
                    key={`order-${index}`}
                    cx={coord.x} 
                    cy={coord.y} 
                    r={hoveredPoint?.type === 'order' && hoveredPoint?.index === index ? "8" : "6"} 
                    fill="#4CAF50"
                    style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                    onMouseEnter={() => setHoveredPoint({ type: 'order', ...coord, index })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              {/* Hover tooltip */}
              {hoveredPoint && (
                <div 
                  className="chart-tooltip" 
                  style={{ 
                    left: `${(hoveredPoint.x / chartWidth) * 100}%`, 
                    top: `${(hoveredPoint.y / chartHeight) * 100 - 10}%` 
                  }}
                >
                  <div className="tooltip-content">
                    <span className="tooltip-label">
                      {hoveredPoint.value} {hoveredPoint.type === 'consultation' ? 'Designs' : 'Orders'}
                    </span>
                  </div>
                </div>
              )}

              {/* X-axis labels */}
              <div className="chart-x-axis">
                {chartData.map((data, index) => (
                  <span key={index}>{data.week}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Most Placed Assets */}
        <div className="assets-card">
          <h2 className="assets-title">Most Placed Assets</h2>
          <p className="assets-subtitle">By frequency in 2D layouts</p>
          
          <div className="assets-list">
            {mostPlacedAssets.map((asset, index) => (
              <div key={index} className="asset-item">
                <div className="asset-info">
                  <span className="asset-name">{asset.name}</span>
                  <span className="asset-count">{asset.count}</span>
                </div>
                <div className="asset-bar-container">
                  <div 
                    className="asset-bar" 
                    style={{ width: `${(asset.count / maxAssetCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <button className="manage-inventory-btn">
            Manage Inventory →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
