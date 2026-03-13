import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDesigns, deleteDesign } from '../../services/designApi';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import '../../styles/DesignLibrary.css';

// ─── Filter option lists (mirrors SaveDesignModal) ─────────────────────────
const DESIGN_STYLES = [
  'Scandinavian','Minimalist','Traditional','Modern','Industrial',
  'Bohemian','Contemporary','Coastal','Rustic','Art Deco','Other',
];
const ROOM_TYPES = [
  'Living Room','Bedroom','Kitchen','Dining Room','Office',
  'Bathroom','Kids Room','Hallway','Balcony','Studio','Other',
];


// ─── Icons ─────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const View2DIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);
const View3DIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Mini room preview ──────────────────────────────────────────────────────
const RoomPreview = ({ floorColor, wallColor, shape }) => {
  const fc = floorColor || '#C8A882';
  const wc = wallColor  || '#8B7355';
  if (shape === 'L-Shape') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,10 110,10 110,60 60,60 60,110 10,110" fill={fc} stroke={wc} strokeWidth="4"/>
        <polygon points="10,10 110,10 110,60 60,60 60,110 10,110" fill="none" stroke={wc} strokeWidth="2" opacity="0.4"/>
      </svg>
    );
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="100" height="100" rx="4" fill={fc} stroke={wc} strokeWidth="4"/>
      {[30,50,70,90].map(x => <line key={`v${x}`} x1={x} y1="10" x2={x} y2="110" stroke={wc} strokeWidth="0.5" opacity="0.3"/>)}
      {[30,50,70,90].map(y => <line key={`h${y}`} x1="10" y1={y} x2="110" y2={y} stroke={wc} strokeWidth="0.5" opacity="0.3"/>)}
      <rect x="18" y="18" width="30" height="18" rx="3" fill={wc} opacity="0.25"/>
      <rect x="52" y="18" width="20" height="14" rx="2" fill={wc} opacity="0.18"/>
      <rect x="76" y="70" width="34" height="24" rx="3" fill={wc} opacity="0.2"/>
    </svg>
  );
};

// ─── Status badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status, isFinalized }) => {
  if (isFinalized) return <span className="dl-badge dl-badge-finalized">✓ Finalized</span>;
  if (status === 'Published') return <span className="dl-badge dl-badge-published">Published</span>;
  return <span className="dl-badge dl-badge-draft">Draft</span>;
};

// ─── Empty state ────────────────────────────────────────────────────────────
const EmptyState = ({ onNew, hasFilters }) => (
  <div className="dl-empty">
    <div className="dl-empty-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1C4B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
    <h3>{hasFilters ? 'No designs match your filters' : 'No designs yet'}</h3>
    <p>{hasFilters ? 'Try adjusting or clearing your filters.' : 'Start a new design in the workspace and save it here.'}</p>
    {!hasFilters && <button className="dl-btn-new" onClick={onNew}><PlusIcon /> New Design</button>}
  </div>
);

