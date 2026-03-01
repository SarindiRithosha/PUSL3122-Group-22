import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../../styles/FurnitureForm.css';

const LeftArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#DE8B47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 8L12 3L7 8" stroke="#DE8B47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3V15" stroke="#DE8B47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FileIcon = ({ color = "#DE8B47" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 2V9H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BoxIcon = ({ color = "#DE8B47" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8C20.9996 7.64927 20.9071 7.30691 20.7315 7.00511C20.556 6.70331 20.3031 6.4521 20 6.276L13 2.276C12.6953 2.09886 12.3508 2.00586 12 2.00586C11.6492 2.00586 11.3047 2.09886 11 2.276L4 6.276C3.6969 6.4521 3.44403 6.70331 3.26846 7.00511C3.09289 7.30691 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09289 16.6931 3.26846 16.9949C3.44403 17.2967 3.6969 17.5479 4 17.724L11 21.724C11.3047 21.9011 11.6492 21.9941 12 21.9941C12.3508 21.9941 12.6953 21.9011 13 21.724L20 17.724C20.3031 17.5479 20.556 17.2967 20.7315 16.9949C20.9071 16.6931 20.9996 16.3507 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FurnitureForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    // Determine if we are in Edit mode
    const isEditMode = location.pathname.includes('/edit') || !!id;

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        colors: ['#3F5C75', '#8C8C8C', '#EAE6DF'], // Default initial colors from mockup
        width: '0.8',
        depth: '0.8',
        height: '0.9',
        shading: true,
        previewMode: '3D' // '2D' or '3D'
    });

    // Simulate loading data if edit mode
    useEffect(() => {
        if (isEditMode) {
            setFormData(prev => ({
                ...prev,
                name: 'Nordic Armchair',
                category: 'Chair',
                price: '5000',
                width: '0.8',
                depth: '0.8',
                height: '0.9',
            }));
        }
    }, [isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="ff-container">
            <button className="ff-back-btn" onClick={() => navigate('/admin/furniture-management')}>
                <LeftArrowIcon />
                Back to Furniture Catalog
            </button>

            <div className="ff-split-layout">
                {/* LEFT COLUMN: FORM */}
                <div className="ff-form-card">
                    <h2 className="ff-title">
                        {isEditMode ? 'Edit Furniture Asset' : 'Add New Furniture Asset'}
                    </h2>

                    <div className="ff-row">
                        <div className="ff-form-group flex-1">
                            <label>Asset Name <span>*</span></label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g., Velvet Lounge Chair"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="ff-form-group flex-1">
                            <label>Category <span>*</span></label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="" disabled>Select Category</option>
                                <option value="Chair">Chair</option>
                                <option value="Table">Table</option>
                                <option value="Sofa">Sofa</option>
                                <option value="Bed">Bed</option>
                            </select>
                        </div>
                    </div>

                    <div className="ff-form-group">
                        <label>Price (LKR) <span>*</span></label>
                        <input
                            type="number"
                            name="price"
                            placeholder="5000"
                            className="ff-price-input"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="ff-form-group">
                        <label>Description <span>*</span></label>
                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="ff-form-group">
                        <label>Available Material Colors</label>
                        <p className="ff-subtext">Define the default color swatches available for this asset.</p>
                        <div className="ff-color-row container-box">
                            {formData.colors.map((color, idx) => (
                                <div key={idx} className="ff-color-swatch-large" style={{ backgroundColor: color }}></div>
                            ))}
                            <button type="button" className="ff-add-hex-btn">
                                <span className="ff-plus-circle">+</span> Add Hex Code
                            </button>
                        </div>
                    </div>

                    {isEditMode ? (
                        // EDIT MODE: Dimensions & Replace Files
                        <>
                            <div className="ff-form-group">
                                <label>Default Dimensions (m)</label>
                                <p className="ff-subtext">Used as the baseline footprint in the 2D workspace.</p>
                                <div className="ff-row">
                                    <div className="ff-form-group flex-1">
                                        <span className="ff-dim-label">Width</span>
                                        <input type="number" name="width" step="0.1" value={formData.width} onChange={handleChange} />
                                    </div>
                                    <div className="ff-form-group flex-1">
                                        <span className="ff-dim-label">Depth</span>
                                        <input type="number" name="depth" step="0.1" value={formData.depth} onChange={handleChange} />
                                    </div>
                                    <div className="ff-form-group flex-1">
                                        <span className="ff-dim-label">Height</span>
                                        <input type="number" name="height" step="0.1" value={formData.height} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="ff-row">
                                <div className="ff-file-replace-card flex-1">
                                    <div className="ff-file-icon-box green">
                                        <FileIcon color="#4CAF50" />
                                    </div>
                                    <div className="ff-file-info">
                                        <span className="ff-file-name">armchair_topdown.png</span>
                                        <span className="ff-file-action green">Replace 2D File</span>
                                    </div>
                                </div>
                                <div className="ff-file-replace-card flex-1">
                                    <div className="ff-file-icon-box orange">
                                        <BoxIcon color="#DE8B47" />
                                    </div>
                                    <div className="ff-file-info">
                                        <span className="ff-file-name">armchair_model.obj</span>
                                        <span className="ff-file-action orange">Replace 3D File</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // ADD MODE: Drag & Drop Area
                        <div className="ff-drag-drop-area">
                            <UploadIcon />
                            <p><strong>Drag & drop asset files here</strong></p>
                            <p className="ff-subtext">Supports PNG (2D Top-Down) and OBJ/GLTF (3D Model)</p>
                        </div>
                    )}

                    <div className="ff-toggle-row">
                        <div className="ff-toggle-text">
                            <label>Allow 3D Shading</label>
                            <p className="ff-subtext">Enable dynamic shading for this object in the 3D renderer.</p>
                        </div>
                        <label className="ff-switch">
                            <input type="checkbox" name="shading" checked={formData.shading} onChange={handleChange} />
                            <span className="ff-slider round"></span>
                        </label>
                    </div>

                    <div className="ff-form-footer">
                        {!isEditMode && <span className="ff-required-note">* Required fields</span>}
                        {isEditMode && (
                            <button type="button" className="ff-btn outline-danger">Delete Assets</button>
                        )}

                        <div className="ff-footer-actions">
                            <button type="button" className="ff-btn text">Cancel</button>
                            <button type="button" className="ff-btn primary">
                                {isEditMode ? 'Save Changes' : 'Save Room'}
                            </button>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="ff-preview-card">
                    <div className="ff-preview-header">
                        <span className="ff-preview-title">Preview</span>
                        <div className="ff-preview-toggle">
                            <button
                                className={formData.previewMode === '2D' ? 'active' : ''}
                                onClick={() => setFormData(prev => ({ ...prev, previewMode: '2D' }))}
                            >2D</button>
                            <button
                                className={formData.previewMode === '3D' ? 'active' : ''}
                                onClick={() => setFormData(prev => ({ ...prev, previewMode: '3D' }))}
                            >3D</button>
                        </div>
                    </div>

                    <div className="ff-preview-content">
                        {/* Inline SVG rendering a stylized 3D leather armchair to match the mockup */}
                        <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 100 L100 130 L160 100 L110 70 Z" fill="#7d4e38" stroke="#5c3826" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M50 100 L100 130 L100 160 L50 120 Z" fill="#633b28" stroke="#5c3826" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M100 130 L160 100 L160 130 L100 160 Z" fill="#5c3826" stroke="#4a2a1b" strokeWidth="2" strokeLinejoin="round" />

                            {/* Backrest */}
                            <path d="M55 70 L105 100 L155 70 L105 40 Z" fill="#8c583f" stroke="#6b402b" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M55 70 L105 100 L105 130 L55 100 Z" fill="#754731" stroke="#5c3826" strokeWidth="2" strokeLinejoin="round" />

                            {/* Left Armrest */}
                            <path d="M40 90 L60 100 L60 130 L40 120 Z" fill="#7d4e38" stroke="#5c3826" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M40 90 L60 100 L80 90 L60 70 Z" fill="#8c583f" stroke="#6b402b" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M60 100 L80 90 L80 120 L60 130 Z" fill="#633b28" stroke="#4a2a1b" strokeWidth="2" strokeLinejoin="round" />

                            {/* Right Armrest */}
                            <path d="M140 100 L160 90 L160 120 L140 130 Z" fill="#633b28" stroke="#4a2a1b" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M140 100 L160 90 L180 100 L160 110 Z" fill="#8c583f" stroke="#6b402b" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M160 110 L180 100 L180 130 L160 140 Z" fill="#5c3826" stroke="#4a2a1b" strokeWidth="2" strokeLinejoin="round" />

                            {/* Seat Details (Cushion tufting simulation) */}
                            <circle cx="85" cy="110" r="2" fill="#4a2a1b" />
                            <circle cx="105" cy="115" r="2" fill="#4a2a1b" />
                            <circle cx="125" cy="110" r="2" fill="#4a2a1b" />
                            <circle cx="95" cy="120" r="2" fill="#4a2a1b" />
                            <circle cx="115" cy="120" r="2" fill="#4a2a1b" />

                            {/* Legs */}
                            <rect x="60" y="150" width="4" height="15" fill="#301b11" />
                            <rect x="140" y="150" width="4" height="15" fill="#301b11" />
                            <rect x="100" y="160" width="4" height="15" fill="#301b11" />
                        </svg>
                    </div>

                    <div className="ff-preview-footer">
                        <div className="ff-dimensions-chip">
                            <span className="ff-dim-title">Dimensions</span>
                            <span className="ff-dim-value">1.22m x 2.00m x 1.24m</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FurnitureForm;
