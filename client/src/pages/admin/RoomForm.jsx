import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  createRoomTemplate,
  deleteRoomTemplate,
  getRoomTemplateById,
  listRoomTemplates,
  updateRoomTemplate,
} from '../../services/roomApi';
import ColorPickerModal from '../../components/ColorPickerModal';
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

const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C12.83 22 13.5 21.33 13.5 20.5C13.5 20.12 13.37 19.77 13.14 19.51C12.92 19.25 12.8 18.92 12.8 18.5C12.8 17.67 13.47 17 14.3 17H16C18.76 17 21 14.76 21 12C21 6.49 17.51 2 12 2ZM6.5 13C5.67 13 5 12.33 5 11.5C5 10.67 5.67 10 6.5 10C7.33 10 8 10.67 8 11.5C8 12.33 7.33 13 6.5 13ZM9.5 9C8.67 9 8 8.33 8 7.5C8 6.67 8.67 6 9.5 6C10.33 6 11 6.67 11 7.5C11 8.33 10.33 9 9.5 9ZM14.5 9C13.67 9 13 8.33 13 7.5C13 6.67 13.67 6 14.5 6C15.33 6 16 6.67 16 7.5C16 8.33 15.33 9 14.5 9ZM17.5 13C16.67 13 16 12.33 16 11.5C16 10.67 16.67 10 17.5 10C18.33 10 19 10.67 19 11.5C19 12.33 18.33 13 17.5 13Z" fill="currentColor" />
  </svg>
);

const RemoveSwatchIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RoomPreviewSvg = ({ shape, width, length, floorColor, wallColor }) => {
  const numericWidth = Number(width) || 5;
  const numericLength = Number(length) || 4;
  const scale = 140 / Math.max(numericWidth, numericLength, 1);
  const scaledWidth = numericWidth * scale;
  const scaledLength = numericLength * scale;
  const centerX = (200 - scaledWidth) / 2;
  const centerY = (200 - scaledLength) / 2;

  const fillAndStroke = {
    fill: floorColor || '#f4ede8',
    stroke: wallColor || '#a6958a',
    strokeWidth: 2,
  };
  let content = null;

  if (shape === 'L-Shape') {
    const armWidth = scaledWidth * 0.4;
    const armLength = scaledLength * 0.4;
    const path = `M ${centerX} ${centerY} L ${centerX + scaledWidth} ${centerY} L ${centerX + scaledWidth} ${centerY + armLength} L ${centerX + armWidth} ${centerY + armLength} L ${centerX + armWidth} ${centerY + scaledLength} L ${centerX} ${centerY + scaledLength} Z`;
    content = <path d={path} {...fillAndStroke} />;
  } else {
    content = <rect x={centerX} y={centerY} width={scaledWidth} height={scaledLength} {...fillAndStroke} />;
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {content}
    </svg>
  );
};

const floorMaterialProperties = (material) => {
  switch (material) {
    case 'Wood':
      return { roughness: 0.82, metalness: 0.05 };
    case 'Tile':
      return { roughness: 0.38, metalness: 0.12 };
    case 'Carpet':
      return { roughness: 0.98, metalness: 0.0 };
    case 'Concrete':
      return { roughness: 0.95, metalness: 0.02 };
    case 'Marble':
      return { roughness: 0.28, metalness: 0.1 };
    case 'Laminate':
      return { roughness: 0.65, metalness: 0.08 };
    case 'Vinyl':
      return { roughness: 0.55, metalness: 0.04 };
    default:
      return { roughness: 0.75, metalness: 0.05 };
  }
};

