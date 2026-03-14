import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ACESFilmicToneMapping } from 'three';
import { listPublishedFurniture, resolveAssetUrl } from '../services/customerApi';
import { useCart } from '../contexts/CartContext';
import '../styles/FurnitureDetail.css';

// ── Icon helpers 
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill="currentColor"/>
    <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="currentColor"/>
    <path d="M1 1H5L7.68 14.39C7.77 14.85 8.02 15.26 8.39 15.56C8.75 15.85 9.21 16.01 9.68 16H19.4C19.87 16.01 20.33 15.85 20.69 15.56C21.06 15.26 21.31 14.85 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M21 16V8C21 7.65 20.91 7.31 20.73 7.01C20.56 6.7 20.3 6.45 20 6.28L13 2.28C12.7 2.1 12.35 2.01 12 2.01C11.65 2.01 11.3 2.1 11 2.28L4 6.28C3.7 6.45 3.44 6.7 3.27 7.01C3.09 7.31 3 7.65 3 8V16C3 16.35 3.09 16.69 3.27 16.99C3.44 17.3 3.7 17.55 4 17.72L11 21.72C11.3 21.9 11.65 21.99 12 21.99C12.35 21.99 12.7 21.9 13 21.72L20 17.72C20.3 17.55 20.56 17.3 20.73 16.99C20.91 16.69 21 16.35 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Icon3D = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
);
const Icon2D = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
);
const RotateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

// ── Fallback sofa SVG 
const SofaPlaceholder = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    height:'100%', color:'#C8B89A', gap:'12px' }}>
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="20" height="11" rx="2"/>
      <path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/>
      <path d="M2 15h20"/>
    </svg>
    <span style={{ fontSize:'0.85rem' }}>No image available</span>
  </div>
);

const applyTint = (obj, hexColor) => {
  if (!obj) return;
  obj.traverse(n => {
    if (!n?.isMesh || !n.material) return;
    const apply = (mat) => {
      if (!mat || typeof mat.clone !== 'function') return mat;
      const m = mat.clone();
      if (hexColor && m?.color?.set) m.color.set(hexColor);
      m.needsUpdate = true;
      return m;
    };
    n.material = Array.isArray(n.material) ? n.material.map(apply) : apply(n.material);
  });
};

