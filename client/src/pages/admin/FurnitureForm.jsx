import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { ACESFilmicToneMapping, MeshBasicMaterial } from 'three';
import {
  createFurniture,
  deleteFurniture,
  getFurnitureById,
  resolveAssetUrl,
  uploadFurnitureAsset,
  updateFurniture,
  updateFurnitureScale,
} from '../../services/furnitureApi';
import ColorPickerModal from '../../components/ColorPickerModal';
import '../../styles/FurnitureForm.css';

// ── Icons 
const LeftArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#DE8B47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 8L12 3L7 8" stroke="#DE8B47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3V15" stroke="#DE8B47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const FileIcon = ({ color = '#DE8B47' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 2V9H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const BoxIcon = ({ color = '#DE8B47' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30691 20.7315 7.00511C20.556 6.70331 20.3031 6.4521 20 6.276L13 2.276C12.6953 2.09886 12.3508 2.00586 12 2.00586C11.6492 2.00586 11.3047 2.09886 11 2.276L4 6.276C3.6969 6.4521 3.44403 6.70331 3.26846 7.00511C3.09289 7.30691 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09289 16.6931 3.26846 16.9949C3.44403 17.2967 3.6969 17.5479 4 17.724L11 21.724C11.3047 21.9011 11.6492 21.9941 12 21.9941C12.3508 21.9941 12.6953 21.9011 13 21.724L20 17.724C20.3031 17.5479 20.556 17.2967 20.7315 16.9949C20.9071 16.6931 20.9996 16.3507 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C12.83 22 13.5 21.33 13.5 20.5C13.5 20.12 13.37 19.77 13.14 19.51C12.92 19.25 12.8 18.92 12.8 18.5C12.8 17.67 13.47 17 14.3 17H16C18.76 17 21 14.76 21 12C21 6.49 17.51 2 12 2ZM6.5 13C5.67 13 5 12.33 5 11.5C5 10.67 5.67 10 6.5 10C7.33 10 8 10.67 8 11.5C8 12.33 7.33 13 6.5 13ZM9.5 9C8.67 9 8 8.33 8 7.5C8 6.67 8.67 6 9.5 6C10.33 6 11 6.67 11 7.5C11 8.33 10.33 9 9.5 9ZM14.5 9C13.67 9 13 8.33 13 7.5C13 6.67 13.67 6 14.5 6C15.33 6 16 6.67 16 7.5C16 8.33 15.33 9 14.5 9ZM17.5 13C16.67 13 16 12.33 16 11.5C16 10.67 16.67 10 17.5 10C18.33 10 19 10.67 19 11.5C19 12.33 18.33 13 17.5 13Z" fill="currentColor"/>
  </svg>
);
const RemoveSwatchIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const PlusCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);

// ── Helpers 
const getFileExtension = (value = '') => {
  const sanitized = String(value).split('?')[0].split('#')[0];
  const lastDotIndex = sanitized.lastIndexOf('.');
  return lastDotIndex < 0 ? '' : sanitized.slice(lastDotIndex + 1).toLowerCase();
};

const toNumberOr = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const supportedModelFormats = new Set(['glb', 'gltf', 'obj']);

// ── Apply tint/shading to a traversed object ──────────────────────────────────
const applyTint = (obj, hexColor, shadingEnabled) => {
  if (!obj) return;
  obj.traverse(n => {
    if (!n?.isMesh || !n.material) return;
    n.castShadow    = Boolean(shadingEnabled);
    n.receiveShadow = Boolean(shadingEnabled);
    if (shadingEnabled && n.geometry && !n.geometry.attributes?.normal)
      n.geometry.computeVertexNormals?.();

    const applyMat = (mat) => {
      if (!mat || typeof mat.clone !== 'function') return mat;
      if (shadingEnabled) {
        const m = mat.clone();
        if (hexColor && m?.color?.set) m.color.set(hexColor);
        m.needsUpdate = true;
        return m;
      }
      const f = new MeshBasicMaterial({
        color:       mat.color ? mat.color.clone() : new THREE.Color('#D4B896'),
        map:         mat.map   || null,
        transparent: Boolean(mat.transparent),
        opacity:     Number.isFinite(mat.opacity) ? mat.opacity : 1,
        side:        mat.side,
      });
      if (hexColor && f?.color?.set) f.color.set(hexColor);
      f.needsUpdate = true;
      return f;
    };

    n.material = Array.isArray(n.material) ? n.material.map(applyMat) : applyMat(n.material);
  });
};

