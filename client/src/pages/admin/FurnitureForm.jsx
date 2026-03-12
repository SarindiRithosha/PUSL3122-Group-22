import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ACESFilmicToneMapping, Box3, MeshBasicMaterial, Vector3 } from 'three';
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

const FileIcon = ({ color = '#DE8B47' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 2V9H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BoxIcon = ({ color = '#DE8B47' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30691 20.7315 7.00511C20.556 6.70331 20.3031 6.4521 20 6.276L13 2.276C12.6953 2.09886 12.3508 2.00586 12 2.00586C11.6492 2.00586 11.3047 2.09886 11 2.276L4 6.276C3.6969 6.4521 3.44403 6.70331 3.26846 7.00511C3.09289 7.30691 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09289 16.6931 3.26846 16.9949C3.44403 17.2967 3.6969 17.5479 4 17.724L11 21.724C11.3047 21.9011 11.6492 21.9941 12 21.9941C12.3508 21.9941 12.6953 21.9011 13 21.724L20 17.724C20.3031 17.5479 20.556 17.2967 20.7315 16.9949C20.9071 16.6931 20.9996 16.3507 21 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 22.08V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const PlusCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const buildNormalizedModel = (sourceObject) => {
  const root = sourceObject.clone(true);
  root.updateMatrixWorld(true);

  const fittedBox = new Box3().setFromObject(root);
  if (fittedBox.isEmpty()) {
    return {
      object: root,
      fitScale: 1,
    };
  }

  const center = fittedBox.getCenter(new Vector3());
  const size = fittedBox.getSize(new Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 1e-6);

  root.position.sub(center);
  root.updateMatrixWorld(true);

  return {
    object: root,
    fitScale: 1.35 / maxDimension,
  };
};

const createPreviewMaterial = (sourceMaterial, tintColor, shadingEnabled) => {
  if (!sourceMaterial || typeof sourceMaterial.clone !== 'function') {
    return sourceMaterial;
  }

  const clonedMaterial = sourceMaterial.clone();

  if (shadingEnabled) {
    if (tintColor && clonedMaterial?.color?.set) {
      clonedMaterial.color.set(tintColor);
    }
    clonedMaterial.needsUpdate = true;
    return clonedMaterial;
  }

  const unlitMaterial = new MeshBasicMaterial({
    color: clonedMaterial?.color?.clone?.() || undefined,
    map: clonedMaterial.map || null,
    transparent: Boolean(clonedMaterial.transparent),
    opacity: Number.isFinite(clonedMaterial.opacity)
      ? clonedMaterial.opacity
      : 1,
    side: clonedMaterial.side,
  });

  if (tintColor && unlitMaterial?.color?.set) {
    unlitMaterial.color.set(tintColor);
  }

  unlitMaterial.needsUpdate = true;
  return unlitMaterial;
};

const applyPreviewMaterialToObject = (rootObject, tintColor, shadingEnabled) => {
  if (!rootObject) {
    return;
  }

  rootObject.traverse((node) => {
    if (!node?.isMesh || !node.material) {
      return;
    }

    // Improve model depth cues and allow renderer shadows on all meshes.
    node.castShadow = Boolean(shadingEnabled);
    node.receiveShadow = Boolean(shadingEnabled);
    if (
      shadingEnabled &&
      node.geometry &&
      !node.geometry.attributes?.normal &&
      typeof node.geometry.computeVertexNormals === 'function'
    ) {
      node.geometry.computeVertexNormals();
    }

    node.material = Array.isArray(node.material)
      ? node.material.map((material) =>
          createPreviewMaterial(material, tintColor, shadingEnabled)
        )
      : createPreviewMaterial(node.material, tintColor, shadingEnabled);
  });
};

const GltfModel = ({ modelUrl, scale, tintColor, shadingEnabled }) => {
  const { scene } = useGLTF(modelUrl);
  const normalizedModel = useMemo(() => {
    const normalized = buildNormalizedModel(scene);
    applyPreviewMaterialToObject(
      normalized.object,
      tintColor,
      shadingEnabled
    );
    return normalized;
  }, [scene, shadingEnabled, tintColor]);

  return (
    <primitive
      object={normalizedModel.object}
      scale={[
        normalizedModel.fitScale * scale[0],
        normalizedModel.fitScale * scale[1],
        normalizedModel.fitScale * scale[2],
      ]}
    />
  );
};

const ObjModel = ({ modelUrl, scale, tintColor, shadingEnabled }) => {
  const object = useLoader(OBJLoader, modelUrl);
  const normalizedModel = useMemo(() => {
    const normalized = buildNormalizedModel(object);
    applyPreviewMaterialToObject(
      normalized.object,
      tintColor,
      shadingEnabled
    );
    return normalized;
  }, [object, shadingEnabled, tintColor]);

  return (
    <primitive
      object={normalizedModel.object}
      scale={[
        normalizedModel.fitScale * scale[0],
        normalizedModel.fitScale * scale[1],
        normalizedModel.fitScale * scale[2],
      ]}
    />
  );
};

const supportedModelFormats = new Set(['glb', 'gltf', 'obj']);

const getFileExtension = (value = '') => {
  const sanitized = String(value).split('?')[0].split('#')[0];
  const lastDotIndex = sanitized.lastIndexOf('.');
  if (lastDotIndex < 0) {
    return '';
  }
  return sanitized.slice(lastDotIndex + 1).toLowerCase();
};

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

const toNumberOr = (value, fallback) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
};

const FurnitureForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const imageFileInputRef = useRef(null);
  const modelFileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormState);
  const [activePreviewColor, setActivePreviewColor] = useState(
    initialFormState.colors[0] || '#FFFFFF'
  );
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selected2DFile, setSelected2DFile] = useState('');
  const [selected3DFile, setSelected3DFile] = useState('');
  const [selected2DFileObj, setSelected2DFileObj] = useState(null);
  const [selected3DFileObj, setSelected3DFileObj] = useState(null);
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState('');
  const [localModelPreviewUrl, setLocalModelPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    return () => {
      if (localImagePreviewUrl) {
        URL.revokeObjectURL(localImagePreviewUrl);
      }
    };
  }, [localImagePreviewUrl]);

  useEffect(() => {
    return () => {
      if (localModelPreviewUrl) {
        URL.revokeObjectURL(localModelPreviewUrl);
      }
    };
  }, [localModelPreviewUrl]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let active = true;

    const loadFurniture = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await getFurnitureById(id);
        const furniture = response.data;

        if (!active) {
          return;
        }

        const scale = furniture?.model3D?.scale || {};
        const scaleX = String(scale.x ?? 1);
        const scaleY = String(scale.y ?? 1);
        const scaleZ = String(scale.z ?? 1);

        setFormData({
          modelId: furniture.modelId || '',
          name: furniture.name || '',
          category: furniture.category || '',
          price: String(furniture.price ?? ''),
          description: furniture.description || '',
          colors: Array.isArray(furniture.colors) && furniture.colors.length > 0 ? furniture.colors : ['#3F5C75'],
          width: String(furniture?.dimensions?.width ?? 1),
          depth: String(furniture?.dimensions?.depth ?? 1),
          height: String(furniture?.dimensions?.height ?? 1),
          shading: Boolean(furniture.shading),
          previewMode: furniture.previewMode || '3D',
          status: furniture.status || 'Draft',
          image2DUrl: furniture.image2DUrl || '',
          model3DUrl: furniture?.model3D?.fileUrl || '',
          modelFormat: furniture?.model3D?.format || getFileExtension(furniture?.model3D?.fileUrl) || 'glb',
          scaleX,
          scaleY,
          scaleZ,
          uniformScale: scaleX === scaleY && scaleY === scaleZ,
        });
        setActivePreviewColor(
          Array.isArray(furniture.colors) && furniture.colors.length > 0
            ? furniture.colors[0]
            : '#FFFFFF'
        );

        setSelected2DFile((furniture.image2DUrl || '').split('/').pop() || '');
        setSelected3DFile((furniture?.model3D?.fileUrl || '').split('/').pop() || '');
        setSelected2DFileObj(null);
        setSelected3DFileObj(null);
        setLocalImagePreviewUrl('');
        setLocalModelPreviewUrl('');
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || 'Failed to load furniture item.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadFurniture();

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  useEffect(() => {
    if (!Array.isArray(formData.colors) || formData.colors.length === 0) {
      setActivePreviewColor('#FFFFFF');
      return;
    }

    if (!formData.colors.includes(activePreviewColor)) {
      setActivePreviewColor(formData.colors[0]);
    }
  }, [activePreviewColor, formData.colors]);

  useEffect(() => {
    if (!showDeleteModal) {
      return undefined;
    }

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setShowDeleteModal(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [showDeleteModal]);

  const categoryOptions = useMemo(() => {
    const defaults = ['Seating', 'Tables', 'Beds', 'Storage', 'Decor'];
    if (formData.category && !defaults.includes(formData.category)) {
      return [formData.category, ...defaults];
    }
    return defaults;
  }, [formData.category]);

  const previewImageSrc = localImagePreviewUrl || resolveAssetUrl(formData.image2DUrl);
  const previewModelSrc = localModelPreviewUrl || resolveAssetUrl(formData.model3DUrl);
  const effectiveModelFormat = (formData.modelFormat || getFileExtension(previewModelSrc)).toLowerCase();
  const canRenderModel = Boolean(previewModelSrc) && supportedModelFormats.has(effectiveModelFormat);
  const modelScale = [
    toNumberOr(formData.scaleX, 1),
    toNumberOr(formData.scaleY, 1),
    toNumberOr(formData.scaleZ, 1),
  ];
  const maxPreviewScale = Math.max(...modelScale, 1);
  const previewGroundY = -0.68 * maxPreviewScale;
  const previewShadowScale = 5.4 * maxPreviewScale;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleScaleInputChange = (axis, value) => {
    setFormData((prev) => {
      if (prev.uniformScale) {
        return {
          ...prev,
          scaleX: value,
          scaleY: value,
          scaleZ: value,
        };
      }

      return {
        ...prev,
        [axis]: value,
      };
    });
  };

  const handleUniformScaleToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      uniformScale: checked,
      scaleY: checked ? prev.scaleX : prev.scaleY,
      scaleZ: checked ? prev.scaleX : prev.scaleZ,
    }));
  };

  const setPresetScale = (value) => {
    const nextValue = String(value);
    setFormData((prev) => ({
      ...prev,
      scaleX: nextValue,
      scaleY: nextValue,
      scaleZ: nextValue,
      uniformScale: true,
    }));
  };

  const handleColorPicked = (hex) => {
    const upperHex = hex.toUpperCase();

    if (formData.colors.includes(upperHex)) {
      setErrorMessage('Color already exists in the list.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, upperHex],
    }));
    setActivePreviewColor(upperHex);
    setErrorMessage('');
  };

  const removeColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((item) => item !== color),
    }));
  };

  const handleModelFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    setSelected3DFile(file.name);
    setSelected3DFileObj(file);
    setFormData((prev) => ({
      ...prev,
      modelFormat: extension,
    }));

    setLocalModelPreviewUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelected2DFile(file.name);
    setSelected2DFileObj(file);

    setLocalImagePreviewUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return URL.createObjectURL(file);
    });
  };

  const onDropFiles = (event) => {
    event.preventDefault();

    const files = Array.from(event.dataTransfer.files || []);
    files.forEach((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const imageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
      const modelExtensions = ['glb', 'gltf', 'obj', 'fbx'];

      if (imageExtensions.includes(extension)) {
        setSelected2DFile(file.name);
        setSelected2DFileObj(file);
        setLocalImagePreviewUrl((prevUrl) => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return URL.createObjectURL(file);
        });
      }

      if (modelExtensions.includes(extension)) {
        setSelected3DFile(file.name);
        setSelected3DFileObj(file);
        setFormData((prev) => ({
          ...prev,
          modelFormat: extension,
        }));
        setLocalModelPreviewUrl((prevUrl) => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return URL.createObjectURL(file);
        });
      }
    });
  };

  const validateForm = () => {
    if (!formData.modelId.trim()) {
      return 'Model ID is required.';
    }
    if (!formData.name.trim()) {
      return 'Asset Name is required.';
    }
    if (!formData.category.trim()) {
      return 'Category is required.';
    }
    if (!toNumberOr(formData.price, 0)) {
      return 'Price must be greater than 0.';
    }
    if (!toNumberOr(formData.width, 0) || !toNumberOr(formData.depth, 0) || !toNumberOr(formData.height, 0)) {
      return 'All dimensions must be greater than 0.';
    }
    if (!toNumberOr(formData.scaleX, 0) || !toNumberOr(formData.scaleY, 0) || !toNumberOr(formData.scaleZ, 0)) {
      return 'Scale values must be greater than 0.';
    }

    return '';
  };

  const buildPayload = (overrides = {}) => ({
    modelId: formData.modelId.trim().toUpperCase(),
    name: formData.name.trim(),
    category: formData.category.trim(),
    price: Number(formData.price),
    description: formData.description.trim(),
    colors: formData.colors,
    dimensions: {
      width: Number(formData.width),
      depth: Number(formData.depth),
      height: Number(formData.height),
    },
    shading: formData.shading,
    previewMode: formData.previewMode,
    status: formData.status,
    image2DUrl: overrides.image2DUrl ?? formData.image2DUrl.trim(),
    model3D: {
      fileUrl: overrides.model3DUrl ?? formData.model3DUrl.trim(),
      format: overrides.modelFormat ?? formData.modelFormat.trim().toLowerCase(),
      scale: {
        x: Number(formData.scaleX),
        y: Number(formData.scaleY),
        z: Number(formData.scaleZ),
      },
    },
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

      let image2DUrl = formData.image2DUrl.trim();
      let model3DUrl = formData.model3DUrl.trim();
      let modelFormat = formData.modelFormat.trim().toLowerCase();

      if (selected2DFileObj) {
        const imageUploadResponse = await uploadFurnitureAsset('image', selected2DFileObj);
        image2DUrl = imageUploadResponse?.data?.url || image2DUrl;
      }

      if (selected3DFileObj) {
        const modelUploadResponse = await uploadFurnitureAsset('model', selected3DFileObj);
        model3DUrl = modelUploadResponse?.data?.url || model3DUrl;
        modelFormat = getFileExtension(model3DUrl) || modelFormat;
      }

      const payload = buildPayload({
        image2DUrl,
        model3DUrl,
        modelFormat,
      });

      if (isEditMode) {
        await updateFurniture(id, payload);
        await updateFurnitureScale(id, {
          x: payload.model3D.scale.x,
          y: payload.model3D.scale.y,
          z: payload.model3D.scale.z,
        });
        setSuccessMessage('Furniture updated successfully.');
      } else {
        await createFurniture(payload);
        setSuccessMessage('Furniture created successfully.');
      }

      setFormData((prev) => ({
        ...prev,
        image2DUrl,
        model3DUrl,
        modelFormat,
      }));
      setSelected2DFileObj(null);
      setSelected3DFileObj(null);
      setLocalImagePreviewUrl('');
      setLocalModelPreviewUrl('');

      setTimeout(() => {
        navigate('/admin/furniture-management');
      }, 700);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save furniture asset.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) {
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage('');
      await deleteFurniture(id);
      navigate('/admin/furniture-management');
    } catch (error) {
      setErrorMessage(error.message || 'Delete failed.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="ff-container">
      <button
        type="button"
        className="ff-back-btn"
        onClick={() => navigate('/admin/furniture-management')}
      >
        <LeftArrowIcon />
        Back to Furniture Catalog
      </button>

      {errorMessage && <div className="ff-alert ff-alert-error">{errorMessage}</div>}
      {successMessage && <div className="ff-alert ff-alert-success">{successMessage}</div>}

      {isLoading ? (
        <div className="ff-loading">Loading furniture details...</div>
      ) : (
        <div className="ff-split-layout">
          <div className="ff-form-card">
            <h2 className="ff-title">
              {isEditMode ? 'Edit Furniture Asset' : 'Add New Furniture Asset'}
            </h2>

            <div className="ff-row">
              <div className="ff-form-group flex-1">
                <label>Model ID <span>*</span></label>
                <input
                  type="text"
                  name="modelId"
                  placeholder="e.g., F-CH-001"
                  value={formData.modelId}
                  onChange={handleChange}
                />
              </div>
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
            </div>

            <div className="ff-row">
              <div className="ff-form-group flex-1">
                <label>Category <span>*</span></label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="" disabled>Select Category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
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
              <label>Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="ff-form-group ff-palette-section">
              <label>Available Material Colors</label>
              <p className="ff-subtext">Define default color swatches for this asset.</p>

              <div className="ff-palette-group">
                <div className="ff-palette-label">
                  <PaletteIcon />
                  <span>Furniture Colors</span>
                </div>
                <div className="ff-palette-content">
                  <div className="ff-swatches-row">
                    {formData.colors.map((color) => (
                      <div key={color} className="ff-swatch-wrap">
                        <button
                          type="button"
                          className={`ff-color-swatch-circle ${activePreviewColor === color ? 'active' : ''}`}
                          style={{ backgroundColor: color }}
                          title={`Use ${color} for 3D preview`}
                          onClick={() => setActivePreviewColor(color)}
                        />
                        <span
                          className="ff-swatch-remove"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeColor(color);
                          }}
                        >
                          <RemoveSwatchIcon />
                        </span>
                        <span className="ff-swatch-hex">{color}</span>
                      </div>
                    ))}
                    <button type="button" className="ff-pick-color-btn" onClick={() => setColorPickerOpen(true)}>
                      <PlusCircleIcon />
                      <span>Pick Color</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="ff-form-group">
              <label>Default Dimensions (m)</label>
              <div className="ff-row">
                <div className="ff-form-group flex-1 margin-0">
                  <span className="ff-dim-label">Width</span>
                  <input type="number" name="width" min="0.1" step="0.1" value={formData.width} onChange={handleChange} />
                </div>
                <div className="ff-form-group flex-1 margin-0">
                  <span className="ff-dim-label">Depth</span>
                  <input type="number" name="depth" min="0.1" step="0.1" value={formData.depth} onChange={handleChange} />
                </div>
                <div className="ff-form-group flex-1 margin-0">
                  <span className="ff-dim-label">Height</span>
                  <input type="number" name="height" min="0.1" step="0.1" value={formData.height} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="ff-form-group">
              <label>3D Model Scale</label>
              <p className="ff-subtext">Control scale factors sent to the 3D renderer (X, Y, Z).</p>

              <label className="ff-inline-check">
                <input
                  type="checkbox"
                  checked={formData.uniformScale}
                  onChange={(event) => handleUniformScaleToggle(event.target.checked)}
                />
                Keep X/Y/Z uniform
              </label>

              <div className="ff-row">
                <div className="ff-form-group flex-1 margin-0">
                  <span className="ff-dim-label">Scale X</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.scaleX}
                    onChange={(event) => handleScaleInputChange('scaleX', event.target.value)}
                  />
                </div>
                <div className="ff-form-group flex-1 margin-0">
                  <span className="ff-dim-label">Scale Y</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.scaleY}
                    onChange={(event) => handleScaleInputChange('scaleY', event.target.value)}
                    disabled={formData.uniformScale}
                  />
                </div>
                <div className="ff-form-group flex-1 margin-0">
                  <span className="ff-dim-label">Scale Z</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.scaleZ}
                    onChange={(event) => handleScaleInputChange('scaleZ', event.target.value)}
                    disabled={formData.uniformScale}
                  />
                </div>
              </div>

              <div className="ff-scale-presets">
                {[0.5, 1, 1.5, 2].map((value) => (
                  <button type="button" key={value} className="ff-scale-chip" onClick={() => setPresetScale(value)}>
                    {value}x
                  </button>
                ))}
              </div>
            </div>

            <div className="ff-form-group">
              <label>Asset Files</label>
              <p className="ff-subtext">File picker opens only when selecting these buttons.</p>

              <input
                ref={imageFileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleImageFileChange}
                className="ff-hidden-file"
              />
              <input
                ref={modelFileInputRef}
                type="file"
                accept=".glb,.gltf,.obj,.fbx"
                onChange={handleModelFileChange}
                className="ff-hidden-file"
              />

              <div
                className="ff-drag-drop-area"
                onDragOver={(event) => event.preventDefault()}
                onDrop={onDropFiles}
              >
                <UploadIcon />
                <p><strong>Drop files here (optional)</strong></p>
                <p className="ff-subtext">PNG/JPG for 2D preview, GLB/GLTF/OBJ/FBX for model path.</p>

                <div className="ff-file-picker-actions">
                  <button
                    type="button"
                    className="ff-btn primary small"
                    onClick={() => imageFileInputRef.current?.click()}
                  >
                    Select 2D File
                  </button>
                  <button
                    type="button"
                    className="ff-btn primary small"
                    onClick={() => modelFileInputRef.current?.click()}
                  >
                    Select 3D File
                  </button>
                </div>
              </div>

              <div className="ff-row">
                <div className="ff-file-replace-card flex-1">
                  <div className="ff-file-icon-box green">
                    <FileIcon color="#4CAF50" />
                  </div>
                  <div className="ff-file-info">
                    <span className="ff-file-name">{selected2DFile || 'No 2D file selected'}</span>
                    <span className="ff-file-action green">
                      {selected2DFileObj
                        ? 'Selected (save to upload)'
                        : formData.image2DUrl
                          ? 'Image ready'
                          : 'Select and save to upload'}
                    </span>
                  </div>
                </div>
                <div className="ff-file-replace-card flex-1">
                  <div className="ff-file-icon-box orange">
                    <BoxIcon color="#DE8B47" />
                  </div>
                  <div className="ff-file-info">
                    <span className="ff-file-name">{selected3DFile || 'No 3D file selected'}</span>
                    <span className="ff-file-action orange">
                      {selected3DFileObj
                        ? 'Selected (save to upload)'
                        : formData.model3DUrl
                          ? 'Model ready'
                          : 'Select and save to upload'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ff-toggle-row">
              <div className="ff-toggle-text">
                <label>Allow 3D Shading</label>
                <p className="ff-subtext">Enable dynamic shading in the 3D renderer.</p>
              </div>
              <label className="ff-switch">
                <input type="checkbox" name="shading" checked={formData.shading} onChange={handleChange} />
                <span className="ff-slider round" />
              </label>
            </div>

            <div className="ff-form-footer">
              {!isEditMode && <span className="ff-required-note">* Required fields</span>}
              {isEditMode && (
                <button type="button" className="ff-btn outline-danger" onClick={() => setShowDeleteModal(true)}>
                  Delete Asset
                </button>
              )}

              <div className="ff-footer-actions">
                <button type="button" className="ff-btn text" onClick={() => navigate('/admin/furniture-management')}>
                  Cancel
                </button>
                <button type="button" className="ff-btn primary" onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Furniture'}
                </button>
              </div>
            </div>
          </div>

          <div className="ff-preview-card">
            <div className="ff-preview-header">
              <div className="ff-preview-header-left">
                <span className="ff-preview-title">Preview</span>
                {formData.name && (
                  <span className="ff-preview-asset-name">{formData.name}</span>
                )}
              </div>
              <div className="ff-preview-toggle">
                <button
                  type="button"
                  className={formData.previewMode === '2D' ? 'active' : ''}
                  onClick={() => setFormData((prev) => ({ ...prev, previewMode: '2D' }))}
                >
                  2D
                </button>
                <button
                  type="button"
                  className={formData.previewMode === '3D' ? 'active' : ''}
                  onClick={() => setFormData((prev) => ({ ...prev, previewMode: '3D' }))}
                >
                  3D
                </button>
              </div>
            </div>

            <div className="ff-preview-content">
              {formData.previewMode === '2D' ? (
                previewImageSrc ? (
                  <img className="ff-preview-image-large" src={previewImageSrc} alt="2D preview" />
                ) : (
                  <div className="ff-preview-placeholder">
                    <div className="ff-preview-placeholder-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    No 2D image selected yet.
                  </div>
                )
              ) : canRenderModel ? (
                <ModelErrorBoundary
                  resetKey={`${previewModelSrc}-${modelScale.join('-')}-${activePreviewColor}-${formData.shading}`}
                  fallback={
                    <div className="ff-preview-placeholder">
                      <div className="ff-preview-placeholder-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      Failed to load model. Check URL/format.
                    </div>
                  }
                >
                  <div className="ff-preview-canvas-wrap">
                    <Canvas
                      key={`${previewModelSrc}-${effectiveModelFormat}-${modelScale.join('-')}-${activePreviewColor}-${formData.shading}`}
                      className="ff-preview-canvas"
                      shadows={formData.shading}
                      camera={{ position: [0.2, 1.2, -2.4], fov: 38, near: 0.01, far: 1000 }}
                      gl={{
                        antialias: true,
                        toneMapping: ACESFilmicToneMapping,
                        toneMappingExposure: 1.06,
                      }}
                    >
                      {formData.shading && (
                        <>
                          <ambientLight intensity={0.24} />
                          <hemisphereLight intensity={0.46} color="#fff7ef" groundColor="#9fa3aa" />
                          <directionalLight
                            castShadow
                            intensity={1.45}
                            color="#fff7ec"
                            position={[4.5, 6, 3.2]}
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                            shadow-camera-near={0.5}
                            shadow-camera-far={20}
                            shadow-camera-left={-5}
                            shadow-camera-right={5}
                            shadow-camera-top={5}
                            shadow-camera-bottom={-5}
                            shadow-bias={-0.00015}
                          />
                          <directionalLight intensity={0.55} color="#cad9ff" position={[-3.2, 2.8, -4]} />
                          <spotLight
                            castShadow
                            intensity={0.8}
                            color="#ffe4c3"
                            position={[0, 5.4, 2.2]}
                            angle={0.52}
                            penumbra={0.56}
                            distance={18}
                            shadow-mapSize-width={1024}
                            shadow-mapSize-height={1024}
                            shadow-bias={-0.0002}
                          />
                          <pointLight intensity={0.28} color="#9bb4ff" position={[0.9, 1.2, -2.8]} />
                          <Environment preset="apartment" intensity={0.36} />
                          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, previewGroundY, 0]} receiveShadow>
                            <planeGeometry args={[12, 12]} />
                            <shadowMaterial transparent opacity={0.22} />
                          </mesh>
                          <ContactShadows
                            position={[0, previewGroundY + 0.01, 0]}
                            opacity={0.52}
                            scale={previewShadowScale}
                            blur={2.3}
                            far={3.4}
                            resolution={1024}
                          />
                        </>
                      )}
                      <Suspense fallback={<Html center><div className="ff-canvas-loader">Loading model...</div></Html>}>
                        {effectiveModelFormat === 'obj' ? (
                          <ObjModel
                            modelUrl={previewModelSrc}
                            scale={modelScale}
                            tintColor={activePreviewColor}
                            shadingEnabled={formData.shading}
                          />
                        ) : (
                          <GltfModel
                            modelUrl={previewModelSrc}
                            scale={modelScale}
                            tintColor={activePreviewColor}
                            shadingEnabled={formData.shading}
                          />
                        )}
                      </Suspense>
                      <OrbitControls
                        makeDefault
                        target={[0, 0, 0]}
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
                    <p className="ff-canvas-hint">Drag to rotate. Right-click drag to pan. Scroll to zoom.</p>
                  </div>
                </ModelErrorBoundary>
              ) : (
                <div className="ff-preview-placeholder">
                  <div className="ff-preview-placeholder-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  {previewModelSrc
                    ? `3D preview supports .glb/.gltf/.obj. Current format: ${effectiveModelFormat || 'unknown'}`
                    : 'No 3D model selected yet.'}
                </div>
              )}
            </div>

            <div className="ff-preview-footer">
              <div className="ff-preview-status-row">
                <span className={`ff-preview-status-badge ${formData.status.toLowerCase()}`}>
                  <span className="ff-preview-status-dot" />
                  {formData.status}
                </span>
                {formData.modelId && (
                  <span className="ff-preview-model-id">{formData.modelId}</span>
                )}
              </div>
              <div className="ff-preview-info-grid">
                <div className="ff-preview-info-item">
                  <span className="ff-dim-title">Dimensions</span>
                  <span className="ff-dim-value">
                    {Number(formData.width || 0).toFixed(2)}m x {Number(formData.depth || 0).toFixed(2)}m x {Number(formData.height || 0).toFixed(2)}m
                  </span>
                </div>
                <div className="ff-preview-info-item">
                  <span className="ff-dim-title">Scale</span>
                  <span className="ff-dim-value">
                    {Number(formData.scaleX || 0).toFixed(2)} x {Number(formData.scaleY || 0).toFixed(2)} x {Number(formData.scaleZ || 0).toFixed(2)}
                  </span>
                </div>
                <div className="ff-preview-info-item">
                  <span className="ff-dim-title">3D Tint</span>
                  <span className="ff-preview-color-value">
                    <span className="ff-preview-color-dot" style={{ backgroundColor: activePreviewColor }} />
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

      {showDeleteModal && (
        <div className="ff-modal-overlay" onClick={(event) => {
          if (event.target === event.currentTarget && !isDeleting) {
            setShowDeleteModal(false);
          }
        }}>
          <div className="ff-modal-content" onClick={(event) => event.stopPropagation()}>
            <h3>Delete Furniture Asset?</h3>
            <p>This action cannot be undone.</p>
            <div className="ff-modal-actions">
              <button type="button" className="ff-btn text" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </button>
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