// ── 3D model scene component 
const FurnitureScene = ({ modelUrl, tintColor }) => {
  const [scene, setScene] = useState(null);
  const baseRef = useRef(null);

  useEffect(() => {
    if (!modelUrl) { setScene(null); return; }
    const loader = new GLTFLoader();
    loader.load(resolveAssetUrl(modelUrl), gltf => {
      const sc  = gltf.scene.clone(true);
      const box = new THREE.Box3().setFromObject(sc);
      const sz  = box.getSize(new THREE.Vector3());
      // Fit to ~1.8 unit tall
      const s   = 1.8 / Math.max(sz.x, sz.y, sz.z, 0.001);
      sc.scale.setScalar(s);
      const b2 = new THREE.Box3().setFromObject(sc);
      const c2 = b2.getCenter(new THREE.Vector3());
      sc.position.set(-c2.x, -b2.min.y, -c2.z);
      sc.traverse(n => { if (n?.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
      baseRef.current = sc;
      applyTint(sc, tintColor);
      setScene(sc.clone(true));
    }, undefined, err => { console.warn('3D load failed', err); setScene(null); });
    return () => { baseRef.current = null; };
  }, [modelUrl]);

  useEffect(() => {
    if (!baseRef.current) return;
    applyTint(baseRef.current, tintColor);
    setScene(baseRef.current.clone(true));
  }, [tintColor]);

  if (!scene) return (
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1.2, 1, 0.8]}/>
      <meshStandardMaterial color={tintColor || '#D4B896'} roughness={0.6} metalness={0.1}/>
    </mesh>
  );
  return <primitive object={scene}/>;
};

// ── Main component 
const FurnitureDetail = () => {
  const navigate      = useNavigate();
  const { id }        = useParams();
  const { addToCart } = useCart();

  const [furniture,     setFurniture]     = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [quantity,      setQuantity]      = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);   
  const [viewMode,      setViewMode]      = useState('3D'); // '3D' | '2D'

  // Fetch by ID via public endpoint
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    listPublishedFurniture({ limit: 1000 })
      .then(res => {
        const item = (res.data || []).find(f => f._id === id);
        setFurniture(item || null);
        setSelectedColor(0);
      })
      .catch(err => { console.error(err); setFurniture(null); })
      .finally(() => setLoading(false));
  }, [id]);

  const activeColor = furniture?.colors?.[selectedColor] || null;
  const has3D       = Boolean(furniture?.model3D?.fileUrl);
  const has2D       = Boolean(furniture?.image2DUrl);

  // Switch to 2D automatically if no 3D model
  useEffect(() => {
    if (furniture && !has3D) setViewMode('2D');
    else if (furniture && has3D) setViewMode('3D');
  }, [furniture, has3D]);

  if (loading) return (
    <div className="cd-page-container">
      <div className="cd-inner-wrapper" style={{ textAlign:'center', padding:'4rem' }}>
        <p>Loading furniture details…</p>
      </div>
    </div>
  );

  if (!furniture) return (
    <div className="cd-page-container">
      <div className="cd-inner-wrapper" style={{ textAlign:'center', padding:'4rem' }}>
        <p>Furniture not found.</p>
        <button className="cd-btn-primary" onClick={() => navigate('/furniture')} style={{ marginTop:'1rem' }}>
          Back to Catalog
        </button>
      </div>
    </div>
  );

  const dims = furniture.dimensions
    ? `${furniture.dimensions.width}m × ${furniture.dimensions.depth}m × ${furniture.dimensions.height}m`
    : 'N/A';

  return (
    <div className="cd-page-container">
      <div className="cd-inner-wrapper">

        {/* Back */}
        <button className="cd-back-btn" onClick={() => navigate('/furniture')}>
          <div className="cd-back-icon-circle"><ArrowLeftIcon/></div>
          <span>Back to Furniture Catalog</span>
        </button>

        <div className="cd-split-layout">

          {/* ── LEFT: viewer ── */}
          <div className="cd-gallery-section">

            {/* 2D / 3D toggle — only show if both exist */}
            {has3D && (
              <div className="cd-view-toggle">
                <button
                  className={`cd-view-btn ${viewMode === '3D' ? 'active' : ''}`}
                  onClick={() => setViewMode('3D')}
                >
                  <Icon3D/> 3D View
                </button>
                <button
                  className={`cd-view-btn ${viewMode === '2D' ? 'active' : ''}`}
                  onClick={() => setViewMode('2D')}
                >
                  <Icon2D/> 2D View
                </button>
              </div>
            )}

            {/* Main display box */}
            <div className="cd-main-image-box">
              {viewMode === '3D' && has3D ? (
                <div style={{ width:'100%', height:'100%', position:'relative' }}>
                  <Canvas
                    shadows
                    camera={{ position:[0, 1.4, 3.2], fov:42 }}
                    gl={{ antialias:true, toneMapping:ACESFilmicToneMapping, toneMappingExposure:1.1 }}
                    style={{ borderRadius:'8px' }}
                  >
                    <ambientLight intensity={0.3}/>
                    <hemisphereLight intensity={0.5} color="#fff7ef" groundColor="#9fa3aa"/>
                    <directionalLight castShadow intensity={1.6} color="#fff8ec"
                      position={[3, 5, 4]}
                      shadow-mapSize-width={1024} shadow-mapSize-height={1024}
                      shadow-camera-near={0.5} shadow-camera-far={30}
                      shadow-camera-left={-4} shadow-camera-right={4}
                      shadow-camera-top={4} shadow-camera-bottom={-4}
                      shadow-bias={-0.0002}/>
                    <directionalLight intensity={0.4} color="#cad9ff" position={[-3, 2, -3]}/>
                    <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={6} blur={2.5} far={2} resolution={512}/>
                    <FurnitureScene modelUrl={furniture.model3D.fileUrl} tintColor={activeColor}/>
                    <OrbitControls
                      enablePan={false}
                      minPolarAngle={0}
                      maxPolarAngle={Math.PI / 2.05}
                      target={[0, 0.6, 0]}
                      autoRotate={false}
                    />
                    <Environment preset="apartment" intensity={0.4}/>
                  </Canvas>

                  {/* Hint label */}
                  <div className="cd-3d-hint">
                    <RotateIcon/> Drag to rotate · Scroll to zoom
                  </div>
                </div>
              ) : (
                /* 2D image */
                has2D ? (
                  <img
                    src={resolveAssetUrl(furniture.image2DUrl)}
                    alt={furniture.name}
                    style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:'6px' }}
                    onError={e => { e.target.style.display='none'; }}
                  />
                ) : (
                  <SofaPlaceholder/>
                )
              )}
            </div>

            {/* Thumbnail row */}
            <div className="cd-thumbnail-row">
              {has3D && (
                <button
                  className={`cd-thumbnail ${viewMode === '3D' ? 'active' : ''}`}
                  onClick={() => setViewMode('3D')}
                  title="3D View"
                >
                  <div className="cd-thumb-3d-label"><Icon3D/>3D</div>
                </button>
              )}
              {has2D && (
                <button
                  className={`cd-thumbnail ${viewMode === '2D' ? 'active' : ''}`}
                  onClick={() => setViewMode('2D')}
                  title="2D Image"
                >
                  <img
                    src={resolveAssetUrl(furniture.image2DUrl)}
                    alt="2D"
                    style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'6px' }}
                    onError={e => e.target.style.display='none'}
                  />
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: details ── */}
          <div className="cd-details-section">
            <div className="cd-category-tag">{furniture.category}</div>
            <h1 className="cd-title">{furniture.name}</h1>
            <p className="cd-description">{furniture.description || 'No description available.'}</p>

            {/* Specs */}
            <div className="cd-specs-row">
              <div className="cd-spec-box">
                <span className="cd-spec-label">Dimensions</span>
                <span className="cd-spec-value">{dims}</span>
              </div>
              <div className="cd-spec-box">
                <span className="cd-spec-label">Category</span>
                <span className="cd-spec-value">{furniture.category}</span>
              </div>
              <div className="cd-spec-box">
                <span className="cd-spec-label">Price</span>
                <span className="cd-spec-value">LKR {furniture.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Colors */}
            {furniture.colors?.length > 0 && (
              <div className="cd-color-section">
                <div className="cd-color-header">
                  <span className="cd-section-label">Color</span>
                  {activeColor && (
                    <span className="cd-color-name" style={{ color: activeColor }}>
                      {activeColor}
                    </span>
                  )}
                </div>
                <div className="cd-color-options">
                  {furniture.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`cd-color-swatch ${selectedColor === idx ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(idx)}
                      title={color}
                      aria-label={`Select colour ${color}`}
                    />
                  ))}
                </div>
                {viewMode === '3D' && has3D && (
                  <p className="cd-color-hint">
                    Color preview updates live in the 3D viewer above.
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="cd-quantity-picker">
              <button className="cd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <input type="number" className="cd-qty-input" value={quantity} readOnly/>
              <button className="cd-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            {/* Actions */}
            <div className="cd-action-buttons">
              <button
                className="cd-btn-primary"
                onClick={() => addToCart(furniture, quantity, activeColor)}
              >
                <CartIcon/> Add to Cart
              </button>
              <button className="cd-btn-secondary" onClick={() => navigate('/room')}>
                <CubeIcon/> View in Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FurnitureDetail;