const PreviewModel = ({ modelUrl, modelFormat, tintColor, shadingEnabled }) => {
  const [scene, setScene] = useState(null);
  const baseRef = useRef(null);

  useEffect(() => {
    if (!modelUrl) { setScene(null); baseRef.current = null; return; }

    const url = resolveAssetUrl(modelUrl);
    const extFromUrl = url.split('?')[0].split('/').pop().split('.').pop().toLowerCase();
    const ext = (modelFormat && modelFormat !== '') ? modelFormat.toLowerCase() : extFromUrl;

    const onLoaded = (rootObject) => {
      const sc  = rootObject.clone ? rootObject.clone(true) : rootObject;
      const box = new THREE.Box3().setFromObject(sc);
      const sz  = box.getSize(new THREE.Vector3());
      // Scale to ~1.8 units tall (same ratio as FurnitureDetail)
      const s   = 1.8 / Math.max(sz.x, sz.y, sz.z, 0.001);
      sc.scale.setScalar(s);
      // Floor-align: centre X/Z but sit on y=0
      const b2 = new THREE.Box3().setFromObject(sc);
      const c2 = b2.getCenter(new THREE.Vector3());
      sc.position.set(-c2.x, -b2.min.y, -c2.z);
      baseRef.current = sc;
      applyTint(sc, tintColor, shadingEnabled);
      setScene(sc.clone(true));
    };

    const onError = () => { setScene(null); baseRef.current = null; };

    if (ext === 'obj') {
      new OBJLoader().load(url, onLoaded, undefined, onError);
    } else {
      new GLTFLoader().load(url, (gltf) => onLoaded(gltf.scene), undefined, onError);
    }
    return () => { baseRef.current = null; };
  }, [modelUrl]);

  // Re-tint without reloading when colour or shading changes
  useEffect(() => {
    if (!baseRef.current) return;
    applyTint(baseRef.current, tintColor, shadingEnabled);
    setScene(baseRef.current.clone(true));
  }, [tintColor, shadingEnabled]);

  if (!scene) return (
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1.2, 1, 0.8]}/>
      <meshStandardMaterial color={tintColor || '#D4B896'} roughness={0.6} metalness={0.1}/>
    </mesh>
  );
  return <primitive object={scene}/>;
};

// ── Form state ────────────────────────────────────────────────────────────────
const initialFormState = {
  modelId: '',
  name: '',
  category: '',
  price: '',
  description: '',
  colors: ['#3F5C75', '#8C8C8C', '#EAE6DF'],
  width: '0.8',
  depth: '0.8',
  height: '0.9',
  shading: true,
  previewMode: '3D',
  status: 'Draft',
  image2DUrl: '',
  model3DUrl: '',
  modelFormat: 'glb',
  scaleX: '1',
  scaleY: '1',
  scaleZ: '1',
  uniformScale: true,
};

