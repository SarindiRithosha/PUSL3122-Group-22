import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ACESFilmicToneMapping } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader }  from 'three/examples/jsm/loaders/OBJLoader.js';
import {
  getPublishedRoom,
  listPublishedFurniture,
  resolveAssetUrl,
  createMyDesign,
  updateMyDesign,
  getMyDesignById,
  getPublishedDesign,
} from '../services/customerApi';
import { useCart } from '../contexts/CartContext';
import '../styles/CustomerWorkspace.css';

// ─── SVG Icon helpers 
const Svg = ({ children, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const UndoIcon    = () => <Svg><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></Svg>;
const RedoIcon    = () => <Svg><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></Svg>;
const ZoomInIcon  = () => <Svg><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></Svg>;
const ZoomOutIcon = () => <Svg><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></Svg>;
const SaveIcon    = () => <Svg><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></Svg>;
const RotateIcon  = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const TrashIcon   = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);

// ─── Canvas constants 
const CANVAS_ROOM_PX = 380;
const getPxPerMeter  = (w, l) => CANVAS_ROOM_PX / Math.max(w || 4, l || 4, 1);

const getRoomPoints = (shape, wM, lM, ppm) => {
  const w = wM * ppm, l = lM * ppm;
  if (shape === 'L-Shape') {
    const hw = w / 2, hl = l / 2;
    return [[0,0],[w,0],[w,hl],[hw,hl],[hw,l],[0,l]];
  }
  return [[0,0],[w,0],[w,l],[0,l]];
};

// ─── Collision detection (AABB, metres) 
const checkCollisions = (items, room) => {
  const hit = new Set();
  const RW = room?.dimensions?.width  || 4;
  const RL = room?.dimensions?.length || 4;
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    const ax = a.xM||0, ay = a.yM||0, aw = a.width||1, ad = a.depth||1;
    if (ax < 0 || ay < 0 || ax + aw > RW || ay + ad > RL) hit.add(a.id);
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j];
      const bx = b.xM||0, by = b.yM||0, bw = b.width||1, bd = b.depth||1;
      if (!(ax+aw<=bx || bx+bw<=ax || ay+ad<=by || by+bd<=ay)) {
        hit.add(a.id); hit.add(b.id);
      }
    }
  }
  return hit;
};

