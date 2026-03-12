import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listFurniture,
  deleteFurniture as deleteFurnitureRequest,
  updateFurniture,
  resolveAssetUrl,
} from '../../services/furnitureApi';
import '../../styles/FurnitureManagement.css';

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

const BoxIcon = () => (
  <svg width="84" height="84" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30691 20.7315 7.00511C20.556 6.70331 20.3031 6.4521 20 6.276L13 2.276C12.6953 2.09886 12.3508 2.00586 12 2.00586C11.6492 2.00586 11.3047 2.09886 11 2.276L4 6.276C3.6969 6.4521 3.44403 6.70331 3.26846 7.00511C3.09289 7.30691 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09289 16.6931 3.26846 16.9949C3.44403 17.2967 3.6969 17.5479 4 17.724L11 21.724C11.3047 21.9011 11.6492 21.9941 12 21.9941C12.3508 21.9941 12.6953 21.9011 13 21.724L20 17.724C20.3031 17.5479 20.556 17.2967 20.7315 16.9949C20.9071 16.6931 20.9996 16.3507 21 16Z" stroke="#B0B0B0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke="#B0B0B0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 22.08V12" stroke="#B0B0B0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

const formatDimensions = (dimensions = {}) => {
  const width = Number(dimensions.width || 0).toFixed(2);
  const depth = Number(dimensions.depth || 0).toFixed(2);
  const height = Number(dimensions.height || 0).toFixed(2);
  return `${width}m × ${depth}m × ${height}m`;
};

const FurnitureManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await listFurniture({
          search: searchTerm.trim() || undefined,
          category: categoryFilter === 'All Categories' ? undefined : categoryFilter,
          limit: 100,
          sortBy: 'updatedAt',
          order: 'desc',
        });

        if (active) {
          setFurnitureItems(response.data || []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Failed to load furniture data.');
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
  }, [categoryFilter, searchTerm]);

  useEffect(() => {
    if (!isDeleteModalOpen) {
      return undefined;
    }

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isDeleteModalOpen]);

  const categories = useMemo(() => {
    const values = furnitureItems
      .map((item) => item.category)
      .filter(Boolean);

    return ['All Categories', ...new Set(values)];
  }, [furnitureItems]);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?._id) {
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage('');
      await deleteFurnitureRequest(itemToDelete._id);
      setFurnitureItems((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      closeDeleteModal();
    } catch (error) {
      setErrorMessage(error.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Published' ? 'Draft' : 'Published';

    try {
      setStatusBusyId(item._id);
      setErrorMessage('');
      const response = await updateFurniture(item._id, { status: nextStatus });

      setFurnitureItems((prev) =>
        prev.map((furniture) =>
          furniture._id === item._id ? response.data : furniture
        )
      );
    } catch (error) {
      setErrorMessage(error.message || 'Unable to change status.');
    } finally {
      setStatusBusyId('');
    }
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
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="fm-filter">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button
          className="fm-add-btn"
          type="button"
          onClick={() => navigate('/admin/furniture-management/add')}
        >
          + Add Furniture
        </button>
      </div>

      {errorMessage && <div className="fm-alert error">{errorMessage}</div>}

      {isLoading ? (
        <div className="fm-state">Loading furniture assets...</div>
      ) : null}

      {!isLoading && furnitureItems.length === 0 ? (
        <div className="fm-state">No furniture found for the current filters.</div>
      ) : null}

      {!isLoading && furnitureItems.length > 0 ? (
        <div className="fm-grid">
          {furnitureItems.map((item) => (
            <div className="fm-card" key={item._id}>
              <div className="fm-card-image-area">
                <div className="fm-card-tags">
                  <span className="fm-tag category">{item.category}</span>
                  {item.status && <span className="fm-tag status">{item.status}</span>}
                </div>

                <div className="fm-svg-wrapper">
                  {item.image2DUrl ? (
                    <img
                      className="fm-preview-image"
                      src={resolveAssetUrl(item.image2DUrl)}
                      alt={item.name}
                    />
                  ) : (
                    <BoxIcon />
                  )}
                </div>
              </div>

              <div className="fm-card-content">
                <h3>{item.name}</h3>

                <div className="fm-details-grid">
                  <span className="fm-label">Model ID:</span>
                  <span className="fm-value model-id">{item.modelId}</span>

                  <span className="fm-label">Default:</span>
                  <span className="fm-value">{formatDimensions(item.dimensions)}</span>

                  <span className="fm-label">Colors:</span>
                  <div className="fm-color-swatches">
                    {(item.colors || []).slice(0, 5).map((color, index) => (
                      <span
                        key={`${item._id}-${color}-${index}`}
                        className="fm-color-swatch"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="fm-card-actions">
                  <button
                    type="button"
                    className="fm-action-btn edit"
                    onClick={() => navigate(`/admin/furniture-management/edit/${item._id}`)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="fm-action-btn icon view"
                    title="View Details"
                    onClick={() => navigate(`/furniture/${item._id}`)}
                  >
                    <EyeIcon />
                  </button>

                  <button
                    type="button"
                    className="fm-action-btn icon publish"
                    title={item.status === 'Published' ? 'Unpublish' : 'Publish'}
                    onClick={() => handleToggleStatus(item)}
                    disabled={statusBusyId === item._id}
                  >
                    <UploadIcon />
                  </button>

                  <button
                    type="button"
                    className="fm-action-btn icon delete"
                    title="Delete"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {isDeleteModalOpen && (
        <div className="fm-modal-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDeleteModal();
          }
        }}>
          <div className="fm-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="fm-modal-header">
              <div className="fm-modal-icon-wrapper">
                <WarningIcon />
              </div>
              <button type="button" className="fm-modal-close" onClick={closeDeleteModal}>
                <CloseIcon />
              </button>
            </div>

            <h2 className="fm-modal-title">Delete Furniture Asset?</h2>
            <p className="fm-modal-desc">
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
            </p>

            <div className="fm-modal-actions">
              <button type="button" className="fm-modal-btn cancel" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button type="button" className="fm-modal-btn delete" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FurnitureManagement;