// ── Main component 
const FurnitureForm = () => {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const isEditMode  = Boolean(id);

  const imageFileInputRef = useRef(null);
  const modelFileInputRef = useRef(null);

  const [formData,            setFormData]            = useState(initialFormState);
  const [activePreviewColor,  setActivePreviewColor]  = useState(initialFormState.colors[0] || '#FFFFFF');
  const [colorPickerOpen,     setColorPickerOpen]     = useState(false);
  const [selected2DFile,      setSelected2DFile]      = useState('');
  const [selected3DFile,      setSelected3DFile]      = useState('');
  const [selected2DFileObj,   setSelected2DFileObj]   = useState(null);
  const [selected3DFileObj,   setSelected3DFileObj]   = useState(null);
  const [localImagePreviewUrl,setLocalImagePreviewUrl]= useState('');
  const [localModelPreviewUrl,setLocalModelPreviewUrl]= useState('');
  const [isLoading,           setIsLoading]           = useState(isEditMode);
  const [isSaving,            setIsSaving]            = useState(false);
  const [isDeleting,          setIsDeleting]          = useState(false);
  const [errorMessage,        setErrorMessage]        = useState('');
  const [successMessage,      setSuccessMessage]      = useState('');
  const [showDeleteModal,     setShowDeleteModal]     = useState(false);

  // Revoke object URLs on unmount
  useEffect(() => () => { if (localImagePreviewUrl) URL.revokeObjectURL(localImagePreviewUrl); }, [localImagePreviewUrl]);
  useEffect(() => () => { if (localModelPreviewUrl) URL.revokeObjectURL(localModelPreviewUrl); }, [localModelPreviewUrl]);

  // Load existing item in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    let active = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const { data: furniture } = await getFurnitureById(id);
        if (!active) return;
        const scale = furniture?.model3D?.scale || {};
        const scaleX = String(scale.x ?? 1);
        const scaleY = String(scale.y ?? 1);
        const scaleZ = String(scale.z ?? 1);
        setFormData({
          modelId:     furniture.modelId   || '',
          name:        furniture.name      || '',
          category:    furniture.category  || '',
          price:       String(furniture.price ?? ''),
          description: furniture.description || '',
          colors: Array.isArray(furniture.colors) && furniture.colors.length > 0 ? furniture.colors : ['#3F5C75'],
          width:   String(furniture?.dimensions?.width  ?? 1),
          depth:   String(furniture?.dimensions?.depth  ?? 1),
          height:  String(furniture?.dimensions?.height ?? 1),
          shading:     Boolean(furniture.shading),
          previewMode: furniture.previewMode || '3D',
          status:      furniture.status      || 'Draft',
          image2DUrl:  furniture.image2DUrl  || '',
          model3DUrl:  furniture?.model3D?.fileUrl || '',
          modelFormat: furniture?.model3D?.format  || getFileExtension(furniture?.model3D?.fileUrl) || 'glb',
          scaleX, scaleY, scaleZ,
          uniformScale: scaleX === scaleY && scaleY === scaleZ,
        });
        setActivePreviewColor(
          Array.isArray(furniture.colors) && furniture.colors.length > 0 ? furniture.colors[0] : '#FFFFFF'
        );
        setSelected2DFile((furniture.image2DUrl || '').split('/').pop() || '');
        setSelected3DFile((furniture?.model3D?.fileUrl || '').split('/').pop() || '');
        setSelected2DFileObj(null); setSelected3DFileObj(null);
        setLocalImagePreviewUrl(''); setLocalModelPreviewUrl('');
      } catch (err) {
        if (active) setErrorMessage(err.message || 'Failed to load furniture item.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id, isEditMode]);

  // Sync activePreviewColor when colors array changes
  useEffect(() => {
    if (!Array.isArray(formData.colors) || formData.colors.length === 0) {
      setActivePreviewColor('#FFFFFF'); return;
    }
    if (!formData.colors.includes(activePreviewColor))
      setActivePreviewColor(formData.colors[0]);
  }, [activePreviewColor, formData.colors]);

  // Escape key for delete modal
  useEffect(() => {
    if (!showDeleteModal) return;
    const onEsc = (e) => { if (e.key === 'Escape') setShowDeleteModal(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showDeleteModal]);

  const categoryOptions = useMemo(() => {
    const defaults = ['Seating', 'Tables', 'Beds', 'Storage', 'Decor'];
    return formData.category && !defaults.includes(formData.category)
      ? [formData.category, ...defaults] : defaults;
  }, [formData.category]);

  // Derived preview values
  const previewImageSrc = localImagePreviewUrl || resolveAssetUrl(formData.image2DUrl);
  const previewModelSrc = localModelPreviewUrl || resolveAssetUrl(formData.model3DUrl);
  const effectiveModelFormat = (formData.modelFormat || getFileExtension(previewModelSrc)).toLowerCase();
  const canRenderModel = Boolean(previewModelSrc) && supportedModelFormats.has(effectiveModelFormat);

  // ── Event handlers 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleScaleInputChange = (axis, value) => {
    setFormData(prev => prev.uniformScale
      ? { ...prev, scaleX: value, scaleY: value, scaleZ: value }
      : { ...prev, [axis]: value });
  };
  const handleUniformScaleToggle = (checked) => {
    setFormData(prev => ({ ...prev, uniformScale: checked,
      scaleY: checked ? prev.scaleX : prev.scaleY,
      scaleZ: checked ? prev.scaleX : prev.scaleZ }));
  };
  const setPresetScale = (value) => {
    const v = String(value);
    setFormData(prev => ({ ...prev, scaleX: v, scaleY: v, scaleZ: v, uniformScale: true }));
  };
  const handleColorPicked = (hex) => {
    const upper = hex.toUpperCase();
    if (formData.colors.includes(upper)) { setErrorMessage('Color already exists.'); return; }
    setFormData(prev => ({ ...prev, colors: [...prev.colors, upper] }));
    setActivePreviewColor(upper); setErrorMessage('');
  };
  const removeColor = (color) => setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
  const handleModelFileChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const ext  = file.name.split('.').pop()?.toLowerCase() || '';
    // Client-side size check — 50 MB
    if (file.size > 50 * 1024 * 1024) { setErrorMessage('3D model is too large. Maximum size is 50 MB.'); e.target.value = ''; return; }
    setSelected3DFile(file.name); setSelected3DFileObj(file);
    setFormData(prev => ({ ...prev, modelFormat: ext }));
    setLocalModelPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
  };
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    // Client-side size check — 5 MB
    if (file.size > 5 * 1024 * 1024) { setErrorMessage('Image is too large. Maximum size is 5 MB.'); e.target.value = ''; return; }
    setSelected2DFile(file.name); setSelected2DFileObj(file);
    setLocalImagePreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
  };
  const onDropFiles = (e) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files || []).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (['png','jpg','jpeg','webp'].includes(ext)) {
        setSelected2DFile(file.name); setSelected2DFileObj(file);
        setLocalImagePreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
      }
      if (['glb','gltf','obj','fbx'].includes(ext)) {
        setSelected3DFile(file.name); setSelected3DFileObj(file);
        setFormData(prev => ({ ...prev, modelFormat: ext }));
        setLocalModelPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
      }
    });
  };
  const validateForm = () => {
    if (!formData.modelId.trim())  return 'Model ID is required.';
    if (!formData.name.trim())     return 'Asset Name is required.';
    if (!formData.category.trim()) return 'Category is required.';
    if (!toNumberOr(formData.price, 0)) return 'Price must be greater than 0.';
    if (!toNumberOr(formData.width, 0) || !toNumberOr(formData.depth, 0) || !toNumberOr(formData.height, 0))
      return 'All dimensions must be greater than 0.';
    if (!toNumberOr(formData.scaleX, 0) || !toNumberOr(formData.scaleY, 0) || !toNumberOr(formData.scaleZ, 0))
      return 'Scale values must be greater than 0.';
    return '';
  };
  const buildPayload = (overrides = {}) => ({
    modelId:     formData.modelId.trim().toUpperCase(),
    name:        formData.name.trim(),
    category:    formData.category.trim(),
    price:       Number(formData.price),
    description: formData.description.trim(),
    colors:      formData.colors,
    dimensions:  { width: Number(formData.width), depth: Number(formData.depth), height: Number(formData.height) },
    shading:     formData.shading,
    previewMode: formData.previewMode,
    status:      formData.status,
    image2DUrl:  overrides.image2DUrl   ?? formData.image2DUrl.trim(),
    model3D: {
      fileUrl: overrides.model3DUrl  ?? formData.model3DUrl.trim(),
      format:  overrides.modelFormat ?? formData.modelFormat.trim().toLowerCase(),
      scale:   { x: Number(formData.scaleX), y: Number(formData.scaleY), z: Number(formData.scaleZ) },
    },
  });
  const handleSubmit = async () => {
    const err = validateForm();
    if (err) { setErrorMessage(err); return; }
    try {
      setIsSaving(true); setErrorMessage('');
      let image2DUrl   = formData.image2DUrl.trim();
      let model3DUrl   = formData.model3DUrl.trim();
      let modelFormat  = formData.modelFormat.trim().toLowerCase();
      if (selected2DFileObj) {
        const r = await uploadFurnitureAsset('image', selected2DFileObj);
        image2DUrl = r?.data?.url || image2DUrl;
      }
      if (selected3DFileObj) {
        const r = await uploadFurnitureAsset('model', selected3DFileObj);
        model3DUrl  = r?.data?.url || model3DUrl;
        modelFormat = getFileExtension(model3DUrl) || modelFormat;
      }
      const payload = buildPayload({ image2DUrl, model3DUrl, modelFormat });
      if (isEditMode) {
        await updateFurniture(id, payload);
        await updateFurnitureScale(id, { x: payload.model3D.scale.x, y: payload.model3D.scale.y, z: payload.model3D.scale.z });
        setSuccessMessage('Furniture updated successfully.');
      } else {
        await createFurniture(payload);
        setSuccessMessage('Furniture created successfully.');
      }
      setFormData(prev => ({ ...prev, image2DUrl, model3DUrl, modelFormat }));
      setSelected2DFileObj(null); setSelected3DFileObj(null);
      setLocalImagePreviewUrl(''); setLocalModelPreviewUrl('');
      setTimeout(() => navigate('/admin/furniture-management'), 700);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save furniture asset.');
    } finally { setIsSaving(false); }
  };
  const handleDelete = async () => {
    if (!isEditMode || !id) return;
    try {
      setIsDeleting(true); setErrorMessage('');
      await deleteFurniture(id);
      navigate('/admin/furniture-management');
    } catch (error) {
      setErrorMessage(error.message || 'Delete failed.');
      setIsDeleting(false);
    }
  };

  // ── Render 
  return (
    <div className="ff-container">
      <button type="button" className="ff-back-btn" onClick={() => navigate('/admin/furniture-management')}>
        <LeftArrowIcon/> Back to Furniture Catalog
      </button>

      {errorMessage   && <div className="ff-alert ff-alert-error">{errorMessage}</div>}
      {successMessage && <div className="ff-alert ff-alert-success">{successMessage}</div>}

      {isLoading ? (
        <div className="ff-loading">Loading furniture details...</div>
      ) : (
        <div className="ff-split-layout">
          {/* ── LEFT: Form ── */}
          <div className="ff-form-card">
            <h2 className="ff-title">{isEditMode ? 'Edit Furniture Asset' : 'Add New Furniture Asset'}</h2>

            <div className="ff-row">
              <div className="ff-form-group flex-1">
                <label>Model ID <span>*</span></label>
                <input type="text" name="modelId" placeholder="e.g., F-CH-001" value={formData.modelId} onChange={handleChange}/>
              </div>
              <div className="ff-form-group flex-1">
                <label>Asset Name <span>*</span></label>
                <input type="text" name="name" placeholder="e.g., Velvet Lounge Chair" value={formData.name} onChange={handleChange}/>
              </div>
            </div>

            <div className="ff-row">
              <div className="ff-form-group flex-1">
                <label>Category <span>*</span></label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="" disabled>Select Category</option>
                  {categoryOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="ff-form-group flex-1">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            <div className="ff-form-group">
              <label>Price (LKR) <span>*</span></label>
              <input type="number" name="price" placeholder="5000" className="ff-price-input" value={formData.price} onChange={handleChange}/>
            </div>

            <div className="ff-form-group">
              <label>Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange}/>
            </div>

            {/* Colors */}
            <div className="ff-form-group ff-palette-section">
              <label>Available Material Colors</label>
              <p className="ff-subtext">Define default color swatches for this asset.</p>
              <div className="ff-palette-group">
                <div className="ff-palette-label"><PaletteIcon/><span>Furniture Colors</span></div>
                <div className="ff-palette-content">
                  <div className="ff-swatches-row">
                    {formData.colors.map(color => (
                      <div key={color} className="ff-swatch-wrap">
                        <button type="button"
                          className={`ff-color-swatch-circle ${activePreviewColor === color ? 'active' : ''}`}
                          style={{ backgroundColor: color }}
                          title={`Use ${color} for 3D preview`}
                          onClick={() => setActivePreviewColor(color)}/>
                        <span className="ff-swatch-remove" onClick={e => { e.stopPropagation(); removeColor(color); }}>
                          <RemoveSwatchIcon/>
                        </span>
                        <span className="ff-swatch-hex">{color}</span>
                      </div>
                    ))}
                    <button type="button" className="ff-pick-color-btn" onClick={() => setColorPickerOpen(true)}>
                      <PlusCircleIcon/><span>Pick Color</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="ff-form-group">
              <label>Default Dimensions (m)</label>
              <div className="ff-row">
                {['width','depth','height'].map(dim => (
                  <div key={dim} className="ff-form-group flex-1 margin-0">
                    <span className="ff-dim-label">{dim[0].toUpperCase()+dim.slice(1)}</span>
                    <input type="number" name={dim} min="0.1" step="0.1" value={formData[dim]} onChange={handleChange}/>
                  </div>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div className="ff-form-group">
              <label>3D Model Scale</label>
              <p className="ff-subtext">Control scale factors sent to the 3D renderer (X, Y, Z).</p>
              <label className="ff-inline-check">
                <input type="checkbox" checked={formData.uniformScale} onChange={e => handleUniformScaleToggle(e.target.checked)}/>
                Keep X/Y/Z uniform
              </label>
              <div className="ff-row">
                {[['scaleX','Scale X'],['scaleY','Scale Y'],['scaleZ','Scale Z']].map(([axis, label]) => (
                  <div key={axis} className="ff-form-group flex-1 margin-0">
                    <span className="ff-dim-label">{label}</span>
                    <input type="number" min="0.1" step="0.1" value={formData[axis]}
                      onChange={e => handleScaleInputChange(axis, e.target.value)}
                      disabled={formData.uniformScale && axis !== 'scaleX'}/>
                  </div>
                ))}
              </div>
              <div className="ff-scale-presets">
                {[0.5,1,1.5,2].map(v => (
                  <button type="button" key={v} className="ff-scale-chip" onClick={() => setPresetScale(v)}>{v}x</button>
                ))}
              </div>
            </div>

            {/* File uploads */}
            <div className="ff-form-group">
              <label>Asset Files</label>
              <p className="ff-subtext">File picker opens only when selecting these buttons.</p>
              <input ref={imageFileInputRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleImageFileChange} className="ff-hidden-file"/>
              <input ref={modelFileInputRef} type="file" accept=".glb,.gltf,.obj,.fbx"  onChange={handleModelFileChange} className="ff-hidden-file"/>
              <div className="ff-drag-drop-area" onDragOver={e => e.preventDefault()} onDrop={onDropFiles}>
                <UploadIcon/>
                <p><strong>Drop files here (optional)</strong></p>
                <p className="ff-subtext">PNG/JPG for 2D preview · GLB/GLTF/OBJ for 3D model · Max: 5 MB image, 50 MB model</p>
                <div className="ff-file-picker-actions">
                  <button type="button" className="ff-btn primary small" onClick={() => imageFileInputRef.current?.click()}>Select 2D File</button>
                  <button type="button" className="ff-btn primary small" onClick={() => modelFileInputRef.current?.click()}>Select 3D File</button>
                </div>
              </div>
              <div className="ff-row">
                <div className="ff-file-replace-card flex-1">
                  <div className="ff-file-icon-box green"><FileIcon color="#4CAF50"/></div>
                  <div className="ff-file-info">
                    <span className="ff-file-name">{selected2DFile || 'No 2D file selected'}</span>
                    <span className="ff-file-action green">
                      {selected2DFileObj ? 'Selected (save to upload)' : formData.image2DUrl ? 'Image ready' : 'Select and save to upload'}
                    </span>
                  </div>
                </div>
                <div className="ff-file-replace-card flex-1">
                  <div className="ff-file-icon-box orange"><BoxIcon color="#DE8B47"/></div>
                  <div className="ff-file-info">
                    <span className="ff-file-name">{selected3DFile || 'No 3D file selected'}</span>
                    <span className="ff-file-action orange">
                      {selected3DFileObj ? 'Selected (save to upload)' : formData.model3DUrl ? 'Model ready' : 'Select and save to upload'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shading toggle */}
            <div className="ff-toggle-row">
              <div className="ff-toggle-text">
                <label>Allow 3D Shading</label>
                <p className="ff-subtext">Enable dynamic shading in the 3D renderer.</p>
              </div>
              <label className="ff-switch">
                <input type="checkbox" name="shading" checked={formData.shading} onChange={handleChange}/>
                <span className="ff-slider round"/>
              </label>
            </div>

            {/* Footer */}
            <div className="ff-form-footer">
              {!isEditMode && <span className="ff-required-note">* Required fields</span>}
              {isEditMode && (
                <button type="button" className="ff-btn outline-danger" onClick={() => setShowDeleteModal(true)}>Delete Asset</button>
              )}
              <div className="ff-footer-actions">
                <button type="button" className="ff-btn text" onClick={() => navigate('/admin/furniture-management')}>Cancel</button>
                <button type="button" className="ff-btn primary" onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Furniture'}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Preview ── */}
          <div className="ff-preview-card">
            <div className="ff-preview-header">
              <div className="ff-preview-header-left">
                <span className="ff-preview-title">Preview</span>
                {formData.name && <span className="ff-preview-asset-name">{formData.name}</span>}
              </div>
              <div className="ff-preview-toggle">
                <button type="button" className={formData.previewMode === '2D' ? 'active' : ''}
                  onClick={() => setFormData(prev => ({ ...prev, previewMode: '2D' }))}>2D</button>
                <button type="button" className={formData.previewMode === '3D' ? 'active' : ''}
                  onClick={() => setFormData(prev => ({ ...prev, previewMode: '3D' }))}>3D</button>
              </div>
            </div>

            <div className="ff-preview-content">
              {formData.previewMode === '2D' ? (
                previewImageSrc ? (
                  <img className="ff-preview-image-large" src={previewImageSrc} alt="2D preview"/>
                ) : (
                  <div className="ff-preview-placeholder">
                    <div className="ff-preview-placeholder-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    No 2D image selected yet.
                  </div>
                )
              ) : canRenderModel ? (
                // ── 3D Canvas — fixed camera + floor-aligned centering ──────────
                <div className="ff-preview-canvas-wrap">
                  <Canvas
                    key={`${previewModelSrc}-${effectiveModelFormat}`}
                    className="ff-preview-canvas"
                    shadows={formData.shading}
                    // Same camera as FurnitureDetail — looking from +Z, centred on X=0
                    camera={{ position: [0, 1.4, 3.2], fov: 42, near: 0.01, far: 1000 }}
                    gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.06 }}
                  >
                    {formData.shading && (
                      <>
                        <ambientLight intensity={0.3}/>
                        <hemisphereLight intensity={0.46} color="#fff7ef" groundColor="#9fa3aa"/>
                        <directionalLight castShadow intensity={1.45} color="#fff7ec" position={[4.5, 6, 3.2]}
                          shadow-mapSize-width={2048} shadow-mapSize-height={2048}
                          shadow-camera-near={0.5} shadow-camera-far={20}
                          shadow-camera-left={-5} shadow-camera-right={5}
                          shadow-camera-top={5} shadow-camera-bottom={-5}
                          shadow-bias={-0.00015}/>
                        <directionalLight intensity={0.4} color="#cad9ff" position={[-3, 2, -3]}/>
                        <spotLight castShadow intensity={0.8} color="#ffe4c3" position={[0, 5.4, 2.2]}
                          angle={0.52} penumbra={0.56} distance={18}
                          shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0002}/>
                        <pointLight intensity={0.28} color="#9bb4ff" position={[0.9, 1.2, -2.8]}/>
                        <Environment preset="apartment" intensity={0.36}/>
                        {/* Shadow receiver plane fixed at y=0, not floating */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                          <planeGeometry args={[12, 12]}/>
                          <shadowMaterial transparent opacity={0.22}/>
                        </mesh>
                        {/* Contact shadow also at y=0 */}
                        <ContactShadows position={[0, 0.001, 0]} opacity={0.52} scale={6} blur={2.3} far={2} resolution={512}/>
                      </>
                    )}
                    <PreviewModel
                      modelUrl={previewModelSrc}
                      modelFormat={effectiveModelFormat}
                      tintColor={activePreviewColor}
                      shadingEnabled={formData.shading}
                    />
                    <OrbitControls
                      makeDefault
                      target={[0, 0.6, 0]}
                      enablePan
                      panSpeed={0.8}
                      rotateSpeed={1.2}
                      zoomSpeed={1.05}
                      minDistance={0.35}
                      maxDistance={12}
                      enableDamping
                      dampingFactor={0.08}
                    />
                  </Canvas>
                  <p className="ff-canvas-hint">Drag to rotate · Right-click to pan · Scroll to zoom</p>
                </div>
              ) : (
                <div className="ff-preview-placeholder">
                  <div className="ff-preview-placeholder-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                  {previewModelSrc
                    ? `3D preview supports .glb/.gltf/.obj. Current: .${effectiveModelFormat || 'unknown'}`
                    : 'No 3D model selected yet.'}
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="ff-preview-footer">
              <div className="ff-preview-status-row">
                <span className={`ff-preview-status-badge ${formData.status.toLowerCase()}`}>
                  <span className="ff-preview-status-dot"/> {formData.status}
                </span>
                {formData.modelId && <span className="ff-preview-model-id">{formData.modelId}</span>}
              </div>
              <div className="ff-preview-info-grid">
                <div className="ff-preview-info-item">
                  <span className="ff-dim-title">Dimensions</span>
                  <span className="ff-dim-value">
                    {Number(formData.width||0).toFixed(2)}m × {Number(formData.depth||0).toFixed(2)}m × {Number(formData.height||0).toFixed(2)}m
                  </span>
                </div>
                <div className="ff-preview-info-item">
                  <span className="ff-dim-title">Scale</span>
                  <span className="ff-dim-value">
                    {Number(formData.scaleX||0).toFixed(2)} × {Number(formData.scaleY||0).toFixed(2)} × {Number(formData.scaleZ||0).toFixed(2)}
                  </span>
                </div>
                <div className="ff-preview-info-item">
                  <span className="ff-dim-title">3D Tint</span>
                  <span className="ff-preview-color-value">
                    <span className="ff-preview-color-dot" style={{ backgroundColor: activePreviewColor }}/>
                    {activePreviewColor}
                  </span>
                </div>
                <div className="ff-preview-info-item">
                  <span className="ff-dim-title">Shading</span>
                  <span className="ff-dim-value">{formData.shading ? 'Realistic' : 'Flat (Unlit)'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="ff-modal-overlay" onClick={e => { if (e.target === e.currentTarget && !isDeleting) setShowDeleteModal(false); }}>
          <div className="ff-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Delete Furniture Asset?</h3>
            <p>This action cannot be undone.</p>
            <div className="ff-modal-actions">
              <button type="button" className="ff-btn text" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</button>
              <button type="button" className="ff-btn outline-danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ColorPickerModal
        isOpen={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onSelectColor={handleColorPicked}
        title="Pick Furniture Color"
      />
    </div>
  );
};

export default FurnitureForm;