// ─── Design card ────────────────────────────────────────────────────────────
const DesignCard = ({ design, onOpen2D, onOpen3D, onEdit, onDelete }) => {
  const itemCount = design.itemCount ?? design.placedItems?.length ?? 0;
  const dateStr   = new Date(design.updatedAt || design.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="dl-card">
      {/* Preview */}
      <div className="dl-preview">
        <div className="dl-preview-svg">
          <RoomPreview floorColor={design.room?.floorColor} wallColor={design.room?.wallColor} shape={design.room?.shape}/>
        </div>
        <div className="dl-preview-badges">
          <StatusBadge status={design.status} isFinalized={design.isFinalized}/>
          <span className="dl-badge dl-badge-items">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        </div>

      </div>

      {/* Body */}
      <div className="dl-card-body">
        <h3 className="dl-card-title">{design.name}</h3>
        <div className="dl-card-meta">
          {design.clientName && (
            <span className="dl-meta-row">
              <span className="dl-meta-key">Client</span>
              <span className="dl-meta-val">{design.clientName}</span>
            </span>
          )}
          <span className="dl-meta-row">
            <span className="dl-meta-key">Room</span>
            <span className="dl-meta-val">{design.room?.name || design.room?.shape || '—'}</span>
          </span>
          {design.roomType && (
            <span className="dl-meta-row">
              <span className="dl-meta-key">Type</span>
              <span className="dl-meta-val dl-meta-tag dl-meta-tag-room">{design.roomType}</span>
            </span>
          )}
          {design.designStyle && (
            <span className="dl-meta-row">
              <span className="dl-meta-key">Style</span>
              <span className="dl-meta-val dl-meta-tag dl-meta-tag-style">{design.designStyle}</span>
            </span>
          )}
          <span className="dl-meta-row">
            <span className="dl-meta-key">Saved</span>
            <span className="dl-meta-val">{dateStr}</span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="dl-card-actions">
        <div className="dl-view-row">
          <button className="dl-view-btn dl-view-2d" onClick={() => onOpen2D(design._id)}>
            <View2DIcon /> Open 2D
          </button>
          <button className="dl-view-btn dl-view-3d" onClick={() => onOpen3D(design._id)}>
            <View3DIcon /> Open 3D
          </button>
        </div>
        <div className="dl-bottom-row">
          <button className="dl-edit-btn" onClick={() => onEdit(design._id)}>
            <EditIcon /> Edit Design
          </button>
          <button className="dl-delete-btn" onClick={() => onDelete(design)} title="Delete permanently">
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Active filter pill ─────────────────────────────────────────────────────
const FilterPill = ({ label, onRemove }) => (
  <span className="dl-filter-pill">
    {label}
    <button className="dl-filter-pill-x" onClick={onRemove} aria-label="Remove filter"><XIcon/></button>
  </span>
);

// ─── Main page ──────────────────────────────────────────────────────────────
const DesignLibrary = () => {
  const navigate = useNavigate();

  const [designs,      setDesigns]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [styleFilter,  setStyleFilter]  = useState('');
  const [roomFilter,   setRoomFilter]   = useState('');
  const [sortBy,       setSortBy]       = useState('updatedAt');
  const [order,        setOrder]        = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting,   setIsDeleting]   = useState(false);

  const hasFilters = !!(search || statusFilter || styleFilter || roomFilter);

  const fetchDesigns = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res = await listDesigns({
        search, status: statusFilter,
        designStyle: styleFilter, roomType: roomFilter,
        sortBy, order, limit: 50,
      });
      setDesigns(res.data || []);
    } catch {
      setError('Failed to load designs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, styleFilter, roomFilter, sortBy, order]);

  useEffect(() => { fetchDesigns(); }, [fetchDesigns]);

  const handleOpen2D = id => navigate(`/admin/design-workspace/${id}?mode=view&view=2D`);
  const handleOpen3D = id => navigate(`/admin/design-workspace/${id}?mode=view&view=3D`);
  const handleEdit   = id => navigate(`/admin/design-workspace/${id}?mode=edit`);
  const handleNew    = ()  => navigate('/admin/design-workspace');

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteDesign(deleteTarget._id);
      setDesigns(prev => prev.filter(d => d._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      alert('Failed to delete design. Please try again.');
    } finally { setIsDeleting(false); }
  };

  const clearAllFilters = () => {
    setSearch(''); setStatusFilter(''); setStyleFilter(''); setRoomFilter('');
  };

  return (
    <div className="dl-page">

      {/* Page header */}
      <div className="dl-page-header">
        <div className="dl-page-header-left">
          <h1>Design Library</h1>
          <p>Access, view, edit, or manage your saved design consultations.</p>
        </div>
        <button className="dl-btn-new" onClick={handleNew}><PlusIcon /> New Design</button>
      </div>

      {/* Toolbar */}
      <div className="dl-toolbar">
        {/* Search */}
        <div className="dl-search">
          <SearchIcon/>
          <input type="text" placeholder="Search designs or clients…"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        {/* Status */}
        <select className="dl-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>

        {/* Design Style filter */}
        <select className="dl-select dl-select-style" value={styleFilter} onChange={e => setStyleFilter(e.target.value)}>
          <option value="">All Styles</option>
          {DESIGN_STYLES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Room Type filter */}
        <select className="dl-select dl-select-room" value={roomFilter} onChange={e => setRoomFilter(e.target.value)}>
          <option value="">All Room Types</option>
          {ROOM_TYPES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Sort */}
        <select className="dl-select" value={`${sortBy}_${order}`}
          onChange={e => { const [s,o] = e.target.value.split('_'); setSortBy(s); setOrder(o); }}>
          <option value="updatedAt_desc">Newest First</option>
          <option value="updatedAt_asc">Oldest First</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>

        <button className="dl-refresh-btn" onClick={fetchDesigns} title="Refresh"><RefreshIcon/></button>
      </div>

      {/* Active filter pills */}
      {hasFilters && (
        <div className="dl-active-filters">
          <span className="dl-active-filters-label"><FilterIcon/> Filters:</span>
          {search       && <FilterPill label={`"${search}"`}       onRemove={() => setSearch('')}/>}
          {statusFilter && <FilterPill label={statusFilter}        onRemove={() => setStatusFilter('')}/>}
          {styleFilter  && <FilterPill label={styleFilter} onRemove={() => setStyleFilter('')}/>}
          {roomFilter   && <FilterPill label={roomFilter}   onRemove={() => setRoomFilter('')}/>}
          <button className="dl-clear-filters" onClick={clearAllFilters}>Clear all</button>
        </div>
      )}

      {/* Count row */}
      {!loading && !error && (
        <p className="dl-count">
          {designs.length === 0
            ? 'No designs found.'
            : `${designs.length} design${designs.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="dl-loading">
          <span className="dl-loading-spinner"/>
          <span>Loading designs…</span>
        </div>
      ) : error ? (
        <div className="dl-error">
          <p>{error}</p>
          <button onClick={fetchDesigns}>Try again</button>
        </div>
      ) : designs.length === 0 ? (
        <EmptyState onNew={handleNew} hasFilters={hasFilters}/>
      ) : (
        <div className="dl-grid">
          {designs.map(d => (
            <DesignCard key={d._id} design={d}
              onOpen2D={handleOpen2D} onOpen3D={handleOpen3D}
              onEdit={handleEdit} onDelete={setDeleteTarget}/>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal designName={deleteTarget.name}
          onConfirm={handleDeleteConfirm} onClose={() => setDeleteTarget(null)}
          isDeleting={isDeleting}/>
      )}
    </div>
  );
};

export default DesignLibrary;