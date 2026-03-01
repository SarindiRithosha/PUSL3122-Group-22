import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../../styles/RoomForm.css';

const LeftArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PlusCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Preview SVG based on shape and dimensions
const RoomPreviewSvg = ({ shape, width, length }) => {
    // Default fallback simple proportional rect
    const w = parseFloat(width) || 5;
    const l = parseFloat(length) || 4;

    // Scaling down for visual box (max dimensions roughly 150px)
    const scale = Math.min(150 / Math.max(w, l), 150 / Math.max(w, l));
    const scaledW = w * scale;
    const scaledL = l * scale;

    const fillAndStroke = { fill: "#f4ede8", stroke: "#a6958a", strokeWidth: 2 };

    let svgContent = null;

    if (shape === 'Rectangular' || shape === 'Square' || shape === '') {
        svgContent = <rect x={(200 - scaledW) / 2} y={(200 - scaledL) / 2} width={scaledW} height={scaledL} {...fillAndStroke} />;
    } else if (shape === 'L-Shape') {
        // Simplified L-shape for arbitrary width/length
        const tW = scaledW;
        const tL = scaledL;
        const armW = tW * 0.4;
        const armL = tL * 0.4;
        const bY = (200 - tL) / 2;
        const bX = (200 - tW) / 2;

        const path = `M ${bX} ${bY} L ${bX + tW} ${bY} L ${bX + tW} ${bY + armL} L ${bX + armW} ${bY + armL} L ${bX + armW} ${bY + tL} L ${bX} ${bY + tL} Z`;
        svgContent = <path d={path} {...fillAndStroke} />;
    }

    return (
        <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {svgContent}
        </svg>
    );
};


const RoomForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const isEditMode = location.pathname.includes('/edit') || !!id;

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        shape: '',
        width: '',
        length: '',
        height: '',
        floorMaterial: '',
        floorColors: ['#ffffff'],
        wallColors: ['#ffffff'],
        snapping: true,
        previewMode: '2D'
    });

    useEffect(() => {
        if (isEditMode) {
            setFormData(prev => ({
                ...prev,
                name: 'Master Bedroom',
                shape: 'Rectangular',
                width: '5.0',
                length: '4.0',
                height: '7.0',
                floorMaterial: 'Wood',
                floorColors: ['#E6DFD7'],
                wallColors: ['#6E5D52'],
                snapping: true
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
        <div className="rf-container">
            <button className="rf-back-btn" onClick={() => navigate('/admin/room-management')}>
                <LeftArrowIcon />
                Back to Room Management
            </button>

            <div className="rf-split-layout">
                {/* LEFT COLUMN: FORM */}
                <div className="rf-form-card">
                    <h2 className="rf-title">
                        {isEditMode ? 'Edit Room Template' : 'Add New Room Template'}
                    </h2>

                    <div className="rf-row">
                        <div className="rf-form-group flex-1">
                            <label>Room Name <span>*</span></label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g., Master Bedroom"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="rf-form-group flex-1">
                            <label>Room Shape <span>*</span></label>
                            <select name="shape" value={formData.shape} onChange={handleChange}>
                                <option value="" disabled>Select Shape</option>
                                <option value="Rectangular">Rectangular</option>
                                <option value="Square">Square</option>
                                <option value="L-Shape">L-Shape</option>
                            </select>
                        </div>
                    </div>

                    <div className="rf-form-group">
                        <label>Maximum Dimensions (Meters) <span>*</span></label>
                        <p className="rf-subtext">Sets the initial canvas limits for the 2D layout.</p>
                        <div className="rf-row dim-inputs">
                            <input type="number" name="width" placeholder="Width (W)" value={formData.width} onChange={handleChange} />
                            <input type="number" name="length" placeholder="Length (L)" value={formData.length} onChange={handleChange} />
                            <input type="number" name="height" placeholder="Height (H)" value={formData.height} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="rf-form-group">
                        <label>Base Palette <span>*</span></label>
                        <p className="rf-subtext">Define the default wall and floor color schemes.</p>
                        <div className="rf-row palette-row">
                            <div className="rf-palette-box">
                                {formData.floorColors.map((c, i) => (
                                    <span key={i} className="rf-color-swatch-sm" style={{ backgroundColor: c }}></span>
                                ))}
                                <button type="button" className="rf-add-color-btn">
                                    <PlusCircleIcon /> Add Colors (Floor)
                                </button>
                            </div>
                            <div className="rf-palette-box">
                                {formData.wallColors.map((c, i) => (
                                    <span key={i} className="rf-color-swatch-sm" style={{ backgroundColor: c }}></span>
                                ))}
                                <button type="button" className="rf-add-color-btn">
                                    <PlusCircleIcon /> Add Colors (Walls)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rf-form-group w-50">
                        <label>Floor Material <span>*</span></label>
                        <select name="floorMaterial" value={formData.floorMaterial} onChange={handleChange}>
                            <option value="" disabled>Select Material</option>
                            <option value="Wood">Wood</option>
                            <option value="Tile">Tile</option>
                            <option value="Carpet">Carpet</option>
                            <option value="Concrete">Concrete</option>
                        </select>
                    </div>

                    <div className="rf-toggle-row">
                        <label className="rf-checkbox-label">
                            <input type="checkbox" name="snapping" checked={formData.snapping} onChange={handleChange} />
                            <span className="rf-custom-checkbox"></span>
                            <div className="rf-checkbox-text">
                                <strong>Enable Grid Snapping by Default</strong>
                                <span className="rf-subtext">Helps designers align furniture perfectly in the 2D workspace.</span>
                            </div>
                        </label>
                    </div>

                    <div className="rf-form-footer">
                        {!isEditMode && <span className="rf-required-note">* Required fields</span>}
                        {isEditMode && (
                            <button type="button" className="rf-btn outline-danger-room">Delete Template</button>
                        )}

                        <div className="rf-footer-actions">
                            <button type="button" className="rf-btn text">Cancel</button>
                            <button type="button" className="rf-btn primary">
                                {isEditMode ? 'Save Changes' : 'Save Room'}
                            </button>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="rf-right-col">
                    {/* PREVIEW */}
                    <div className="rf-preview-card">
                        <div className="rf-preview-header">
                            <span className="rf-preview-title">Preview</span>
                            <div className="rf-preview-toggle">
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

                        <div className="rf-preview-content">
                            <RoomPreviewSvg shape={formData.shape} width={formData.width} length={formData.length} />
                        </div>

                        <div className="rf-preview-footer">
                            <span className="rf-dim-display">
                                {formData.width || '0.0'}m x {formData.length || '0.0'}m
                            </span>
                        </div>
                    </div>

                    {/* SAVED TEMPLATES */}
                    <div className="rf-saved-card">
                        <h3 className="rf-saved-title">Saved Room Templates (10)</h3>
                        <div className="rf-saved-list">
                            {[1, 2, 3].map(item => (
                                <div className="rf-saved-item" key={item}>
                                    <div className="rf-saved-icon-box">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h14v10H1z" /></svg>
                                    </div>
                                    <div className="rf-saved-item-text">
                                        <strong>Scandinavian Living Room</strong>
                                        <span>Living Room • scandinavian</span>
                                    </div>
                                    <button className="rf-saved-eye-btn">
                                        <EyeIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RoomForm;
