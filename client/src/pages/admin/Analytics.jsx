import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getDashboardAnalytics, 
  getConsultationsOrdersChart, 
  getTopAssets,
  getAnalyticsReport 
} from '../../services/analyticsApi';
import { jsPDF } from 'jspdf';
import '../../styles/Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // State for analytics data
  const [metrics, setMetrics] = useState({
    totalRevenue: { value: 0, change: 0 },
    activeConsultations: { value: 0, change: 0 },
    designToOrderRate: { value: 0, change: 0 }
  });
  const [chartData, setChartData] = useState([]);
  const [mostPlacedAssets, setMostPlacedAssets] = useState([]);
  
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fetch analytics data when time filter changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFilter]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [timeFilter]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboardData, chartDataResult, topAssetsResult] = await Promise.all([
        getDashboardAnalytics(token, timeFilter),
        getConsultationsOrdersChart(token, timeFilter),
        getTopAssets(token, 5),
      ]);

      if (dashboardData.success) {
        setMetrics(dashboardData.data.metrics);
      }

      if (chartDataResult.success) {
        setChartData(chartDataResult.data);
      }

      if (topAssetsResult.success) {
        setMostPlacedAssets(topAssetsResult.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate SVG coordinates
  const maxValue = chartData.length > 0 
    ? Math.max(
        ...chartData.map(d => Math.max(d.consultations, d.orders)),
        10 // minimum value
      ) + 5 // add padding
    : 40;
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 20;
  
  const getCoordinates = (data, key) => {
    if (!data || data.length === 0) return [];
    
    return data.map((point, index) => {
      const x = data.length > 1 
        ? (index / (data.length - 1)) * chartWidth 
        : chartWidth / 2;
      const y = chartHeight - ((point[key] / maxValue) * chartHeight);
      return { x, y, value: point[key], week: point.week };
    });
  };

  const consultationsCoords = getCoordinates(chartData, 'consultations');
  const ordersCoords = getCoordinates(chartData, 'orders');

  const createPathD = (coords) => {
    if (!coords || coords.length === 0) return '';
    
    const pathCommands = coords.map((coord, index) => 
      `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`
    ).join(' ');
    return pathCommands;
  };

  const createAreaPathD = (coords) => {
    if (!coords || coords.length === 0) return '';
    
    const pathCommands = coords.map((coord, index) => 
      `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`
    ).join(' ');
    return `${pathCommands} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  };

  const maxAssetCount = mostPlacedAssets.length > 0 
    ? Math.max(...mostPlacedAssets.map(a => a.count))
    : 1;

  const handleDownloadReport = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const reportData = await getAnalyticsReport(token, timeFilter);
      
      if (reportData.success) {
        // Generate and download PDF report
        generatePDFReport(reportData.data);
      } else {
        alert('Failed to generate report. Please try again.');
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      alert(err.message || 'Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePDFReport = (data) => {
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with automatic page break
    const addText = (text, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(text, margin, yPosition);
      yPosition += fontSize * 0.5 + 2;
    };

    const addSpacer = (space = 5) => {
      yPosition += space;
    };

    // Header
    addText('FURNIPLAN ANALYTICS REPORT', 20, true, [31, 59, 77]);
    addSpacer(3);
    doc.setDrawColor(31, 59, 77);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpacer(8);

    // Report metadata
    addText(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, 10);
    addText(`Period: ${data.period.startDate.split('T')[0]} to ${data.period.endDate.split('T')[0]}`, 10);
    addText(`Time Filter: ${data.timeFilter}`, 10);
    addSpacer(10);

    // Metrics Summary Section
    addText('METRICS SUMMARY', 16, true, [31, 59, 77]);
    addSpacer(5);
    addText(`Total Revenue: LKR ${data.metrics.totalRevenue.toLocaleString()}`, 11, true);
    addText(`Active Consultations: ${data.metrics.activeConsultations}`, 11);
    addText(`Total Orders: ${data.metrics.totalOrders}`, 11);
    addText(`Design to Order Rate: ${data.metrics.designToOrderRate}%`, 11);
    addSpacer(10);

    // Consultations vs Orders Section
    addText('CONSULTATIONS VS ORDERS (Weekly)', 16, true, [31, 59, 77]);
    addSpacer(5);
    data.chartData.forEach(week => {
      addText(`${week.week}: ${week.consultations} consultations, ${week.orders} orders`, 10);
    });
    addSpacer(10);

    // Top Placed Furniture Assets Section
    addText('TOP PLACED FURNITURE ASSETS', 16, true, [31, 59, 77]);
    addSpacer(5);
    data.topAssets.forEach((asset, index) => {
      addText(`${index + 1}. ${asset.name || 'Unknown'} - ${asset.count} placements`, 10);
    });
    addSpacer(10);

    // Recent Orders Section
    addText(`RECENT ORDERS (Last ${data.recentOrders.length})`, 16, true, [31, 59, 77]);
    addSpacer(5);
    data.recentOrders.forEach(order => {
      addText(
        `Order #${order.orderNumber} - LKR ${order.total.toLocaleString()} - ${order.status} - ${new Date(order.createdAt).toLocaleDateString()}`,
        9
      );
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        'FurniPlan - Interior Design Platform',
        margin,
        pageHeight - 10
      );
    }

    // Save the PDF
    const fileName = `FurniPlan_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Loading state
  if (loading && chartData.length === 0) {
    return (
      <div className="analytics-container">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="analytics-container">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
          <p>Error: {error}</p>
          <button onClick={fetchAnalyticsData} style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        <button 
          className="download-report-btn" 
          onClick={handleDownloadReport}
          disabled={isDownloading}
        >
          {isDownloading ? 'Generating Report...' : 'Download Report'}
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Revenue</span>
            {metrics.totalRevenue.change !== 0 && (
              <span className={`metric-change ${metrics.totalRevenue.change > 0 ? 'positive' : 'negative'}`}>
                {metrics.totalRevenue.change > 0 ? '+' : ''}{metrics.totalRevenue.change}%
              </span>
            )}
          </div>
          <div className="metric-value">LKR {metrics.totalRevenue.value.toLocaleString()}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Consultations</span>
            {metrics.activeConsultations.change !== 0 && (
              <span 
                className="metric-change" 
                style={{ background: '#F4F5F7', color: '#666666' }}
              >
                {metrics.activeConsultations.change > 0 ? '+' : ''}{metrics.activeConsultations.change}
              </span>
            )}
          </div>
          <div className="metric-value">{metrics.activeConsultations.value}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Design to Order Rate</span>
            {metrics.designToOrderRate.change !== 0 && (
              <span className={`metric-change ${metrics.designToOrderRate.change > 0 ? 'positive' : 'negative'}`}>
                {metrics.designToOrderRate.change > 0 ? '+' : ''}{metrics.designToOrderRate.change}%
              </span>
            )}
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

          <button 
            className="manage-inventory-btn"
            onClick={() => navigate('/admin/furniture-management')}
          >
            Manage Inventory →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
