import React, { useState } from 'react';
import '../../styles/DesignLibrary.css';

// SVGs for Icons
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.9999 21L16.6499 16.65" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BoxIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8C20.9996 7.64927 20.9071 7.30691 20.7315 7.00511C20.556 6.70331 20.3031 6.4521 20 6.276L13 2.276C12.6953 2.09886 12.3508 2.00586 12 2.00586C11.6492 2.00586 11.3047 2.09886 11 2.276L4 6.276C3.6969 6.4521 3.44403 6.70331 3.26846 7.00511C3.09289 7.30691 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09289 16.6931 3.26846 16.9949C3.44403 17.2967 3.6969 17.5479 4 17.724L11 21.724C11.3047 21.9011 11.6492 21.9941 12 21.9941C12.3508 21.9941 12.6953 21.9011 13 21.724L20 17.724C20.3031 17.5479 20.556 17.2967 20.7315 16.9949C20.9071 16.6931 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UploadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Custom Mockup Room Preview SGVs mapped to styles
const PreviewSvg = ({ colorStr }) => {
    return (
        <svg width="100%" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
            <path d="M 40 100 L 160 100 L 120 40 L 80 40 Z" fill={colorStr} opacity="0.1" />
            <rect x="85" y="70" width="30" height="20" fill={colorStr} />
            <path d="M 40 100 L 20 150" stroke={colorStr} strokeWidth="6" opacity="0.3" />
            <path d="M 160 100 L 180 150" stroke={colorStr} strokeWidth="6" opacity="0.3" />
        </svg>
    );
};

// Mock Data
const designLibraryData = [
    {
        id: '1',
        name: 'Scandinavian Living',
        client: 'Sarah Jenkins',
        date: 'Feb 21, 2026',
        status: 'Finalized',
        published: true,
        styleColor: '#D38042', // Orange accents
        statusColor: '#28a745'
    },
    {
        id: '2',
        name: 'Cozy Master Bedroom',
        client: 'David Miller',
        date: 'Feb 18, 2026',
        status: 'Draft',
        published: false,
        styleColor: '#A0a0a0', // Grey accents
        statusColor: '#f39c12'
    },
    {
        id: '3',
        name: 'Modern Home Office',
        client: 'TechCorp LLC',
        date: 'Feb 15, 2026',
        status: 'Finalized',
        published: true,
        styleColor: '#75B68A', // Green accents
        statusColor: '#28a745'
    }
];

const DesignLibrary = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="dl-container">
            <div className="dl-header">
                <h1>Design Library</h1>
                <p>Access, edit, or present your saved design consultations.</p>
            </div>

            <div className="dl-toolbar">
                <div className="dl-search-bar">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search projects or clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select className="dl-select">
                    <option value="All Rooms">All Rooms</option>
                    <option value="Living">Living</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Office">Office</option>
                </select>

                <select className="dl-select">
                    <option value="Newest">Sort by: Newest</option>
                    <option value="Oldest">Sort by: Oldest</option>
                    <option value="A-Z">Sort by: A-Z</option>
                </select>
            </div>

            <div className="dl-grid">
                {designLibraryData.map(item => (
                    <div className="dl-card" key={item.id}>
                        {/* Image Preview Block */}
                        <div className="dl-preview" style={{ backgroundColor: `${item.styleColor}10` }}>
                            <div className="dl-badges">
                                <span className="dl-badge-status">
                                    <span className="dl-dot" style={{ backgroundColor: item.statusColor }}></span>
                                    {item.status}
                                </span>
                                {item.published && (
                                    <span className="dl-badge-published">Published</span>
                                )}
                            </div>
                            <div className="dl-svg-container">
                                <PreviewSvg colorStr={item.styleColor} />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="dl-details">
                            <h3>{item.name}</h3>
                            <div className="dl-meta">
                                <span><span className="dl-meta-label">Client:</span> {item.client}</span>
                                <span><span className="dl-meta-label">Date:</span> {item.date}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="dl-actions">
                            <button className="dl-btn-primary">Open 2D Workspace</button>
                            <div className="dl-action-row">
                                <button className="dl-btn-edit">Edit</button>
                                <button className="dl-icon-btn box" title="3D View">
                                    <BoxIcon />
                                </button>
                                <button className="dl-icon-btn publish" title="Export/Share">
                                    <UploadIcon />
                                </button>
                                <button className="dl-icon-btn delete" title="Delete">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DesignLibrary;
