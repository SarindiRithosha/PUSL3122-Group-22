import React from 'react';
import '../../styles/Dashboard.css';

// Mock data for the dashboard
const stats = {
  furnitureTotal: 19,
  roomTemplates: 12,
  savedDesigns: 9,
};

const recentDesigns = [
  { id: 1, title: 'Scandinavian Living Room', category: 'Living Room', style: 'scandinavian', date: 'Feb 21', color: '#DE8B47' },
  { id: 2, title: 'Modern Office Setup', category: 'Home Office', style: 'minimal', date: 'Feb 20', color: '#43A047' },
  { id: 3, title: 'Cozy Bedroom Layout', category: 'Bedroom', style: 'traditional', date: 'Feb 18', color: '#7E57C2' },
  { id: 4, title: 'Dining Area Concept', category: 'Dining Room', style: 'industrial', date: 'Feb 15', color: '#EF5350' },
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Welcome, Bindya!</h1>
          <p className="dashboard-subtitle">Manage your furniture, room templates, and active design consultations.</p>
        </div>
        <button className="new-project-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-title">Total Furniture</div>
            <div className="stat-value">{stats.furnitureTotal}</div>
            <div className="stat-trend positive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              +3 this month
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#FFF0E6' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DE8B47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
              <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
              <path d="M4 18v2" />
              <path d="M20 18v2" />
            </svg>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-title">Room Templates</div>
            <div className="stat-value">{stats.roomTemplates}</div>
            <div className="stat-trend positive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              +2 this month
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-title">Saved Designs</div>
            <div className="stat-value">{stats.savedDesigns}</div>
            <div className="stat-trend neutral">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              No change
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#EDE7F6' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7E57C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Recent Designs */}
        <div className="dashboard-section recent-designs">
          <div className="section-header">
            <h2>Recent Designs</h2>
            <a href="#" className="view-all-link">
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="design-list">
            {recentDesigns.map((d) => (
              <div key={d.id} className="design-item">
                <div className="design-item-left">
                  <div className="design-thumbnail" style={{ backgroundColor: d.color + '18' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={d.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19l7-7 3 3-7 7-3-3z" />
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                      <path d="M2 2l7.586 7.586" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                  </div>
                  <div className="design-item-text">
                    <span className="design-title">{d.title}</span>
                    <span className="design-details">{d.category} • {d.style}</span>
                  </div>
                </div>
                <span className="design-date">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section recent-orders">
          <div className="section-header">
            <h2>Recent Orders</h2>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div className="empty-state-title">No Orders yet</div>
            <p className="empty-state-desc">When clients finalize designs, orders will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
