import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/FurnitureManagement.css';

const mockFurnitureData = [
  {
    id: '1',
    modelId: 'F-CH-001',
    name: 'Nordic Armchair',
    category: 'Seating',
    status: 'Published',
    dimensions: '0.8m × 0.8m',
    colors: ['#59768e', '#949494', '#e8e3d9'],
    type: 'armchair'
  },
  {
    id: '2',
    modelId: 'F-TB-012',
    name: 'Oak Dining Table',
    category: 'Tables',
    status: 'Published',
    dimensions: '2.0m × 1.0m',
    colors: ['#a66e38', '#463220'],
    type: 'table'
  },
  {
    id: '3',
    modelId: 'F-SF-045',
    name: 'Modular L-Sofa',
    category: 'Seating',
    status: '', // Third card doesn't have the status tag in the screenshot
    dimensions: '2.5m × 1.5m',
    colors: ['#d5c09e', '#557245', '#334c4b'],
    type: 'sofa'
  }
];

// Reusable Icon Components
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
    <path d="M10.29 3.86L1.82 18C1.64539 18.3024 1.55328 18.6453 1.55447 18.9945C1.55566 19.3438 1.65008 19.6872 1.82819 19.9905C2.0063 20.2937 2.26194 20.5463 2.56985 20.7231C2.87777 20.8999 3.22728 20.9947 3.58 21H20.42C20.7727 20.9947 21.1222 20.8999 21.4301 20.7231C21.7381 20.5463 21.9937 20.2937 22.1718 19.9905C22.3499 19.6872 22.4443 19.3438 22.4455 18.9945C22.4467 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32314 12.9812 3.15345C12.6817 2.98376 12.3437 2.89297 12 2.89297C11.6563 2.89297 11.3183 2.98376 11.0188 3.15345C10.7193 3.32314 10.4683 3.56611 10.29 3.86Z" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(229, 62, 62, 0.1)" />
    <path d="M12 9V13" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17H12.01" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Furniture SVG Generators
const renderFurnitureSvg = (type) => {
  switch (type) {
    case 'armchair':
      return (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="50" height="50" rx="8" stroke="#B0B0B0" strokeWidth="3" fill="#F9F9F9" />
          <rect x="15" y="35" width="10" height="30" rx="4" stroke="#B0B0B0" strokeWidth="3" fill="#F9F9F9" />
          <rect x="75" y="35" width="10" height="30" rx="4" stroke="#B0B0B0" strokeWidth="3" fill="#F9F9F9" />
          <path d="M 25 35 Q 50 15 75 35" stroke="#B0B0B0" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'table':
      return (
        <svg width="100" height="60" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="100" height="50" rx="4" stroke="#B0B0B0" strokeWidth="3" fill="#F9F9F9" />
          <circle cx="20" cy="20" r="3" fill="#B0B0B0" />
          <circle cx="100" cy="20" r="3" fill="#B0B0B0" />
          <circle cx="20" cy="50" r="3" fill="#B0B0B0" />
          <circle cx="100" cy="50" r="3" fill="#B0B0B0" />
        </svg>
      );
    case 'sofa':
      return (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 20 20 L 80 20 L 80 50 L 50 50 L 50 80 L 20 80 Z" stroke="#B0B0B0" strokeWidth="3" fill="#F9F9F9" strokeLinejoin="round" />
          <path d="M 30 30 L 70 30 L 70 40 L 40 40 L 40 70 L 30 70 Z" stroke="#D0D0D0" strokeWidth="2" fill="none" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

const FurnitureManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const navigate = useNavigate();

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    console.log(`Deleting item: ${itemToDelete?.name}`);
    // Simulate delete logic here (e.g API call)
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="fm-container">
      <div className="fm-header">
        <h1>Furniture Catalog</h1>
        <p>Manage 2D/3D furniture assets, default dimensions, and color variations.</p>
      </div>

      <div className="fm-toolbar">
        <div className="fm-search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search furniture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="fm-filter">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All Categories</option>
            <option>Seating</option>
            <option>Tables</option>
            <option>Beds</option>
            <option>Storage</option>
          </select>
        </div>

        <button className="fm-add-btn" onClick={() => navigate('/admin/furniture-management/add')}>
          + Add Furniture
        </button>
      </div>

      <div className="fm-grid">
        {mockFurnitureData.map((item) => (
          <div className="fm-card" key={item.id}>
            <div className="fm-card-image-area">
              <div className="fm-card-tags">
                <span className="fm-tag category">{item.category}</span>
                {item.status && <span className="fm-tag status">{item.status}</span>}
              </div>
              <div className="fm-svg-wrapper">
                {renderFurnitureSvg(item.type)}
              </div>
            </div>

            <div className="fm-card-content">
              <h3>{item.name}</h3>

              <div className="fm-details-grid">
                <span className="fm-label">Model ID:</span>
                <span className="fm-value model-id">{item.modelId}</span>

                <span className="fm-label">Default:</span>
                <span className="fm-value">{item.dimensions}</span>

                <span className="fm-label">Colors:</span>
                <div className="fm-color-swatches">
                  {item.colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="fm-color-swatch"
                      style={{ backgroundColor: color }}
                    ></span>
                  ))}
                </div>
              </div>

              <div className="fm-card-actions">
                <button className="fm-action-btn edit" onClick={() => navigate(`/admin/furniture-management/edit/${item.id}`)}>Edit</button>
                <button className="fm-action-btn icon view" title="View Details">
                  <EyeIcon />
                </button>
                <button className="fm-action-btn icon publish" title="Publish/Upload">
                  <UploadIcon />
                </button>
                <button className="fm-action-btn icon delete" title="Delete" onClick={() => handleDeleteClick(item)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {isDeleteModalOpen && (
        <div className="fm-modal-overlay">
          <div className="fm-modal-content">
            <div className="fm-modal-header">
              <div className="fm-modal-icon-wrapper">
                <WarningIcon />
              </div>
              <button className="fm-modal-close" onClick={cancelDelete}>
                <CloseIcon />
              </button>
            </div>

            <h2 className="fm-modal-title">Delete Furniture Asset?</h2>
            <p className="fm-modal-desc">
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
              This action cannot be undone and will remove the item from any active room designs.
            </p>

            <div className="fm-modal-actions">
              <button className="fm-modal-btn cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="fm-modal-btn delete" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FurnitureManagement;