// 2D SVG CANVAS — unchanged
const Canvas2D = ({ room, placedItems, selectedId, onSelectItem, onMoveItem, onCanvasClick, zoom, collisions }) => {
  const svgRef     = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [rotating, setRotating] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const wM  = room?.dimensions?.width  || 4;
  const lM  = room?.dimensions?.length || 4;
  const ppm = getPxPerMeter(wM, lM);
  const rWpx = wM * ppm, rLpx = lM * ppm;
  const pad  = 60;
  const gc   = Math.min(rWpx, rLpx) / 16;

  const onMouseMove = useCallback((e) => {
    if (!svgRef.current) return;
    const rect  = svgRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    if (rotating) {
      const item = placedItems.find(i => i.id === rotating);
      if (!item) return;
      const iw = (item.width||1)*ppm, ih = (item.depth||1)*ppm;
      const cx = (item.xM||0)*ppm + pad + iw/2;
      const cy = (item.yM||0)*ppm + pad + ih/2;
      const mx = (e.clientX - rect.left) / scale;
      const my = (e.clientY - rect.top)  / scale;
      const angle = Math.atan2(my - cy, mx - cx) * (180/Math.PI) + 90;
      onMoveItem(rotating, item.xM, item.yM, Math.round(angle/15)*15);
      return;
    }
    if (!dragging) return;
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top)  / scale;
    const rx = (mx - dragOffset.current.x - pad) / ppm;
    const ry = (my - dragOffset.current.y - pad) / ppm;
    onMoveItem(dragging, Math.round(rx/0.25)*0.25, Math.round(ry/0.25)*0.25, null);
  }, [dragging, rotating, zoom, ppm, pad, placedItems, onMoveItem]);

  const onMouseUp = useCallback(() => { setDragging(null); setRotating(null); }, []);

  if (!room) return <div className="cw-canvas-empty"><p>Loading room…</p></div>;

  const { shape, wallColor, floorColor } = room;
  const pts = getRoomPoints(shape || 'Rectangular', wM, lM, ppm);
  const svgW = rWpx + pad*2, svgH = rLpx + pad*2;

  return (
    <div className="cw-canvas-2d-wrap"
      style={{ cursor: rotating ? 'crosshair' : dragging ? 'grabbing' : 'default' }}
      onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <svg ref={svgRef} width={svgW} height={svgH}
        style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top left' }}
        onClick={e =>
          (e.target === svgRef.current || e.target.classList.contains('cw-grid-bg'))
          && onCanvasClick?.()
        }>
        <defs>
          <pattern id="cw-grid" width={gc} height={gc} patternUnits="userSpaceOnUse" x={pad} y={pad}>
            <path d={`M ${gc} 0 L 0 0 0 ${gc}`} fill="none" stroke="#DDE1E7" strokeWidth="0.5"/>
          </pattern>
          <clipPath id="cw-clip">
            <polygon points={pts.map(p => `${p[0]+pad},${p[1]+pad}`).join(' ')}/>
          </clipPath>
        </defs>
        <rect width={svgW} height={svgH} fill="#EDEEF1" className="cw-grid-bg"/>
        <polygon points={pts.map(p => `${p[0]+pad},${p[1]+pad}`).join(' ')} fill={floorColor||'#F5F0E8'}/>
        <rect x={pad} y={pad} width={rWpx} height={rLpx} fill="url(#cw-grid)" clipPath="url(#cw-clip)"/>
        <polygon points={pts.map(p => `${p[0]+pad},${p[1]+pad}`).join(' ')}
          fill="none" stroke={wallColor||'#8B7355'} strokeWidth="5"/>
        <text x={pad+rWpx/2} y={pad-12} textAnchor="middle" fontSize="11"
          fill="#64748B" fontFamily="monospace" fontWeight="600">{wM.toFixed(1)}m</text>
        <text x={pad-14} y={pad+rLpx/2} textAnchor="middle" fontSize="11"
          fill="#64748B" fontFamily="monospace" fontWeight="600"
          transform={`rotate(-90,${pad-14},${pad+rLpx/2})`}>{lM.toFixed(1)}m</text>
        {placedItems.map(item => {
          const isSel  = item.id === selectedId;
          const isColl = collisions.has(item.id);
          const iw = (item.width||1)*ppm, ih = (item.depth||1)*ppm;
          const px = (item.xM||0)*ppm + pad, py = (item.yM||0)*ppm + pad;
          const cx = px+iw/2, cy = py+ih/2;
          return (
            <g key={item.id}
              transform={`translate(${cx},${cy}) rotate(${item.rotation||0}) translate(${-iw/2},${-ih/2})`}>
              <rect x={2} y={2} width={iw} height={ih} rx="3" fill="rgba(0,0,0,0.07)" style={{pointerEvents:'none'}}/>
              <rect width={iw} height={ih} rx="3"
                fill={item.activeColor||'#D4B896'}
                stroke={isColl ? '#EF4444' : isSel ? '#C8973A' : 'rgba(0,0,0,0.18)'}
                strokeWidth={isColl||isSel ? 2.5 : 1}
                style={{ cursor: 'grab' }}
                onMouseDown={e => {
                  e.preventDefault(); e.stopPropagation();
                  const r = svgRef.current.getBoundingClientRect();
                  const s = zoom/100;
                  dragOffset.current = {
                    x: (e.clientX - r.left)/s - (item.xM||0)*ppm - pad,
                    y: (e.clientY - r.top) /s - (item.yM||0)*ppm - pad,
                  };
                  setDragging(item.id); onSelectItem(item.id);
                }}
                onClick={e => { e.stopPropagation(); onSelectItem(item.id); }}
              />
              <text x={iw/2} y={ih/2} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fill="#3E2723" fontWeight="500" fontFamily="sans-serif"
                style={{ pointerEvents:'none', userSelect:'none' }}>
                {item.name.length > 14 ? item.name.slice(0,13) + '…' : item.name}
              </text>
              {isSel && (
                <>
                  {[[-4,-4],[iw-4,-4],[-4,ih-4],[iw-4,ih-4]].map(([hx,hy],i) => (
                    <rect key={i} x={hx} y={hy} width={8} height={8} rx="2"
                      fill="#C8973A" style={{pointerEvents:'none'}}/>
                  ))}
                  <line x1={iw/2} y1={0} x2={iw/2} y2={-14}
                    stroke="#C8973A" strokeWidth="1.5" style={{pointerEvents:'none'}}/>
                  <circle cx={iw/2} cy={-19} r={6} fill="#C8973A" style={{cursor:'alias'}}
                    onMouseDown={e => { e.preventDefault(); e.stopPropagation();
                      setRotating(item.id); onSelectItem(item.id); }}/>
                </>
              )}
              {isColl && (
                <text x={iw/2} y={ih+13} textAnchor="middle" fontSize="8"
                  fill="#EF4444" fontWeight="700" style={{pointerEvents:'none'}}>
                  ! Collision
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// 3D ROOM GEOMETRY — unchanged
const WALL_T = 0.12;

const WallSeg = ({ x, z, lenX, lenZ, H, wc }) => {
  const len  = lenX > 0 ? lenX : lenZ;
  const rotY = lenX > 0 ? 0 : Math.PI / 2;
  return (
    <mesh position={[x, H/2, z]} rotation={[0, rotY, 0]} castShadow receiveShadow>
      <boxGeometry args={[len, H, WALL_T]}/>
      <meshStandardMaterial color={wc} roughness={0.78} metalness={0.02}/>
    </mesh>
  );
};

const buildFloorBuffer = (isL, W, L) => {
  let positions, indices;
  if (isL) {
    positions = new Float32Array([-W/2,0,-L/2, W/2,0,-L/2, W/2,0,0, 0,0,0, 0,0,L/2, -W/2,0,L/2]);
    indices   = new Uint16Array([0,1,2, 0,2,3, 0,3,4, 0,4,5]);
  } else {
    positions = new Float32Array([-W/2,0,-L/2, W/2,0,-L/2, W/2,0,L/2, -W/2,0,L/2]);
    indices   = new Uint16Array([0,1,2, 0,2,3]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  geo.computeVertexNormals();
  return geo;
};

const RoomMesh3D = ({ room }) => {
  if (!room) return null;
  const { dimensions, shape, wallColor, floorColor, activeWallColor, activeFloorColor } = room;
  const W = dimensions?.width  || 4;
  const L = dimensions?.length || 4;
  const H = dimensions?.height || 2.8;
  const wc  = activeWallColor  || wallColor  || '#F5F5F0';
  const fc  = activeFloorColor || floorColor || '#C8A882';
  const isL = (shape || 'Rectangular') === 'L-Shape';
  const t   = WALL_T / 2;
  const floorGeo = useMemo(() => buildFloorBuffer(isL, W, L), [isL, W, L]);
  return (
    <group>
      <mesh receiveShadow>
        <primitive object={floorGeo} attach="geometry"/>
        <meshStandardMaterial color={fc} roughness={0.82} metalness={0.04} side={THREE.DoubleSide}/>
      </mesh>
      {isL ? (
        <>
          <WallSeg x={0}       z={-L/2+t}  lenX={W}   lenZ={0}   H={H} wc={wc}/>
          <WallSeg x={W/2-t}  z={-L/4}    lenX={0}   lenZ={L/2} H={H} wc={wc}/>
          <WallSeg x={W/4}    z={t}        lenX={W/2} lenZ={0}   H={H} wc={wc}/>
          <WallSeg x={-t}     z={L/4}      lenX={0}   lenZ={L/2} H={H} wc={wc}/>
          <WallSeg x={-W/4}   z={L/2-t}   lenX={W/2} lenZ={0}   H={H} wc={wc}/>
          <WallSeg x={-W/2+t} z={0}        lenX={0}   lenZ={L}   H={H} wc={wc}/>
        </>
      ) : (
        <>
          <WallSeg x={0}      z={-L/2+t}  lenX={W} lenZ={0} H={H} wc={wc}/>
          <WallSeg x={0}      z={ L/2-t}  lenX={W} lenZ={0} H={H} wc={wc}/>
          <WallSeg x={-W/2+t} z={0}        lenX={0} lenZ={L} H={H} wc={wc}/>
          <WallSeg x={ W/2-t} z={0}        lenX={0} lenZ={L} H={H} wc={wc}/>
        </>
      )}
    </group>
  );
};

// 3D FURNITURE — material helpers unchanged
const mkMat = (src, tint, shading) => {
  if (!src || typeof src.clone !== 'function') return src;
  if (shading) {
    const m = src.clone();
    if (tint && m?.color?.set) m.color.set(tint);
    m.needsUpdate = true;
    return m;
  }
  const f = new THREE.MeshBasicMaterial({
    color: src.color ? src.color.clone() : new THREE.Color('#D4B896'),
    map: src.map || null, transparent: Boolean(src.transparent),
    opacity: Number.isFinite(src.opacity) ? src.opacity : 1, side: src.side,
  });
  if (tint && f?.color?.set) f.color.set(tint);
  f.needsUpdate = true;
  return f;
};

const applyMats = (obj, tint, shading) => {
  if (!obj) return;
  obj.traverse(n => {
    if (!n?.isMesh || !n.material) return;
    n.castShadow = n.receiveShadow = Boolean(shading);
    if (shading && n.geometry && !n.geometry.attributes?.normal) n.geometry.computeVertexNormals?.();
    n.material = Array.isArray(n.material)
      ? n.material.map(m => mkMat(m, tint, shading))
      : mkMat(n.material, tint, shading);
  });
};

// ─── FurnitureModel3D — FIXED: detects OBJ vs GLB and uses the right loader ──
const FurnitureModel3D = ({ item, isSelected, isColliding, roomW, roomL, onClick }) => {
  const [scene3d, setScene3d] = useState(null);
  const base = useRef(null);

  useEffect(() => {
    if (!item.model3DUrl) { setScene3d(null); base.current = null; return; }

    const url = resolveAssetUrl(item.model3DUrl);
    // Strip query-string before reading extension
    const ext = url.split('?')[0].split('.').pop().toLowerCase();

    // Shared post-load handler — OBJLoader returns a Group, GLTFLoader returns gltf.scene
    const onLoaded = (rootObject) => {
      const sc  = (rootObject && typeof rootObject.clone === 'function')
        ? rootObject.clone(true)
        : rootObject;
      const box = new THREE.Box3().setFromObject(sc);
      const sz  = box.getSize(new THREE.Vector3());
      const s   = Math.min(
        (item.width  || 1)   / (sz.x || 1),
        (item.height || 0.8) / (sz.y || 1),
        (item.depth  || 1)   / (sz.z || 1),
      );
      sc.scale.setScalar(s);
      const b2 = new THREE.Box3().setFromObject(sc);
      const c2 = b2.getCenter(new THREE.Vector3());
      sc.position.set(-c2.x, -b2.min.y, -c2.z);
      base.current = sc;
      applyMats(sc, item.activeColor, item.shading !== false);
      setScene3d(sc);
    };

    const onError = () => { setScene3d(null); base.current = null; };

    if (ext === 'obj') {
      new OBJLoader().load(url, onLoaded, undefined, onError);
    } else {
      new GLTFLoader().load(url, (gltf) => onLoaded(gltf.scene), undefined, onError);
    }
  }, [item.model3DUrl, item.width, item.depth, item.height]);

  useEffect(() => {
    if (!base.current) return;
    applyMats(base.current, item.activeColor, item.shading !== false);
    setScene3d(s => s);
  }, [item.activeColor, item.shading]);

  const posX = (item.xM||0)+(item.width||1)/2-(roomW||4)/2;
  const posZ = (item.yM||0)+(item.depth||1)/2-(roomL||4)/2;
  const rotY = -((item.rotation||0)*Math.PI)/180;
  const H    = item.height || 0.8;

  return (
    <group position={[posX,0,posZ]} rotation={[0,rotY,0]}
      onClick={e => { e.stopPropagation(); onClick(item.id); }}>
      {scene3d
        ? <primitive object={scene3d}/>
        : <mesh position={[0,H/2,0]} castShadow receiveShadow>
            <boxGeometry args={[item.width||1, H, item.depth||1]}/>
            <meshStandardMaterial color={item.activeColor||'#D4B896'} roughness={0.65} metalness={0.1}/>
          </mesh>
      }
      {isSelected && (
        <mesh position={[0,H+0.015,0]}>
          <boxGeometry args={[(item.width||1)+0.07,0.01,(item.depth||1)+0.07]}/>
          <meshBasicMaterial color="#C8973A" transparent opacity={0.5}/>
        </mesh>
      )}
      {isColliding && (
        <mesh position={[0,0.008,0]} rotation={[-Math.PI/2,0,0]}>
          <planeGeometry args={[item.width||1, item.depth||1]}/>
          <meshBasicMaterial color="#EF4444" transparent opacity={0.38}/>
        </mesh>
      )}
    </group>
  );
};

const DragPlane = ({ active, onMove, onEnd }) => active ? (
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.001,0]}
    onPointerMove={e => { e.stopPropagation(); onMove(e.point); }}
    onPointerUp={e => { e.stopPropagation(); onEnd(); }}
    onPointerLeave={onEnd}>
    <planeGeometry args={[500,500]}/><meshBasicMaterial transparent opacity={0}/>
  </mesh>
) : null;

const Scene3D = ({ room, placedItems, selectedId, collisions, onSelectItem, onMoveItem3D, orbitRef }) => {
  const W = room?.dimensions?.width  || 4;
  const L = room?.dimensions?.length || 4;
  const H = room?.dimensions?.height || 2.8;
  const [drag3d, setDrag3d] = useState(null);
  const dragOff = useRef({ x:0, z:0 });

  const startDrag = (e, item) => {
    e.stopPropagation();
    if (e.buttons !== 1) return;
    const px = (item.xM||0)+(item.width||1)/2-W/2;
    const pz = (item.yM||0)+(item.depth||1)/2-L/2;
    dragOff.current = { x: e.point.x - px, z: e.point.z - pz };
    setDrag3d(item.id); onSelectItem(item.id);
  };

  const handleMove = (pt) => {
    if (!drag3d) return;
    const item = placedItems.find(i => i.id === drag3d);
    if (!item) return;
    const nx = Math.round(((pt.x-dragOff.current.x)-(item.width||1)/2+W/2)/0.25)*0.25;
    const nz = Math.round(((pt.z-dragOff.current.z)-(item.depth||1)/2+L/2)/0.25)*0.25;
    onMoveItem3D(drag3d, nx, nz);
  };

  return (
    <>
      <ambientLight intensity={0.22}/>
      <hemisphereLight intensity={0.44} color="#fff7ef" groundColor="#9fa3aa"/>
      <directionalLight castShadow intensity={1.4} color="#fff7ec" position={[W*0.6,6,L*0.5]}
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.5} shadow-camera-far={60}
        shadow-camera-left={-W*1.2} shadow-camera-right={W*1.2}
        shadow-camera-top={L*1.2} shadow-camera-bottom={-L*1.2}
        shadow-bias={-0.00015}/>
      <directionalLight intensity={0.5} color="#cad9ff" position={[-W*0.5,3,-L*0.5]}/>
      <spotLight castShadow intensity={0.75} color="#ffe4c3" position={[0,H*2,L*0.3]}
        angle={0.52} penumbra={0.56} distance={H*8}
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0002}/>
      <pointLight intensity={0.25} color="#9bb4ff" position={[W*0.2,H*0.5,-L*0.4]}/>
      <ContactShadows position={[0,0.002,0]} opacity={0.48}
        scale={Math.max(W,L)*2.2} blur={2.2} far={3} resolution={1024}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.001,0]} receiveShadow>
        <planeGeometry args={[W*3,L*3]}/><shadowMaterial transparent opacity={0.18}/>
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.001,0]}
        onClick={e => { e.stopPropagation(); onSelectItem(null); }}>
        <planeGeometry args={[W,L]}/><meshBasicMaterial transparent opacity={0}/>
      </mesh>
      <RoomMesh3D room={room}/>
      <DragPlane active={!!drag3d} onMove={handleMove} onEnd={() => setDrag3d(null)}/>
      {placedItems.map(item => (
        <group key={item.id} onPointerDown={e => startDrag(e, item)}>
          <FurnitureModel3D item={item} isSelected={item.id===selectedId}
            isColliding={collisions.has(item.id)} roomW={W} roomL={L} onClick={onSelectItem}/>
        </group>
      ))}
      <OrbitControls ref={orbitRef} enablePan enabled={!drag3d}
        minPolarAngle={0} maxPolarAngle={Math.PI/2.05} target={[0,H/4,0]}/>
      <Environment preset="apartment" intensity={0.36}/>
    </>
  );
};

// PROPERTIES PANELS — unchanged
const RoomProperties = ({ room, onUpdate }) => (
  <div className="cw-prop-section">
    <h4 className="cw-prop-title">{room.name || 'Room'}</h4>
    <div className="cw-prop-row">
      <span className="cw-prop-label">Shape</span>
      <span className="cw-prop-value">{room.shape}</span>
    </div>
    <div className="cw-prop-row">
      <span className="cw-prop-label">Size</span>
      <span className="cw-prop-value">
        {room.dimensions?.width}m × {room.dimensions?.length}m × {room.dimensions?.height}m
      </span>
    </div>
    <div className="cw-prop-group">
      <span className="cw-prop-label">Wall Color</span>
      <div className="cw-color-swatches">
        {(room.wallColors || [room.wallColor]).filter(Boolean).map(c => (
          <button key={c} title={c}
            className={`cw-swatch ${(room.activeWallColor || room.wallColor) === c ? 'active' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => onUpdate({ wallColor: c, activeWallColor: c })}/>
        ))}
      </div>
    </div>
    <div className="cw-prop-group">
      <span className="cw-prop-label">Floor Color</span>
      <div className="cw-color-swatches">
        {(room.floorColors || [room.floorColor]).filter(Boolean).map(c => (
          <button key={c} title={c}
            className={`cw-swatch ${(room.activeFloorColor || room.floorColor) === c ? 'active' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => onUpdate({ floorColor: c, activeFloorColor: c })}/>
        ))}
      </div>
    </div>
  </div>
);

const CartIcon    = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const FurnitureProperties = ({ item, onUpdate, onRemove, onRotate, onAddToCart }) => (
  <div className="cw-prop-section">
    <h4 className="cw-prop-title">{item.name}</h4>
    <div className="cw-prop-row">
      <span className="cw-prop-label">Price</span>
      <span className="cw-prop-value">LKR {Number(item.price||0).toLocaleString()}</span>
    </div>
    <div className="cw-prop-row">
      <span className="cw-prop-label">Size</span>
      <span className="cw-prop-value">
        {Number(item.width).toFixed(2)}m × {Number(item.depth).toFixed(2)}m × {Number(item.height).toFixed(2)}m
      </span>
    </div>
    {item.colors?.length > 0 && (
      <div className="cw-prop-group">
        <span className="cw-prop-label">Color</span>
        <div className="cw-color-swatches">
          {item.colors.map(c => (
            <button key={c} title={c}
              className={`cw-swatch ${item.activeColor === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onUpdate(item.id, { activeColor: c })}/>
          ))}
        </div>
      </div>
    )}
    <div className="cw-prop-group">
      <span className="cw-prop-label">Scale</span>
      <div className="cw-scale-options">
        {[0.5, 1, 1.5, 2].map(s => (
          <button key={s}
            className={`cw-scale-btn ${item.scale === s ? 'active' : ''}`}
            onClick={() => onUpdate(item.id, {
              scale: s, width: item.baseWidth*s, depth: item.baseDepth*s, height: item.baseHeight*s,
            })}>
            {s}×
          </button>
        ))}
      </div>
    </div>
    <div className="cw-prop-group">
      <span className="cw-prop-label">Rotation</span>
      <div className="cw-prop-row no-border">
        <input type="range" min="0" max="360" step="15"
          value={item.rotation || 0} className="cw-rotation-slider"
          onChange={e => onUpdate(item.id, { rotation: Number(e.target.value) })}/>
        <span className="cw-prop-value">{item.rotation || 0}°</span>
      </div>
    </div>
    <div className="cw-prop-group">
      <div className="cw-prop-row no-border">
        <span className="cw-prop-label">Shading</span>
        <label className="cw-toggle">
          <input type="checkbox" checked={item.shading !== false}
            onChange={e => onUpdate(item.id, { shading: e.target.checked })}/>
          <span className="cw-toggle-track"/>
        </label>
      </div>
      <span className="cw-shading-hint">
        {item.shading !== false ? 'Realistic (PBR lighting)' : 'Flat / Matte (unlit)'}
      </span>
    </div>
    <div className="cw-prop-actions">
      <div className="cw-prop-actions-row">
        <button className="cw-prop-btn rotate" onClick={() => onRotate(item.id)}>
          <RotateIcon/> Rotate 90°
        </button>
        <button className="cw-prop-btn remove" onClick={() => onRemove(item.id)}>
          <TrashIcon/> Remove
        </button>
      </div>
      <button className="cw-prop-btn add-cart" onClick={() => onAddToCart && onAddToCart(item)}>
        <CartIcon/> Add to Cart
      </button>
    </div>
  </div>
);

const HelpIcon    = () => <Svg size={18}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>;
const HomeIcon   = () => <Svg size={22}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Svg>;
const SofaIcon   = () => <Svg size={22}><rect x="2" y="9" width="20" height="11" rx="2"/><path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><path d="M2 15h20"/></Svg>;
const TourRotate = () => <Svg size={22}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Svg>;
const PaletteIcon= () => <Svg size={22}><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10c0 2.76-2.24 5-5 5h-1a2 2 0 0 0-2 2v0a2 2 0 0 1-2 2 10 10 0 0 1 0-20z"/></Svg>;
const ViewIcon   = () => <Svg size={22}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Svg>;
const BookmarkIcon= () => <Svg size={22}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Svg>;

const TOUR = [
  { Icon: HomeIcon,    title: 'Your room is ready!',   body: 'This is your personal design studio. The room template you chose is already loaded on the canvas.' },
  { Icon: SofaIcon,    title: 'Add furniture',         body: 'Browse the catalog on the left. Click any item to instantly place it in your room. Drag it to reposition.' },
  { Icon: TourRotate,  title: 'Rotate & scale',        body: 'Select a placed item to see the orange handles. Drag the circle handle to rotate freely, or use the Properties panel on the right.' },
  { Icon: PaletteIcon, title: 'Change colors',         body: 'Click the room background or a placed item. Pick wall colors, floor tones, and furniture colors from the preset palettes.' },
  { Icon: ViewIcon,    title: '2D & 3D views',         body: 'Switch between 2D Plan (top-down) and 3D Plan (walkthrough) using the buttons in the toolbar. You can drag furniture in both views!' },
  { Icon: BookmarkIcon,title: 'Save your design',      body: 'Happy with the layout? Click Save Design in the top-right. It will appear in My Account under My Saved Designs.' },
];

const TourBubble = ({ step, index, total, onNext, onSkip }) => (
  <div className="cw-tour-backdrop">
    <div className="cw-tour-card">
      <div className="cw-tour-top">
        <span className="cw-tour-icon"><step.Icon/></span>
        <button className="cw-tour-skip" onClick={onSkip}>Skip</button>
      </div>
      <h3 className="cw-tour-title">{step.title}</h3>
      <p className="cw-tour-body">{step.body}</p>
      <div className="cw-tour-footer">
        <div className="cw-tour-dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`cw-tour-dot ${i === index ? 'active' : ''}`}/>
          ))}
        </div>
        <button className="cw-tour-next" onClick={onNext}>
          {index < total - 1 ? 'Next' : "Let's go!"}
        </button>
      </div>
    </div>
  </div>
);

const PackageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SaveModal = ({ defaultName, itemCount, onConfirm, onClose, isSaving }) => {
  const [name, setName] = useState(defaultName || 'My Design');
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return (
    <div className="cw-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cw-modal">
        <div className="cw-modal-header">
          <h3>Save Your Design</h3>
          <button className="cw-modal-close" onClick={onClose}><CloseIcon/></button>
        </div>
        <div className="cw-modal-body">
          <div className="cw-modal-info-row">
            <span className="cw-modal-info-chip"><PackageIcon/> {itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            <span className="cw-modal-info-chip"><CalendarIcon/> {today}</span>
          </div>
          <div className="cw-modal-field">
            <label htmlFor="cw-design-name">Design Name</label>
            <input id="cw-design-name" type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. My Living Room"/>
          </div>
        </div>
        <div className="cw-modal-footer">
          <button className="cw-modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="cw-modal-btn save"
            onClick={() => onConfirm(name.trim() || 'My Design')}
            disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving…' : 'Save Design'}
          </button>
        </div>
      </div>
    </div>
  );
};

// MAIN CUSTOMER WORKSPACE — unchanged except imports above
const CustomerWorkspace = () => {
  const navigate  = useNavigate();
  const { addToCart } = useCart();
  const { roomId, designId: savedId } = useParams();

  const [room,        setRoom]        = useState(null);
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedId,  setSelectedId]  = useState(null);
  const [collisions,  setCollisions]  = useState(new Set());
  const [viewMode,    setViewMode]    = useState('2D');
  const [zoom,        setZoom]        = useState(100);
  const [furniture,   setFurniture]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [selCat,      setSelCat]      = useState('all');
  const [isSaving,     setIsSaving]     = useState(false);
  const [designId,     setDesignId]     = useState(savedId || null);
  const [designName,   setDesignName]   = useState('My Design');
  const [showSave,     setShowSave]     = useState(false);
  const [saveMsg,      setSaveMsg]      = useState('');
  const [tourStep,   setTourStep]   = useState(0);
  const [showTour,   setShowTour]   = useState(false);
  const [history,      setHistory]      = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);
  const orbitRef = useRef(null);

  const pushHistory = useCallback((items) => {
    const snap = JSON.stringify(items);
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndexRef.current + 1);
      const next   = [...sliced, snap].slice(-50);
      historyIndexRef.current = next.length - 1;
      return next;
    });
    setHistoryIndex(historyIndexRef.current);
  }, []);

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    setHistoryIndex(historyIndexRef.current);
    setHistory(prev => { setPlacedItems(JSON.parse(prev[historyIndexRef.current])); return prev; });
  };

  const handleRedo = () => {
    setHistory(prev => {
      if (historyIndexRef.current >= prev.length - 1) return prev;
      historyIndexRef.current += 1;
      setHistoryIndex(historyIndexRef.current);
      setPlacedItems(JSON.parse(prev[historyIndexRef.current]));
      return prev;
    });
  };

  useEffect(() => {
    if (!roomId) return;
    getPublishedRoom(roomId).then(res => {
      const r = res.data;
      setRoom({
        ...r,
        activeWallColor:  r.wallColors?.[0]  || r.wallColor  || '#F5F5F0',
        activeFloorColor: r.floorColors?.[0] || r.floorColor || '#C8A882',
      });
    }).catch(console.error);
  }, [roomId]);

  useEffect(() => {
    if (!savedId) return;
    getMyDesignById(savedId)
      .then(res => {
        const d = res.data;
        setRoom(d.room || null);
        setPlacedItems(d.placedItems || []);
        setDesignId(d._id);
        setDesignName(d.name || 'My Design');
      })
      .catch(() => {
        getPublishedDesign(savedId)
          .then(res => {
            const d = res.data;
            setRoom(d.room || null);
            setPlacedItems(d.placedItems || []);
            setDesignId(null);
            setDesignName(d.name ? `${d.name} (Copy)` : 'My Design');
          })
          .catch(console.error);
      });
  }, [savedId]);

  useEffect(() => {
    listPublishedFurniture({ limit: 200 }).then(res => {
      const items = res.data || [];
      setFurniture(items);
      setCategories([...new Set(items.map(f => f.category).filter(Boolean))]);
    }).catch(console.error);
  }, []);

  useEffect(() => { setCollisions(checkCollisions(placedItems, room)); }, [placedItems, room]);

  const handleAddFurniture = (fi) => {
    if (!room) return;
    const bW = fi.dimensions?.width  || fi.width  || 1;
    const bD = fi.dimensions?.depth  || fi.depth  || 1;
    const bH = fi.dimensions?.height || fi.height || 0.8;
    const newItem = {
      id:          `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      furnitureId: fi._id,
      name:        fi.name,
      category:    fi.category || '',
      price:       fi.price    || 0,
      image2DUrl:  fi.image2DUrl || '',
      model3DUrl:  fi.model3D?.fileUrl || fi.model3DUrl || '',
      colors:      fi.colors || [],
      activeColor: fi.colors?.[0] || '#D4B896',
      width:  bW, depth:  bD, height:  bH,
      baseWidth: bW, baseDepth: bD, baseHeight: bH,
      xM: 0.5, yM: 0.5, rotation: 0, scale: 1, shading: true,
    };
    const next = [...placedItems, newItem];
    setPlacedItems(next); pushHistory(next);
    setSelectedId(newItem.id);
  };

  const handleMoveItem = useCallback((id, xM, yM, rotation) => {
    setPlacedItems(prev => prev.map(i =>
      i.id === id ? { ...i, xM, yM, ...(rotation != null ? { rotation } : {}) } : i
    ));
  }, []);

  const handleMoveItem3D = useCallback((id, xM, yM) => {
    setPlacedItems(prev => prev.map(i => i.id === id ? { ...i, xM, yM } : i));
  }, []);

  const handleUpdateItem = (id, patch) => {
    setPlacedItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...patch } : i);
      pushHistory(next); return next;
    });
  };

  const handleRemoveItem = (id) => {
    setPlacedItems(prev => { const n = prev.filter(i => i.id !== id); pushHistory(n); return n; });
    setSelectedId(null);
  };

  const handleRotateItem = (id) => {
    setPlacedItems(prev => {
      const n = prev.map(i => i.id === id ? { ...i, rotation: ((i.rotation||0)+90)%360 } : i);
      pushHistory(n); return n;
    });
  };

  const handleUpdateRoom = (patch) => setRoom(prev => ({ ...prev, ...patch }));

  const handleSaveConfirm = async (name) => {
    try {
      setIsSaving(true);
      const payload = { name, room, placedItems };
      if (designId) {
        await updateMyDesign(designId, payload);
      } else {
        const res = await createMyDesign(payload);
        setDesignId(res.data._id);
      }
      setDesignName(name);
      setShowSave(false);
      setSaveMsg('saved');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err.status === 401 ? 'auth_err' : 'save_err');
      setTimeout(() => setSaveMsg(''), 4000);
    } finally { setIsSaving(false); }
  };

  const openTour    = () => { setTourStep(0); setShowTour(true); };
  const advanceTour = () => { if (tourStep < TOUR.length - 1) setTourStep(s => s + 1); else setShowTour(false); };
  const skipTour    = () => setShowTour(false);

  const selectedItem = placedItems.find(i => i.id === selectedId) || null;
  const W = room?.dimensions?.width  || 4;
  const L = room?.dimensions?.length || 4;
  const H = room?.dimensions?.height || 2.8;
  const camPos = [W, H * 1.3, L];

  return (
    <div className="cw-root">
      {showTour && (
        <TourBubble step={TOUR[tourStep]} index={tourStep}
          total={TOUR.length} onNext={advanceTour} onSkip={skipTour}/>
      )}
      <button className="cw-help-btn" onClick={openTour} title="How to use this workspace">
        <HelpIcon/>
      </button>
      <div className="cw-topbar">
        <div className="cw-topbar-left">
          <div className="cw-room-badge">
            <span className="cw-room-badge-name">
              {designId ? designName : (room?.name || 'Loading…')}
            </span>
            {room && (
              <span className="cw-room-badge-dims">
                {room.dimensions?.width}m × {room.dimensions?.length}m × {room.dimensions?.height}m
              </span>
            )}
          </div>
        </div>
        <div className="cw-topbar-center">
          <div className="cw-view-toggle">
            <button className={`cw-view-btn ${viewMode === '2D' ? 'active' : ''}`}
              onClick={() => setViewMode('2D')}>2D Plan</button>
            <button className={`cw-view-btn ${viewMode === '3D' ? 'active' : ''}`}
              onClick={() => setViewMode('3D')}>3D Plan</button>
          </div>
          <div className="cw-history-btns">
            <button className="cw-hist-btn" title="Undo"
              onClick={handleUndo} disabled={historyIndex <= 0}><UndoIcon/></button>
            <button className="cw-hist-btn" title="Redo"
              onClick={handleRedo} disabled={historyIndex >= history.length - 1}><RedoIcon/></button>
          </div>
        </div>
        <div className="cw-topbar-right">
          {saveMsg && (
            <span className={`cw-save-msg ${saveMsg === 'saved' ? 'ok' : 'err'}`}>
              {saveMsg === 'saved'     ? 'Design saved!'
               : saveMsg === 'auth_err' ? 'Sign in required to save.'
               : 'Save failed. Try again.'}
            </span>
          )}
          <button className="cw-btn-change-room" onClick={() => navigate('/room')}>
            Change Room
          </button>
          <button className="cw-btn-save" onClick={() => setShowSave(true)} disabled={isSaving}>
            <SaveIcon/> {designId ? 'Save Changes' : 'Save Design'}
          </button>
        </div>
      </div>

      <div className="cw-body">
        <div className="cw-left-panel">
          <div className="cw-left-header">
            <span className="cw-left-title">Furniture</span>
            <select className="cw-cat-select" value={selCat} onChange={e => setSelCat(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="cw-catalog-list">
            {furniture
              .filter(f => selCat === 'all' || f.category === selCat)
              .map(item => (
                <div key={item._id} className="cw-catalog-item"
                  onClick={() => handleAddFurniture(item)}
                  title={`${item.name} — LKR ${Number(item.price||0).toLocaleString()}`}>
                  <div className="cw-catalog-img">
                    {item.image2DUrl
                      ? <img src={resolveAssetUrl(item.image2DUrl)} alt={item.name}/>
                      : <div className="cw-catalog-placeholder">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B0B0B0" strokeWidth="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          </svg>
                        </div>
                    }
                  </div>
                  <div className="cw-catalog-meta">
                    <span className="cw-catalog-name">{item.name}</span>
                    <span className="cw-catalog-price">LKR {Number(item.price||0).toLocaleString()}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="cw-canvas-area">
          {viewMode === '2D' && (
            <div className="cw-zoom-controls">
              <button className="cw-zoom-btn" title="Zoom In"
                onClick={() => setZoom(z => Math.min(z + 10, 200))}><ZoomInIcon/></button>
              <span className="cw-zoom-label">{zoom}%</span>
              <button className="cw-zoom-btn" title="Zoom Out"
                onClick={() => setZoom(z => Math.max(z - 10, 30))}><ZoomOutIcon/></button>
            </div>
          )}
          <div className="cw-canvas-scroll">
            {viewMode === '2D' ? (
              <Canvas2D
                room={room} placedItems={placedItems} selectedId={selectedId}
                onSelectItem={id => setSelectedId(id)}
                onMoveItem={handleMoveItem}
                onCanvasClick={() => setSelectedId(null)}
                zoom={zoom} collisions={collisions}
              />
            ) : (
              <div className="cw-canvas-3d-wrap">
                {room ? (
                  <>
                    <Canvas shadows camera={{ position: camPos, fov: 46 }}
                      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.06 }}>
                      <Scene3D room={room} placedItems={placedItems} selectedId={selectedId}
                        collisions={collisions}
                        onSelectItem={id => setSelectedId(id || null)}
                        onMoveItem3D={handleMoveItem3D} orbitRef={orbitRef}/>
                    </Canvas>
                    <div className="cw-zoom-controls cw-zoom-3d">
                      <button className="cw-zoom-btn" title="Zoom In"
                        onClick={() => { orbitRef.current?.dollyOut(1.2); orbitRef.current?.update(); }}>
                        <ZoomInIcon/>
                      </button>
                      <button className="cw-zoom-btn" title="Zoom Out"
                        onClick={() => { orbitRef.current?.dollyIn(1.2); orbitRef.current?.update(); }}>
                        <ZoomOutIcon/>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="cw-canvas-empty"><p>Loading room…</p></div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="cw-right-panel">
          <div className="cw-panel-header">
            <span className="cw-panel-title">Properties</span>
          </div>
          <div className="cw-panel-body">
            <div className="cw-properties">
              {!selectedItem && !room && (
                <p className="cw-empty-panel">Select a furniture item or click the room background.</p>
              )}
              {selectedItem
                ? <FurnitureProperties
                    item={selectedItem}
                    onUpdate={handleUpdateItem}
                    onRemove={handleRemoveItem}
                    onRotate={handleRotateItem}
                    onAddToCart={(item) => {
                      addToCart({
                        _id: item.furnitureId || item._id,
                        name: item.name, price: item.price || 0,
                        image2DUrl: item.image2DUrl, category: item.category,
                      }, 1, null);
                    }}
                  />
                : room
                  ? <RoomProperties room={room} onUpdate={handleUpdateRoom}/>
                  : null
              }
            </div>
          </div>
        </div>
      </div>

      {showSave && (
        <SaveModal
          defaultName={designName}
          itemCount={placedItems.length}
          onConfirm={handleSaveConfirm}
          onClose={() => setShowSave(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default CustomerWorkspace;