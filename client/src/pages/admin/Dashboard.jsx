import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';
import { useAuth } from '../../contexts/AuthContext';
import { listFurniture }      from '../../services/furnitureApi';
import { listRoomTemplates }  from '../../services/roomApi';
import { listDesigns }        from '../../services/designApi';
import { getAllOrders }       from '../../services/orderApi';

const PALETTE = ['#DE8B47', '#43A047', '#7E57C2', '#EF5350', '#1E88E5'];
const bgOf = (hex) => hex + '18';

const DesignIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>
);

// ── Status badge for orders 
const STATUS_COLORS = {
  Pending:    { bg:'#FFF3E0', text:'#E65100' },
  Processing: { bg:'#E3F2FD', text:'#1565C0' },
  Shipped:    { bg:'#E8F5E9', text:'#2E7D32' },
  Delivered:  { bg:'#E8F5E9', text:'#1B5E20' },
  Cancelled:  { bg:'#FFEBEE', text:'#B71C1C' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg:'#F5F5F5', text:'#555' };
  return (
    <span style={{
      background: s.bg, color: s.text,
      padding: '2px 8px', borderRadius: '10px',
      fontSize: '0.75rem', fontWeight: 600,
    }}>
      {status || 'Pending'}
    </span>
  );
};

// ── Main component 
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const adminName = user?.name || user?.email || 'Admin';

  // ── State 
  const [stats, setStats] = useState({
    furnitureTotal: '—',
    roomTemplates:  '—',
    savedDesigns:   '—',
  });
  const [recentDesigns, setRecentDesigns] = useState([]);
  const [recentOrders,  setRecentOrders]  = useState([]);
  const [loading,       setLoading]       = useState(true);

  // ── Fetch data 
  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      try {
        const [furRes, roomRes, desRes, ordRes] = await Promise.allSettled([
          listFurniture({ limit: 1000 }),
          listRoomTemplates({ limit: 1000 }),
          listDesigns({ limit: 4, sortBy: 'createdAt', order: 'desc' }),
          getAllOrders(token, { limit: 5 }),
        ]);

        // Counts
        setStats({
          furnitureTotal: furRes.status  === 'fulfilled' ? (furRes.value.data  || []).length : '—',
          roomTemplates:  roomRes.status === 'fulfilled' ? (roomRes.value.data || []).length : '—',
          savedDesigns:   desRes.status  === 'fulfilled' ? (desRes.value.pagination?.total ?? (desRes.value.data||[]).length) : '—',
        });

        // Recent designs — max 4
        if (desRes.status === 'fulfilled') {
          setRecentDesigns((desRes.value.data || []).slice(0, 4));
        }

        // Recent orders — max 5
        if (ordRes.status === 'fulfilled') {
          setRecentOrders((ordRes.value.data || []).slice(0, 5));
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  //  Render 
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Welcome, {adminName}!</h1>
          <p className="dashboard-subtitle">
            Manage your furniture, room templates, and active design consultations.
          </p>
        </div>
        <button
          className="new-project-btn"
          onClick={() => navigate('/admin/design-workspace')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-title">Total Furniture</div>
            <div className="stat-value">{loading ? '…' : stats.furnitureTotal}</div>
            <div className="stat-trend positive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              </svg>
              All items in catalog
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor:'#FFF0E6' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DE8B47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/>
              <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"/>
              <path d="M4 18v2"/><path d="M20 18v2"/>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-title">Room Templates</div>
            <div className="stat-value">{loading ? '…' : stats.roomTemplates}</div>
            <div className="stat-trend positive">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              </svg>
              All templates
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor:'#E8F5E9' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#43A047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3"  y="3"  width="7" height="9" rx="1"/>
              <rect x="14" y="3"  width="7" height="5" rx="1"/>
              <rect x="14" y="12" width="7" height="9" rx="1"/>
              <rect x="3"  y="16" width="7" height="5" rx="1"/>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-title">Saved Designs</div>
            <div className="stat-value">{loading ? '…' : stats.savedDesigns}</div>
            <div className="stat-trend neutral">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Total designs
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor:'#EDE7F6' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7E57C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">

        {/* ── Recent Designs ── */}
        <div className="dashboard-section recent-designs">
          <div className="section-header">
            <h2>Recent Designs</h2>
            <button
              className="view-all-link"
              onClick={() => navigate('/admin/design-library')}
              style={{ background:'none', border:'none', cursor:'pointer' }}
            >
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {loading ? (
            <div style={{ padding:'2rem', textAlign:'center', color:'#bbb' }}>Loading…</div>
          ) : recentDesigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                </svg>
              </div>
              <div className="empty-state-title">No designs yet</div>
              <p className="empty-state-desc">Create your first design using the New Project button.</p>
            </div>
          ) : (
            <div className="design-list">
              {recentDesigns.map((d, i) => {
                const color = PALETTE[i % PALETTE.length];
                const date  = new Date(d.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short' });
                return (
                  <div
                    key={d._id}
                    className="design-item"
                    onClick={() => navigate(`/admin/design-workspace/${d._id}`)}
                  >
                    <div className="design-item-left">
                      <div className="design-thumbnail" style={{ backgroundColor: bgOf(color) }}>
                        <DesignIcon color={color}/>
                      </div>
                      <div className="design-item-text">
                        <span className="design-title">{d.name || 'Untitled Design'}</span>
                        <span className="design-details">
                          {[d.roomType, d.designStyle].filter(Boolean).join(' · ') || 'No category'}
                        </span>
                      </div>
                    </div>
                    <span className="design-date">{date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent Orders ── */}
        <div className="dashboard-section recent-orders">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <button
              className="view-all-link"
              onClick={() => navigate('/admin/customer-orders')}
              style={{ background:'none', border:'none', cursor:'pointer' }}
            >
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {loading ? (
            <div style={{ padding:'2rem', textAlign:'center', color:'#bbb' }}>Loading…</div>
          ) : recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <div className="empty-state-title">No orders yet</div>
              <p className="empty-state-desc">When clients place orders, they will appear here.</p>
            </div>
          ) : (
            <div className="order-list">
              {recentOrders.map(order => {
                const date = new Date(order.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short' });
                return (
                  <div key={order._id} className="order-item">
                    <div className="order-item-left">
                      <div className="order-item-text">
                        <span className="order-number">
                          {order.orderNumber || order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="order-customer">{order.shipping?.name || 'Guest'}</span>
                      </div>
                    </div>
                    <div className="order-item-right">
                      <StatusBadge status={order.status}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;