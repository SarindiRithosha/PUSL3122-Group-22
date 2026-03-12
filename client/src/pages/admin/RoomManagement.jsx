import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteRoomTemplate as deleteRoomTemplateRequest,
  listRoomTemplates,
  updateRoomTemplate,
} from '../../services/roomApi';
import '../../styles/RoomManagement.css';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.9999 21L16.6499 16.65" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#E53E3E" strokeWidth="2" />
    <path d="M12 8V12" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="16" r="1.5" fill="#E53E3E" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RoomShapeSvg = ({ type }) => {
  const commonProps = {
    stroke: '#B1A9A2',
    strokeWidth: '3',
    strokeDasharray: '6 6',
    fill: 'none',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  };

  switch (type) {
    case 'Rectangular':
      return (
        <svg width="120" height="80" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="15" width="110" height="50" rx="2" {...commonProps} />
        </svg>
      );
    case 'L-Shape':
      return (
        <svg width="100" height="80" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
          <path d="M 5 5 L 95 5 L 95 45 L 35 45 L 35 75 L 5 75 Z" {...commonProps} />
        </svg>
      );
    case 'Square':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="70" height="70" rx="2" {...commonProps} />
        </svg>
      );
    default:
      return null;
  }
};

const formatDimensions = (dimensions = {}) => {
  const width = Number(dimensions.width || 0).toFixed(1);
  const length = Number(dimensions.length || 0).toFixed(1);
  const height = Number(dimensions.height || 0).toFixed(1);
  return `${width}m x ${length}m x ${height}m`;
};

const RoomManagement = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [shapeFilter, setShapeFilter] = useState('All Shapes');
  const [roomTemplates, setRoomTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState('');

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await listRoomTemplates({
          search: searchTerm.trim() || undefined,
          shape: shapeFilter === 'All Shapes' ? undefined : shapeFilter,
          limit: 100,
          sortBy: 'updatedAt',
          order: 'desc',
        });

        if (active) {
          setRoomTemplates(response.data || []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Failed to load room templates.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, shapeFilter]);

  const openDeleteModal = (room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const cancelDelete = () => {
    if (isDeleting) {
      return;
    }
    setIsDeleteModalOpen(false);
    setRoomToDelete(null);
  };

  const confirmDelete = async () => {
    if (!roomToDelete?._id) {
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage('');
      await deleteRoomTemplateRequest(roomToDelete._id);
      setRoomTemplates((prev) => prev.filter((room) => room._id !== roomToDelete._id));
      cancelDelete();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete room template.');
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (room) => {
    const nextStatus = room.status === 'Published' ? 'Draft' : 'Published';

    try {
      setStatusBusyId(room._id);
      setErrorMessage('');

      const response = await updateRoomTemplate(room._id, { status: nextStatus });

      setRoomTemplates((prev) =>
        prev.map((item) => (item._id === room._id ? response.data : item))
      );
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update status.');
    } finally {
      setStatusBusyId('');
    }
  };

  const shapeOptions = useMemo(() => ['All Shapes', 'Rectangular', 'Square', 'L-Shape'], []);

  return (
    <div className="rm-container">
      <div className="rm-header">
        <h1>Room Templates</h1>
        <p>Define default sizes, shapes, and color schemes for your workspaces.</p>
      </div>

      <div className="rm-toolbar">
        <div className="rm-search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select className="rm-filter-btn rm-filter-select" value={shapeFilter} onChange={(event) => setShapeFilter(event.target.value)}>
          {shapeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <button className="rm-add-btn" type="button" onClick={() => navigate('/admin/room-management/add')}>+ Add New Room</button>
      </div>

      {errorMessage && <div className="rm-alert error">{errorMessage}</div>}

      {isLoading ? (
        <div className="rm-state">Loading room templates...</div>
      ) : null}

      {!isLoading && roomTemplates.length === 0 ? (
        <div className="rm-state">No room templates found for current filters.</div>
      ) : null}

      {!isLoading && roomTemplates.length > 0 ? (
        <div className="rm-grid">
          {roomTemplates.map((room) => {
            const palette = [...(room.floorColors || []), ...(room.wallColors || [])].slice(0, 5);
            return (
              <div className="rm-card" key={room._id}>
                <div className="rm-card-image-area">
                  <span className={`rm-status-badge ${room.status?.toLowerCase() || 'draft'}`}>
                    {room.status || 'Draft'}
                  </span>
                  <div className="rm-svg-wrapper">
                    <RoomShapeSvg type={room.shape} />
                  </div>
                </div>

                <div className="rm-card-content">
                  <h3>{room.name}</h3>

                  <div className="rm-details-grid">
                    <span className="rm-label">Shape:</span>
                    <span className="rm-value">{room.shape}</span>

                    <span className="rm-label">Size:</span>
                    <span className="rm-value">{formatDimensions(room.dimensions)}</span>

                    <span className="rm-label">Palette:</span>
                    <div className="rm-color-swatches">
                      {palette.map((color, index) => (
                        <span
                          key={`${room._id}-${color}-${index}`}
                          className="rm-color-swatch"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rm-card-actions">
                    <button className="rm-action-btn edit" type="button" onClick={() => navigate(`/admin/room-management/edit/${room._id}`)}>Edit</button>
                    <button className="rm-action-btn icon view" type="button" title="View Details" onClick={() => navigate(`/admin/room-management/edit/${room._id}`)}>
                      <EyeIcon />
                    </button>
                    <button
                      className="rm-action-btn icon publish"
                      type="button"
                      title={room.status === 'Published' ? 'Unpublish' : 'Publish'}
                      onClick={() => toggleStatus(room)}
                      disabled={statusBusyId === room._id}
                    >
                      <UploadIcon />
                    </button>
                    <button className="rm-action-btn icon delete" type="button" title="Delete" onClick={() => openDeleteModal(room)}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {isDeleteModalOpen && (
        <div className="rm-modal-overlay">
          <div className="rm-modal-content">
            <button className="rm-modal-close" type="button" onClick={cancelDelete}>
              <CloseIcon />
            </button>

            <div className="rm-modal-header">
              <div className="rm-modal-icon-badge">
                <WarningIcon />
              </div>
            </div>

            <h2 className="rm-modal-title">Delete Room Template?</h2>
            <p className="rm-modal-description">
              Are you sure you want to delete <strong>{roomToDelete?.name}</strong>?
              This cannot be undone.
            </p>

            <div className="rm-modal-actions">
              <button className="rm-modal-btn cancel" type="button" onClick={cancelDelete} disabled={isDeleting}>Cancel</button>
              <button className="rm-modal-btn delete" type="button" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