const buildRoomPlan = (shape, width, length) => {
  if (shape === 'L-Shape') {
    const armWidth = width * 0.4;
    const armLength = length * 0.4;

    const perimeter = [
      { x: -width / 2, z: -length / 2 },
      { x: width / 2, z: -length / 2 },
      { x: width / 2, z: -length / 2 + armLength },
      { x: -width / 2 + armWidth, z: -length / 2 + armLength },
      { x: -width / 2 + armWidth, z: length / 2 },
      { x: -width / 2, z: length / 2 },
    ];

    const floorRects = [
      {
        x: -(width - armWidth) / 2,
        z: 0,
        width: armWidth,
        length,
      },
      {
        x: 0,
        z: -(length - armLength) / 2,
        width,
        length: armLength,
      },
    ];

    return { floorRects, perimeter };
  }

  return {
    floorRects: [{ x: 0, z: 0, width, length }],
    perimeter: [
      { x: -width / 2, z: -length / 2 },
      { x: width / 2, z: -length / 2 },
      { x: width / 2, z: length / 2 },
      { x: -width / 2, z: length / 2 },
    ],
  };
};

const RoomPreview3D = ({ shape, width, length, height, floorColor, wallColor, floorMaterial }) => {
  const {
    floorRects,
    wallSegments,
    scaledHeight,
    floorThickness,
    floorProps,
    cameraDistance,
  } = useMemo(() => {
    const rawWidth = Math.max(Number(width) || 5, 0.5);
    const rawLength = Math.max(Number(length) || 4, 0.5);
    const rawHeight = Math.max(Number(height) || 2.8, 0.5);

    const normalize = 2.5 / Math.max(rawWidth, rawLength, rawHeight);
    const scaledWidth = rawWidth * normalize;
    const scaledLength = rawLength * normalize;
    const scaledHeightLocal = rawHeight * normalize;
    const wallThickness = Math.max(Math.min(scaledWidth, scaledLength) * 0.04, 0.04);
    const floorThicknessLocal = 0.05;
    const plan = buildRoomPlan(shape || 'Rectangular', scaledWidth, scaledLength);
    const floorPropsLocal = floorMaterialProperties(floorMaterial);
    const distance = Math.max(scaledWidth, scaledLength, scaledHeightLocal) * 2.2;

    const segments = plan.perimeter.map((point, index, points) => {
      const next = points[(index + 1) % points.length];
      const dx = next.x - point.x;
      const dz = next.z - point.z;
      const lengthValue = Math.hypot(dx, dz);
      const centerX = (point.x + next.x) / 2;
      const centerZ = (point.z + next.z) / 2;
      const rotationY = Math.atan2(dz, dx);

      return {
        length: lengthValue,
        centerX,
        centerZ,
        rotationY,
        wallThickness,
      };
    });

    return {
      floorRects: plan.floorRects,
      wallSegments: segments,
      scaledHeight: scaledHeightLocal,
      floorThickness: floorThicknessLocal,
      floorProps: floorPropsLocal,
      cameraDistance: distance,
    };
  }, [shape, width, length, height, floorMaterial]);

  return (
    <Canvas className="rf-preview-canvas" camera={{ position: [cameraDistance, cameraDistance * 0.7, cameraDistance], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 2]} intensity={1} />
      <directionalLight position={[-2, 3, -3]} intensity={0.4} />

      {floorRects.map((rect, index) => (
        <mesh key={`floor-${index}`} position={[rect.x, -floorThickness / 2, rect.z]}>
          <boxGeometry args={[rect.width, floorThickness, rect.length]} />
          <meshStandardMaterial color={floorColor} roughness={floorProps.roughness} metalness={floorProps.metalness} />
        </mesh>
      ))}

      {wallSegments.map((segment, index) => (
        <mesh
          key={`wall-${index}`}
          position={[segment.centerX, scaledHeight / 2, segment.centerZ]}
          rotation={[0, segment.rotationY, 0]}
        >
          <boxGeometry args={[segment.length, scaledHeight, segment.wallThickness]} />
          <meshStandardMaterial color={wallColor} roughness={0.86} metalness={0.03} />
        </mesh>
      ))}

      <OrbitControls
        makeDefault
        target={[0, scaledHeight / 3, 0]}
        enablePan
        panSpeed={0.8}
        rotateSpeed={1}
        zoomSpeed={1}
        minDistance={0.7}
        maxDistance={10}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
};

const initialFormState = {
  name: '',
  shape: '',
  width: '',
  length: '',
  height: '',
  floorMaterial: '',
  floorColors: ['#FFFFFF'],
  wallColors: ['#FFFFFF'],
  snapping: true,
  previewMode: '2D',
  status: 'Draft',
};

const RoomForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialFormState);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerType, setColorPickerType] = useState('floor');
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const previewFloorColor = formData.floorColors[formData.floorColors.length - 1] || '#E6DFD7';
  const previewWallColor = formData.wallColors[formData.wallColors.length - 1] || '#FFFFFF';

  useEffect(() => {
    let active = true;

    const loadRecent = async () => {
      try {
        const response = await listRoomTemplates({
          limit: 5,
          sortBy: 'updatedAt',
          order: 'desc',
        });

        if (active) {
          setRecentTemplates(response.data || []);
        }
      } catch {
        if (active) {
          setRecentTemplates([]);
        }
      }
    };

    loadRecent();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let active = true;

    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await getRoomTemplateById(id);
        const room = response.data;

        if (!active) {
          return;
        }

        setFormData({
          name: room.name || '',
          shape: room.shape || '',
          width: String(room?.dimensions?.width ?? ''),
          length: String(room?.dimensions?.length ?? ''),
          height: String(room?.dimensions?.height ?? ''),
          floorMaterial: room.floorMaterial || '',
          floorColors: Array.isArray(room.floorColors) && room.floorColors.length ? room.floorColors : ['#FFFFFF'],
          wallColors: Array.isArray(room.wallColors) && room.wallColors.length ? room.wallColors : ['#FFFFFF'],
          snapping: Boolean(room.snapping),
          previewMode: room.previewMode || '2D',
          status: room.status || 'Draft',
        });
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Failed to load room template.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadTemplate();

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openColorPicker = (type) => {
    setColorPickerType(type);
    setColorPickerOpen(true);
  };

  const handleColorPicked = (hex) => {
    const key = colorPickerType === 'floor' ? 'floorColors' : 'wallColors';
    const upperHex = hex.toUpperCase();

    if (formData[key].includes(upperHex)) {
      setErrorMessage('Color already exists in this palette.');
      return;
    }

    setFormData((prev) => {
      const currentColors = prev[key] || [];
      const onlyDefaultWhite =
        currentColors.length === 1 && currentColors[0].toUpperCase() === '#FFFFFF';

      return {
        ...prev,
        [key]: onlyDefaultWhite ? [upperHex] : [...currentColors, upperHex],
      };
    });
    setErrorMessage('');
  };

  const removeColor = (type, colorValue) => {
    const key = type === 'floor' ? 'floorColors' : 'wallColors';
    setFormData((prev) => {
      const next = prev[key].filter((color) => color !== colorValue);
      return {
        ...prev,
        [key]: next.length > 0 ? next : ['#FFFFFF'],
      };
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Room name is required.';
    if (!formData.shape.trim()) return 'Room shape is required.';
    if (!Number(formData.width) || Number(formData.width) <= 0) return 'Width must be greater than 0.';
    if (!Number(formData.length) || Number(formData.length) <= 0) return 'Length must be greater than 0.';
    if (!Number(formData.height) || Number(formData.height) <= 0) return 'Height must be greater than 0.';
    if (!formData.floorMaterial.trim()) return 'Floor material is required.';
    return '';
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    shape: formData.shape,
    dimensions: {
      width: Number(formData.width),
      length: Number(formData.length),
      height: Number(formData.height),
    },
    floorMaterial: formData.floorMaterial,
    floorColors: formData.floorColors,
    wallColors: formData.wallColors,
    snapping: formData.snapping,
    previewMode: formData.previewMode,
    status: formData.status,
  });

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      const payload = buildPayload();

      if (isEditMode) {
        await updateRoomTemplate(id, payload);
        setSuccessMessage('Room template updated successfully.');
      } else {
        await createRoomTemplate(payload);
        setSuccessMessage('Room template created successfully.');
      }

      setTimeout(() => {
        navigate('/admin/room-management');
      }, 600);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save room template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) {
      return;
    }

    const confirmed = window.confirm('Delete this room template? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage('');
      await deleteRoomTemplate(id);
      navigate('/admin/room-management');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete room template.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="rf-container">
      <button className="rf-back-btn" type="button" onClick={() => navigate('/admin/room-management')}>
        <LeftArrowIcon />
        Back to Room Management
      </button>

      {errorMessage && <div className="rf-alert rf-alert-error">{errorMessage}</div>}
      {successMessage && <div className="rf-alert rf-alert-success">{successMessage}</div>}

      {isLoading ? (
        <div className="rf-loading">Loading room template details...</div>
      ) : (
        <div className="rf-split-layout">
          <div className="rf-form-card">
            <h2 className="rf-title">{isEditMode ? 'Edit Room Template' : 'Add New Room Template'}</h2>

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
                <input type="number" name="width" min="0.1" step="0.1" placeholder="Width (W)" value={formData.width} onChange={handleChange} />
                <input type="number" name="length" min="0.1" step="0.1" placeholder="Length (L)" value={formData.length} onChange={handleChange} />
                <input type="number" name="height" min="0.1" step="0.1" placeholder="Height (H)" value={formData.height} onChange={handleChange} />
              </div>
            </div>

            <div className="rf-row">
              <div className="rf-form-group flex-1">
                <label>Floor Material <span>*</span></label>
                <select name="floorMaterial" value={formData.floorMaterial} onChange={handleChange}>
                  <option value="" disabled>Select Material</option>
                  <option value="Wood">Wood</option>
                  <option value="Tile">Tile</option>
                  <option value="Carpet">Carpet</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Laminate">Laminate</option>
                  <option value="Marble">Marble</option>
                  <option value="Vinyl">Vinyl</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="rf-form-group flex-1">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            <div className="rf-form-group rf-palette-section">
              <label>Base Palette <span>*</span></label>
              <p className="rf-subtext">Define default wall and floor color schemes.</p>

              {/* Floor Colors */}
              <div className="rf-palette-group">
                <div className="rf-palette-label">
                  <PaletteIcon />
                  <span>Floor Colors</span>
                </div>
                <div className="rf-palette-content">
                  <div className="rf-swatches-row">
                    {formData.floorColors.map((color) => (
                      <div key={color} className="rf-swatch-wrap">
                        <button
                          type="button"
                          className="rf-color-swatch"
                          style={{ backgroundColor: color }}
                          title={color}
                          onClick={() => removeColor('floor', color)}
                        />
                        <span className="rf-swatch-remove" onClick={() => removeColor('floor', color)}>
                          <RemoveSwatchIcon />
                        </span>
                        <span className="rf-swatch-hex">{color}</span>
                      </div>
                    ))}
                    <button type="button" className="rf-pick-color-btn" onClick={() => openColorPicker('floor')}>
                      <PlusCircleIcon />
                      <span>Pick Color</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Wall Colors */}
              <div className="rf-palette-group">
                <div className="rf-palette-label">
                  <PaletteIcon />
                  <span>Wall Colors</span>
                </div>
                <div className="rf-palette-content">
                  <div className="rf-swatches-row">
                    {formData.wallColors.map((color) => (
                      <div key={color} className="rf-swatch-wrap">
                        <button
                          type="button"
                          className="rf-color-swatch"
                          style={{ backgroundColor: color }}
                          title={color}
                          onClick={() => removeColor('wall', color)}
                        />
                        <span className="rf-swatch-remove" onClick={() => removeColor('wall', color)}>
                          <RemoveSwatchIcon />
                        </span>
                        <span className="rf-swatch-hex">{color}</span>
                      </div>
                    ))}
                    <button type="button" className="rf-pick-color-btn" onClick={() => openColorPicker('wall')}>
                      <PlusCircleIcon />
                      <span>Pick Color</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rf-toggle-row">
              <label className="rf-checkbox-label">
                <input type="checkbox" name="snapping" checked={formData.snapping} onChange={handleChange} />
                <span className="rf-custom-checkbox" />
                <div className="rf-checkbox-text">
                  <strong>Enable Grid Snapping by Default</strong>
                  <span className="rf-subtext">Helps designers align furniture perfectly in the 2D workspace.</span>
                </div>
              </label>
            </div>

            <div className="rf-form-footer">
              {!isEditMode && <span className="rf-required-note">* Required fields</span>}
              {isEditMode && (
                <button type="button" className="rf-btn outline-danger-room" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete Template'}
                </button>
              )}

              <div className="rf-footer-actions">
                <button type="button" className="rf-btn text" onClick={() => navigate('/admin/room-management')}>Cancel</button>
                <button type="button" className="rf-btn primary" onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Room'}
                </button>
              </div>
            </div>
          </div>

          <div className="rf-right-col">
            <div className="rf-preview-card">
              <div className="rf-preview-header">
                <span className="rf-preview-title">Preview</span>
                <div className="rf-preview-toggle">
                  <button type="button" className={formData.previewMode === '2D' ? 'active' : ''} onClick={() => setFormData((prev) => ({ ...prev, previewMode: '2D' }))}>2D</button>
                  <button type="button" className={formData.previewMode === '3D' ? 'active' : ''} onClick={() => setFormData((prev) => ({ ...prev, previewMode: '3D' }))}>3D</button>
                </div>
              </div>

              <div className="rf-preview-content">
                {formData.previewMode === '2D' ? (
                  <RoomPreviewSvg
                    shape={formData.shape}
                    width={formData.width}
                    length={formData.length}
                    floorColor={previewFloorColor}
                    wallColor={previewWallColor}
                  />
                ) : (
                  <div className="rf-preview-canvas-wrap">
                    <RoomPreview3D
                      shape={formData.shape}
                      width={formData.width}
                      length={formData.length}
                      height={formData.height}
                      floorMaterial={formData.floorMaterial}
                      floorColor={previewFloorColor}
                      wallColor={previewWallColor}
                    />
                  </div>
                )}
              </div>

              <p className="rf-preview-hint">
                {formData.previewMode === '3D'
                  ? 'Drag to rotate | Right-click drag to pan | Scroll to zoom'
                  : '2D room outline preview'}
              </p>

              <div className="rf-preview-footer">
                <span className="rf-dim-display">
                  {Number(formData.width || 0).toFixed(1)}m x {Number(formData.length || 0).toFixed(1)}m x {Number(formData.height || 0).toFixed(1)}m
                </span>
              </div>
            </div>

            <div className="rf-saved-card">
              <h3 className="rf-saved-title">Saved Room Templates ({recentTemplates.length})</h3>
              <div className="rf-saved-list">
                {recentTemplates.slice(0, 3).map((item) => (
                  <div className="rf-saved-item" key={item._id}>
                    <div className="rf-saved-icon-box">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h14v10H1z" /></svg>
                    </div>
                    <div className="rf-saved-item-text">
                      <strong>{item.name}</strong>
                      <span>{item.shape} | {item.floorMaterial || 'Material N/A'}</span>
                    </div>
                    <button className="rf-saved-eye-btn" type="button" onClick={() => navigate(`/admin/room-management/edit/${item._id}`)}>
                      <EyeIcon />
                    </button>
                  </div>
                ))}
                {recentTemplates.length === 0 && (
                  <div className="rf-empty-saved">No room templates saved yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ColorPickerModal
        isOpen={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onSelectColor={handleColorPicked}
        title={colorPickerType === 'floor' ? 'Pick Floor Color' : 'Pick Wall Color'}
      />
    </div>
  );
};

export default RoomForm;
