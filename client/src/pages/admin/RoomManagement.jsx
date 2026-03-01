import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RoomManagement.css';

// Mock Data
const mockRooms = [
    {
        id: 1,
        name: 'Master Bedroom',
        shape: 'Rectangular',
        size: '5m x 4m x 7m',
        palette: ['#E6DFD7', '#6E5D52'],
        status: 'Published',
        type: 'Rectangular'
    },
    {
        id: 2,
        name: 'Open Concept Living',
        shape: 'L-Shape',
        size: '8m x 6m x 7m',
        palette: ['#E6DFD7', '#2c2c2c'],
        status: 'Published',
        type: 'L-Shape'
    },
    {
        id: 3,
        name: 'Standard Home Office',
        shape: 'Square',
        size: '3m x 3m x 5m',
        palette: ['#cdd4da', '#4f5b66'],
        status: '',
        type: 'Square'
    }
];

// Reusable Icons
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

// Room SVGs for Cards
const RoomShapeSvg = ({ type }) => {
    const commonProps = {
        stroke: "#B1A9A2",
        strokeWidth: "3",
        strokeDasharray: "6 6",
        fill: "none",
        strokeLinejoin: "round",
        strokeLinecap: "round"
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

const RoomManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);

    const handleDeleteClick = (room) => {
        setRoomToDelete(room);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        // Here you would make an API call to delete the room
        console.log(`Deleting room template: ${roomToDelete?.name}`);
        setIsDeleteModalOpen(false);
        setRoomToDelete(null);
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setRoomToDelete(null);
    };

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
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="rm-filter-btn">Filter</button>
                <button className="rm-add-btn" onClick={() => navigate('/admin/room-management/add')}>+ Add New Room</button>
            </div>

            <div className="rm-grid">
                {mockRooms.map((room) => (
                    <div className="rm-card" key={room.id}>
                        <div className="rm-card-image-area">
                            {room.status && <span className="rm-status-badge">{room.status}</span>}
                            <div className="rm-svg-wrapper">
                                <RoomShapeSvg type={room.type} />
                            </div>
                        </div>

                        <div className="rm-card-content">
                            <h3>{room.name}</h3>

                            <div className="rm-details-grid">
                                <span className="rm-label">Shape:</span>
                                <span className="rm-value">{room.shape}</span>

                                <span className="rm-label">Size:</span>
                                <span className="rm-value">{room.size}</span>

                                <span className="rm-label">Palette:</span>
                                <div className="rm-color-swatches">
                                    {room.palette.map((color, idx) => (
                                        <span
                                            key={idx}
                                            className="rm-color-swatch"
                                            style={{ backgroundColor: color }}
                                        ></span>
                                    ))}
                                </div>
                            </div>

                            <div className="rm-card-actions">
                                <button className="rm-action-btn edit" onClick={() => navigate(`/admin/room-management/edit/${room.id}`)}>Edit</button>
                                <button className="rm-action-btn icon view" title="View Details">
                                    <EyeIcon />
                                </button>
                                <button className="rm-action-btn icon publish" title="Publish/Upload">
                                    <UploadIcon />
                                </button>
                                <button
                                    className="rm-action-btn icon delete"
                                    title="Delete"
                                    onClick={() => handleDeleteClick(room)}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="rm-modal-overlay">
                    <div className="rm-modal-content">
                        <button className="rm-modal-close" onClick={cancelDelete}>
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
                            This cannot be undone. Existing client designs using this template will not be affected.
                        </p>

                        <div className="rm-modal-actions">
                            <button className="rm-modal-btn cancel" onClick={cancelDelete}>Cancel</button>
                            <button className="rm-modal-btn delete" onClick={confirmDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
