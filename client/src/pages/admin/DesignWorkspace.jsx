import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ACESFilmicToneMapping } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  createDesign,
  getDesignById,
  updateDesign,
  publishDesign,
} from '../../services/designApi';
import { listFurniture, resolveAssetUrl } from '../../services/furnitureApi';
import RoomSetupModal    from '../../components/RoomSetupModal';
import SaveDesignModal   from '../../components/SaveDesignModal';
import '../../styles/DesignWorkspace.css';

// ─── Icons ────────────────────────────────────────────────────────────────────
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
  </svg>
);
const RedoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
  </svg>
);
const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const RotateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const RoomIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

// ─── Canvas constants ─────────────────────────────────────────────────────────
const CANVAS_ROOM_PX = 380;
const getPxPerMeter  = (w, l) => CANVAS_ROOM_PX / Math.max(w || 4, l || 4, 1);

const getRoomPoints = (shape, widthM, lengthM, ppm) => {
  const w = widthM * ppm, l = lengthM * ppm;
  if (shape === 'L-Shape') {
    const hw = w/2, hl = l/2;
    return [[0,0],[w,0],[w,hl],[hw,hl],[hw,l],[0,l]];
  }
  return [[0,0],[w,0],[w,l],[0,l]];
};

// ─── Collision (metres) ───────────────────────────────────────────────────────
const checkCollisions = (items, room) => {
  const colliding = new Set();
  const W = room?.dimensions?.width  || 4;
  const L = room?.dimensions?.length || 4;
  for (let i = 0; i < items.length; i++) {
    const a  = items[i];
    const ax = a.xM||0, ay = a.yM||0, aw = a.width||1, ad = a.depth||1;
    if (ax < 0 || ay < 0 || ax+aw > W || ay+ad > L) colliding.add(a.id);
    for (let j = i+1; j < items.length; j++) {
      const b  = items[j];
      const bx = b.xM||0, by = b.yM||0, bw = b.width||1, bd = b.depth||1;
      if (!(ax+aw<=bx || bx+bw<=ax || ay+ad<=by || by+bd<=ay)) {
        colliding.add(a.id); colliding.add(b.id);
      }
    }
  }
  return colliding;
};

// ─── 2D Canvas ────────────────────────────────────────────────────────────────
const Canvas2D = ({ room, placedItems, selectedId, onSelectItem, onMoveItem, onCanvasClick, zoom, collisions, readOnly }) => {
  const svgRef     = useRef(null);
  const [dragging, setDragging]   = useState(null);
  const [rotating, setRotating]   = useState(null);
  const dragOffset = useRef({ x:0, y:0 });

  const widthM  = room?.dimensions?.width  || 4;
  const lengthM = room?.dimensions?.length || 4;
  const ppm     = getPxPerMeter(widthM, lengthM);
  const roomWpx = widthM  * ppm;
  const roomLpx = lengthM * ppm;
  const padding = 60;
  const gridCell = Math.min(roomWpx, roomLpx) / 16;

  const onMouseMove = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg || readOnly) return;
    const rect  = svg.getBoundingClientRect();
    const scale = zoom / 100;

    if (rotating) {
      const item = placedItems.find(i => i.id === rotating);
      if (!item) return;
      const iw = (item.width||1)*ppm, ih = (item.depth||1)*ppm;
      const cx = (item.xM||0)*ppm + padding + iw/2;
      const cy = (item.yM||0)*ppm + padding + ih/2;
      const mx = (e.clientX - rect.left)/scale;
      const my = (e.clientY - rect.top)/scale;
      const angle = Math.atan2(my-cy, mx-cx)*(180/Math.PI) + 90;
      onMoveItem(rotating, item.xM, item.yM, Math.round(angle/15)*15);
      return;
    }
    if (!dragging) return;
    const mx   = (e.clientX - rect.left)/scale;
    const my   = (e.clientY - rect.top)/scale;
    const rawX = (mx - dragOffset.current.x - padding) / ppm;
    const rawY = (my - dragOffset.current.y - padding) / ppm;
    onMoveItem(dragging, Math.round(rawX/0.25)*0.25, Math.round(rawY/0.25)*0.25, null);
  }, [dragging, rotating, zoom, ppm, padding, placedItems, onMoveItem, readOnly]);

  const onMouseUp = useCallback(() => { setDragging(null); setRotating(null); }, []);

  if (!room) return (
    <div className="dw-canvas-empty"><p>No room loaded.</p></div>
  );

  const { shape, wallColor, floorColor } = room;
  const points = getRoomPoints(shape||'Rectangular', widthM, lengthM, ppm);
  const svgW = roomWpx + padding*2, svgH = roomLpx + padding*2;

  return (
    <div className="dw-canvas-2d-wrap"
      style={{ cursor: rotating ? 'crosshair' : dragging ? 'grabbing' : 'default' }}
      onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <svg ref={svgRef} width={svgW} height={svgH}
        style={{ transform:`scale(${zoom/100})`, transformOrigin:'top left' }}
        onClick={e => (e.target===svgRef.current || e.target.classList.contains('dw-grid-bg')) && onCanvasClick?.()}>
        <defs>
          <pattern id="dw-grid" width={gridCell} height={gridCell}
            patternUnits="userSpaceOnUse" x={padding} y={padding}>
            <path d={`M ${gridCell} 0 L 0 0 0 ${gridCell}`} fill="none" stroke="#DDE1E7" strokeWidth="0.5"/>
          </pattern>
          <clipPath id="dw-room-clip">
            <polygon points={points.map(p=>`${p[0]+padding},${p[1]+padding}`).join(' ')}/>
          </clipPath>
        </defs>

        <rect width={svgW} height={svgH} fill="#EDEEF1" className="dw-grid-bg"/>
        <polygon points={points.map(p=>`${p[0]+padding},${p[1]+padding}`).join(' ')} fill={floorColor||'#F5F0E8'}/>
        <rect x={padding} y={padding} width={roomWpx} height={roomLpx} fill="url(#dw-grid)" clipPath="url(#dw-room-clip)"/>
        <polygon points={points.map(p=>`${p[0]+padding},${p[1]+padding}`).join(' ')}
          fill="none" stroke={wallColor||'#8B7355'} strokeWidth="5"/>

        <text x={padding+roomWpx/2} y={padding-12} textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="monospace" fontWeight="600">
          {widthM.toFixed(1)}m
        </text>
        <text x={padding-14} y={padding+roomLpx/2} textAnchor="middle" fontSize="11" fill="#64748B"
          fontFamily="monospace" fontWeight="600"
          transform={`rotate(-90, ${padding-14}, ${padding+roomLpx/2})`}>
          {lengthM.toFixed(1)}m
        </text>

        {placedItems.map(item => {
          const isSel  = item.id === selectedId;
          const isColl = collisions.has(item.id);
          const iw = (item.width||1)*ppm, ih = (item.depth||1)*ppm;
          const px = (item.xM||0)*ppm + padding, py = (item.yM||0)*ppm + padding;
          const cx = px+iw/2, cy = py+ih/2;
          return (
            <g key={item.id}
              transform={`translate(${cx},${cy}) rotate(${item.rotation||0}) translate(${-iw/2},${-ih/2})`}>
              <rect x={2} y={2} width={iw} height={ih} rx="3" fill="rgba(0,0,0,0.07)" style={{pointerEvents:'none'}}/>
              <rect width={iw} height={ih} rx="3"
                fill={item.activeColor||'#D4B896'}
                stroke={isColl?'#EF4444':isSel?'#DE8B47':'rgba(0,0,0,0.18)'}
                strokeWidth={isColl||isSel?2.5:1}
                onMouseDown={readOnly ? undefined : (e) => {
                  e.preventDefault(); e.stopPropagation();
                  const r = svgRef.current.getBoundingClientRect();
                  const s = zoom/100;
                  dragOffset.current = {
                    x:(e.clientX-r.left)/s-(item.xM||0)*ppm-padding,
                    y:(e.clientY-r.top)/s-(item.yM||0)*ppm-padding
                  };
                  setDragging(item.id); onSelectItem(item.id);
                }}
                style={{ cursor: readOnly ? 'default' : 'grab' }}
                onClick={readOnly ? (e) => { e.stopPropagation(); onSelectItem(item.id); } : undefined}
              />
              <text x={iw/2} y={ih/2} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fill="#3E2723" fontWeight="500" fontFamily="sans-serif"
                style={{pointerEvents:'none',userSelect:'none'}}>
                {item.name.length>14 ? item.name.slice(0,13)+'…' : item.name}
              </text>
              {isSel && !readOnly && (
                <>
                  {[[-4,-4],[iw-4,-4],[-4,ih-4],[iw-4,ih-4]].map(([hx,hy],i) => (
                    <rect key={i} x={hx} y={hy} width={8} height={8} rx="2" fill="#DE8B47" style={{pointerEvents:'none'}}/>
                  ))}
                  <line x1={iw/2} y1={0} x2={iw/2} y2={-14} stroke="#DE8B47" strokeWidth="1.5" style={{pointerEvents:'none'}}/>
                  <circle cx={iw/2} cy={-19} r={6} fill="#DE8B47" style={{cursor:'alias'}}
                    onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setRotating(item.id); onSelectItem(item.id); }}/>
                </>
              )}
              {isColl && (
                <text x={iw/2} y={ih+13} textAnchor="middle" fontSize="8" fill="#EF4444" fontWeight="700" style={{pointerEvents:'none'}}>
                  ⚠ Collision
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── 3D Room ──────────────────────────────────────────────────────────────────
// ─── Room 3D mesh ─────────────────────────────────────────────────────────────
//
// COORDINATE SYSTEM (centred on room origin):
//   World X → room width  (left = -W/2, right = +W/2)
//   World Z → room length (near = -L/2, far  = +L/2)
//   World Y → up
//
// L-Shape vertices (world XZ, top-right quadrant removed):
//   TL(-W/2, -L/2)   TR(+W/2, -L/2)
//   MR(+W/2,   0  )  IC(  0,    0  )
//   BI(  0,  +L/2 )  BL(-W/2, +L/2)
//
// KEY: ShapeGeometry is built in XY space.
//      mesh rotation=[-π/2, 0, 0] maps:
//        shape-X → world-X  ✓
//        shape-Y → world-Z  BUT with a sign flip: shape +Y → world -Z
//      So we must NEGATE the Z values when building the shape.
//
// Walls: BoxGeometry(length, H, T). Default box length runs along X.
//        rotY = π/2 makes it run along Z instead.
//        Each wall centre is pulled INWARD by T/2 so the outer face is flush.

const WALL_T = 0.12;

const WallSeg = ({ x, z, lenX, lenZ, H, wc }) => {
  const len  = lenX > 0 ? lenX : lenZ;
  const rotY = lenX > 0 ? 0 : Math.PI / 2;
  return (
    <mesh position={[x, H / 2, z]} rotation={[0, rotY, 0]} castShadow receiveShadow>
      <boxGeometry args={[len, H, WALL_T]} />
      <meshStandardMaterial color={wc} roughness={0.78} metalness={0.02} />
    </mesh>
  );
};

// Build an L-shape or rectangle floor directly as a BufferGeometry in XZ space.
// Using BufferGeometry avoids the ShapeGeometry Y-axis sign-flip entirely.
const buildFloorBuffer = (isL, W, L) => {
  // triangulate the polygon manually
  // Rectangle: 2 triangles
  // L-Shape:   4 triangles (polygon split into non-overlapping tris)
  let positions, indices;
  if (isL) {
    // 6 vertices (XZ, Y=0):
    // 0: TL  1: TR  2: MR  3: IC  4: BI  5: BL
    positions = new Float32Array([
      -W/2, 0, -L/2,   //  0 TL
       W/2, 0, -L/2,   //  1 TR
       W/2, 0,  0,     //  2 MR
       0,   0,  0,     //  3 IC
       0,   0,  L/2,   //  4 BI
      -W/2, 0,  L/2,   //  5 BL
    ]);
    // Split L into 4 non-overlapping triangles:
    //   tri A: 0,1,2   (top-right rect)
    //   tri B: 0,2,3   (bridge to inner corner)
    //   tri C: 0,3,4   (diagonal across middle)
    //   tri D: 0,4,5   (bottom-left rect)
    indices = new Uint16Array([
      0,1,2,
      0,2,3,
      0,3,4,
      0,4,5,
    ]);
  } else {
    positions = new Float32Array([
      -W/2, 0, -L/2,   //  0 TL
       W/2, 0, -L/2,   //  1 TR
       W/2, 0,  L/2,   //  2 BR
      -W/2, 0,  L/2,   //  3 BL
    ]);
    indices = new Uint16Array([0,1,2, 0,2,3]);
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
  const W  = dimensions?.width  || 4;
  const L  = dimensions?.length || 4;
  const H  = dimensions?.height || 2.8;
  const wc = activeWallColor  || wallColor  || '#F5F5F0';
  const fc = activeFloorColor || floorColor || '#C8A882';
  const isL = (shape || 'Rectangular') === 'L-Shape';
  const t   = WALL_T / 2;

  const floorGeo = useMemo(() => buildFloorBuffer(isL, W, L), [isL, W, L]);

  return (
    <group>
      {/* ── Floor: no rotation needed, already in XZ ── */}
      <mesh receiveShadow>
        <primitive object={floorGeo} attach="geometry" />
        <meshStandardMaterial color={fc} roughness={0.82} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>

      {isL ? (
        <>
          {/* ── 6 walls for L-shape ──────────────────────────────────────────
           *
           *  TL ──[N]────── TR
           *  │               │
           * [W]           [ET]
           *  │               │
           *  │      IC─[IH]─MR
           *  │      │
           *  │     [IV]
           *  │      │
           *  BL─[S]─BI
           */}

          {/* [N]  North: full width, outer face at z = -L/2, centre pulled inward */}
          <WallSeg x={0}         z={-L/2 + t}  lenX={W}    lenZ={0}   H={H} wc={wc} />

          {/* [ET] East-top: from TR down to MR, outer face at x = +W/2 */}
          <WallSeg x={W/2 - t}   z={-L/4}      lenX={0}    lenZ={L/2} H={H} wc={wc} />

          {/* [IH] Inner-horizontal: from MR left to IC, inner face at z = 0 (notch top edge) */}
          <WallSeg x={W/4}       z={t}          lenX={W/2}  lenZ={0}   H={H} wc={wc} />

          {/* [IV] Inner-vertical: from IC down to BI, inner face at x = 0 (notch left edge) */}
          <WallSeg x={-t}        z={L/4}        lenX={0}    lenZ={L/2} H={H} wc={wc} />

          {/* [S]  South-partial: from BI left to BL, outer face at z = +L/2 */}
          <WallSeg x={-W/4}      z={L/2 - t}   lenX={W/2}  lenZ={0}   H={H} wc={wc} />

          {/* [W]  West: full length, outer face at x = -W/2 */}
          <WallSeg x={-W/2 + t}  z={0}          lenX={0}    lenZ={L}   H={H} wc={wc} />
        </>
      ) : (
        <>
          <WallSeg x={0}         z={-L/2 + t}  lenX={W} lenZ={0} H={H} wc={wc} />  {/* North */}
          <WallSeg x={0}         z={ L/2 - t}  lenX={W} lenZ={0} H={H} wc={wc} />  {/* South */}
          <WallSeg x={-W/2 + t}  z={0}          lenX={0} lenZ={L} H={H} wc={wc} />  {/* West  */}
          <WallSeg x={ W/2 - t}  z={0}          lenX={0} lenZ={L} H={H} wc={wc} />  {/* East  */}
        </>
      )}
    </group>
  );
};

// ─── 3D Furniture item ────────────────────────────────────────────────────────
// Mirrors createPreviewMaterial from FurnitureForm:
//   shading ON  → clone the original PBR material then tint (full realism)
//   shading OFF → flat MeshBasicMaterial (unlit / matte)
const createFurnitureMaterial = (sourceMaterial, tintColor, shadingEnabled) => {
  if (!sourceMaterial || typeof sourceMaterial.clone !== 'function') return sourceMaterial;
  if (shadingEnabled) {
    const mat = sourceMaterial.clone();
    if (tintColor && mat?.color?.set) mat.color.set(tintColor);
    mat.needsUpdate = true;
    return mat;
  }
  const flat = new THREE.MeshBasicMaterial({
    color:       sourceMaterial.color ? sourceMaterial.color.clone() : new THREE.Color('#D4B896'),
    map:         sourceMaterial.map  || null,
    transparent: Boolean(sourceMaterial.transparent),
    opacity:     Number.isFinite(sourceMaterial.opacity) ? sourceMaterial.opacity : 1,
    side:        sourceMaterial.side,
  });
  if (tintColor && flat?.color?.set) flat.color.set(tintColor);
  flat.needsUpdate = true;
  return flat;
};

const applyFurnitureMaterials = (rootObject, tintColor, shadingEnabled) => {
  if (!rootObject) return;
  rootObject.traverse(node => {
    if (!node?.isMesh || !node.material) return;
    node.castShadow    = Boolean(shadingEnabled);
    node.receiveShadow = Boolean(shadingEnabled);
    if (shadingEnabled && node.geometry && !node.geometry.attributes?.normal) {
      if (typeof node.geometry.computeVertexNormals === 'function')
        node.geometry.computeVertexNormals();
    }
    node.material = Array.isArray(node.material)
      ? node.material.map(m => createFurnitureMaterial(m, tintColor, shadingEnabled))
      : createFurnitureMaterial(node.material, tintColor, shadingEnabled);
  });
};

const FurnitureModel3D = ({ item, isSelected, isColliding, roomW, roomL, onClick }) => {
  const [gltfScene, setGltfScene] = useState(null);
  const baseScene = useRef(null);

  useEffect(() => {
    if (!item.model3DUrl) { setGltfScene(null); baseScene.current = null; return; }
    const loader = new GLTFLoader();
    loader.load(resolveAssetUrl(item.model3DUrl), (gltf) => {
      const scene = gltf.scene.clone(true);
      const box  = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const s    = Math.min(
        (item.width ||1) / (size.x||1),
        (item.height||0.8) / (size.y||1),
        (item.depth ||1) / (size.z||1),
      );
      scene.scale.setScalar(s);
      const box2 = new THREE.Box3().setFromObject(scene);
      const c2   = box2.getCenter(new THREE.Vector3());
      scene.position.set(-c2.x, -box2.min.y, -c2.z);
      baseScene.current = scene;
      applyFurnitureMaterials(scene, item.activeColor, item.shading !== false);
      setGltfScene(scene);
    }, undefined, () => { setGltfScene(null); baseScene.current = null; });
  }, [item.model3DUrl, item.width, item.depth, item.height]);

  useEffect(() => {
    if (!baseScene.current) return;
    applyFurnitureMaterials(baseScene.current, item.activeColor, item.shading !== false);
    setGltfScene(s => s);
  }, [item.activeColor, item.shading]);

  const posX = (item.xM||0) + (item.width||1)/2  - (roomW||4)/2;
  const posZ = (item.yM||0) + (item.depth||1)/2  - (roomL||4)/2;
  const rotY = -((item.rotation||0) * Math.PI) / 180;
  const H    = item.height || 0.8;

  return (
    <group position={[posX, 0, posZ]} rotation={[0, rotY, 0]}
      onClick={e => { e.stopPropagation(); onClick(item.id); }}>
      {gltfScene
        ? <primitive object={gltfScene}/>
        : (
          <mesh position={[0,H/2,0]} castShadow={item.shading!==false} receiveShadow={item.shading!==false}>
            <boxGeometry args={[item.width||1, H, item.depth||1]}/>
            {item.shading === false
              ? <meshBasicMaterial color={item.activeColor||'#D4B896'}/>
              : <meshStandardMaterial color={item.activeColor||'#D4B896'} roughness={0.65} metalness={0.1}/>
            }
          </mesh>
        )
      }
      {isSelected && (
        <mesh position={[0,H+0.015,0]}>
          <boxGeometry args={[(item.width||1)+0.07,0.01,(item.depth||1)+0.07]}/>
          <meshBasicMaterial color="#DE8B47" transparent opacity={0.5}/>
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

// Invisible drag floor plane
const DragPlane = ({ active, onMove, onEnd }) => {
  if (!active) return null;
  return (
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.001,0]}
      onPointerMove={e => { e.stopPropagation(); onMove(e.point); }}
      onPointerUp={e   => { e.stopPropagation(); onEnd(); }}
      onPointerLeave={onEnd}>
      <planeGeometry args={[500,500]}/>
      <meshBasicMaterial transparent opacity={0}/>
    </mesh>
  );
};

// ─── Full 3D Scene ────────────────────────────────────────────────────────────
const Scene3D = ({ room, placedItems, selectedId, collisions, onSelectItem, onMoveItem3D, readOnly, orbitRef }) => {
  const W = room?.dimensions?.width  || 4;
  const L = room?.dimensions?.length || 4;
  const H = room?.dimensions?.height || 2.8;
  const [dragging3D, setDragging3D] = useState(null);
  const dragOff = useRef({ x:0, z:0 });

  const startDrag3D = (e, item) => {
    if (readOnly) return;
    e.stopPropagation();
    if (e.buttons !== 1) return;
    const posX = (item.xM||0)+(item.width||1)/2-W/2;
    const posZ = (item.yM||0)+(item.depth||1)/2-L/2;
    dragOff.current = { x: e.point.x-posX, z: e.point.z-posZ };
    setDragging3D(item.id);
    onSelectItem(item.id);
  };

  const handleDragMove = (point) => {
    if (!dragging3D) return;
    const item = placedItems.find(i => i.id===dragging3D);
    if (!item) return;
    const nx = Math.round(((point.x-dragOff.current.x)-(item.width||1)/2+W/2)/0.25)*0.25;
    const nz = Math.round(((point.z-dragOff.current.z)-(item.depth||1)/2+L/2)/0.25)*0.25;
    onMoveItem3D(dragging3D, nx, nz);
  };

  return (
    <>
      {/* Rich multi-light rig matching FurnitureForm realism */}
      <ambientLight intensity={0.22}/>
      <hemisphereLight intensity={0.44} color="#fff7ef" groundColor="#9fa3aa"/>
      <directionalLight castShadow intensity={1.4} color="#fff7ec"
        position={[W*0.6, 6, L*0.5]}
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.5} shadow-camera-far={60}
        shadow-camera-left={-W*1.2} shadow-camera-right={W*1.2}
        shadow-camera-top={L*1.2} shadow-camera-bottom={-L*1.2}
        shadow-bias={-0.00015}/>
      <directionalLight intensity={0.5} color="#cad9ff" position={[-W*0.5, 3, -L*0.5]}/>
      <spotLight castShadow intensity={0.75} color="#ffe4c3"
        position={[0, H*2, L*0.3]}
        angle={0.52} penumbra={0.56} distance={H*8}
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-bias={-0.0002}/>
      <pointLight intensity={0.25} color="#9bb4ff" position={[W*0.2, H*0.5, -L*0.4]}/>
      {/* Soft contact shadows under each piece of furniture */}
      <ContactShadows position={[0,0.002,0]} opacity={0.48} scale={Math.max(W,L)*2.2} blur={2.2} far={3} resolution={1024}/>
      {/* Extra shadow receiver plane for crisp cast shadows */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.001,0]} receiveShadow>
        <planeGeometry args={[W*3, L*3]}/>
        <shadowMaterial transparent opacity={0.18}/>
      </mesh>

      {/* Click floor to deselect */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.001,0]}
        onClick={e => { e.stopPropagation(); onSelectItem(null); }}>
        <planeGeometry args={[W,L]}/>
        <meshBasicMaterial transparent opacity={0}/>
      </mesh>

      <RoomMesh3D room={room}/>

      <DragPlane active={!!dragging3D} onMove={handleDragMove} onEnd={() => setDragging3D(null)}/>

      {placedItems.map(item => (
        <group key={item.id} onPointerDown={e => startDrag3D(e, item)}>
          <FurnitureModel3D
            item={item}
            isSelected={item.id===selectedId}
            isColliding={collisions.has(item.id)}
            roomW={W} roomL={L}
            onClick={onSelectItem}
            readOnly={readOnly}
          />
        </group>
      ))}

      <OrbitControls ref={orbitRef} enablePan enabled={!dragging3D}
        minPolarAngle={0} maxPolarAngle={Math.PI/2.05}
        target={[0, H/4, 0]}/>
      <Environment preset="apartment" intensity={0.36}/>
    </>
  );
};

// ─── Properties panels ────────────────────────────────────────────────────────
const FurnitureProperties = ({ item, onUpdate, onRemove, onRotate, readOnly }) => (
  <div className="dw-prop-section">
    <h4 className="dw-prop-title">{item.name}</h4>
    <div className="dw-prop-row"><span className="dw-prop-label">Price</span>
      <span className="dw-prop-value">LKR {Number(item.price||0).toLocaleString()}</span>
    </div>
    <div className="dw-prop-row"><span className="dw-prop-label">Size</span>
      <span className="dw-prop-value">
        {Number(item.width).toFixed(2)}m × {Number(item.depth).toFixed(2)}m × {Number(item.height).toFixed(2)}m
      </span>
    </div>

    {item.colors?.length > 0 && (
      <div className="dw-prop-group">
        <span className="dw-prop-label">Color</span>
        <div className="dw-color-swatches">
          {item.colors.map(c => (
            <button key={c}
              className={`dw-swatch ${item.activeColor===c?'active':''}`}
              style={{ backgroundColor:c }}
              onClick={() => !readOnly && onUpdate(item.id,{activeColor:c})}
              title={c}
              disabled={readOnly}
            />
          ))}
        </div>
      </div>
    )}

    {!readOnly && (
      <>
        <div className="dw-prop-group">
          <span className="dw-prop-label">Scale</span>
          <div className="dw-scale-options">
            {[0.5,1,1.5,2].map(s => (
              <button key={s} className={`dw-scale-btn ${item.scale===s?'active':''}`}
                onClick={() => onUpdate(item.id,{scale:s,width:item.baseWidth*s,depth:item.baseDepth*s,height:item.baseHeight*s})}>
                {s}×
              </button>
            ))}
          </div>
        </div>
        <div className="dw-prop-group">
          <span className="dw-prop-label">Rotation</span>
          <div className="dw-prop-row no-border">
            <input type="range" min="0" max="360" step="15" value={item.rotation||0}
              onChange={e => onUpdate(item.id,{rotation:Number(e.target.value)})}
              className="dw-rotation-slider"/>
            <span className="dw-prop-value">{item.rotation||0}°</span>
          </div>
        </div>
        <div className="dw-prop-group">
          <span className="dw-prop-label">Shading</span>
          <label className="dw-toggle">
            <input type="checkbox" checked={item.shading!==false}
              onChange={e => onUpdate(item.id,{shading:e.target.checked})}/>
            <span className="dw-toggle-track"/>
          </label>
        </div>
        <div className="dw-prop-actions">
          <button className="dw-prop-btn rotate" onClick={() => onRotate(item.id)}><RotateIcon/> Rotate 90°</button>
          <button className="dw-prop-btn remove" onClick={() => onRemove(item.id)}><TrashIcon/> Remove</button>
        </div>
      </>
    )}
  </div>
);

const RoomProperties = ({ room, onUpdate, readOnly }) => {
  const isTemplate = room.isTemplate;
  const [localDims, setLocalDims] = useState({
    width:  room.dimensions?.width  || 4,
    length: room.dimensions?.length || 4,
    height: room.dimensions?.height || 2.8,
  });
  useEffect(() => {
    setLocalDims({
      width:  room.dimensions?.width  || 4,
      length: room.dimensions?.length || 4,
      height: room.dimensions?.height || 2.8,
    });
  }, [room.dimensions?.width, room.dimensions?.length, room.dimensions?.height]);

  return (
    <div className="dw-prop-section">
      <h4 className="dw-prop-title">{room.name||'Room'}</h4>
      <div className="dw-prop-row"><span className="dw-prop-label">Shape</span><span className="dw-prop-value">{room.shape}</span></div>
      <div className="dw-prop-row">
        <span className="dw-prop-label">Dimensions</span>
        <span className="dw-prop-value">{room.dimensions?.width}m × {room.dimensions?.length}m × {room.dimensions?.height}m</span>
      </div>

      {!isTemplate && !readOnly && (
        <div className="dw-prop-group">
          <span className="dw-prop-label">Edit Dimensions</span>
          {['width','length','height'].map(dim => (
            <div key={dim} className="dw-dim-row">
              <label className="dw-dim-label">{dim[0].toUpperCase()+dim.slice(1)}</label>
              <input type="number" min="1" max="200" step="0.1" value={localDims[dim]}
                onChange={e => setLocalDims(p=>({...p,[dim]:Number(e.target.value)}))}
                className="dw-dim-input"/>
              <span className="dw-dim-unit">m</span>
            </div>
          ))}
        </div>
      )}

      <div className="dw-prop-group">
        <span className="dw-prop-label">Wall Color</span>
        <div className="dw-color-swatches">
          {(room.wallColors||[room.wallColor]).filter(Boolean).map(c => (
            <button key={c}
              className={`dw-swatch ${(room.wallColor===c||room.activeWallColor===c)?'active':''}`}
              style={{backgroundColor:c}}
              onClick={() => !readOnly && onUpdate({wallColor:c,activeWallColor:c})}
              disabled={readOnly}/>
          ))}
        </div>
        {!isTemplate && !readOnly && (
          <div className="dw-color-pick-free">
            <input type="color" value={room.wallColor||'#F5F5F0'}
              onChange={e => onUpdate({wallColor:e.target.value,activeWallColor:e.target.value})}/>
            <span className="dw-color-pick-label">Custom color</span>
          </div>
        )}
      </div>

      <div className="dw-prop-group">
        <span className="dw-prop-label">Floor Color</span>
        <div className="dw-color-swatches">
          {(room.floorColors||[room.floorColor]).filter(Boolean).map(c => (
            <button key={c}
              className={`dw-swatch ${(room.floorColor===c||room.activeFloorColor===c)?'active':''}`}
              style={{backgroundColor:c}}
              onClick={() => !readOnly && onUpdate({floorColor:c,activeFloorColor:c})}
              disabled={readOnly}/>
          ))}
        </div>
        {!isTemplate && !readOnly && (
          <div className="dw-color-pick-free">
            <input type="color" value={room.floorColor||'#C8A882'}
              onChange={e => onUpdate({floorColor:e.target.value,activeFloorColor:e.target.value})}/>
            <span className="dw-color-pick-label">Custom color</span>
          </div>
        )}
      </div>

      {!isTemplate && !readOnly && (
        <button className="dw-save-changes-btn" onClick={() => onUpdate({dimensions:localDims})}>
          Save Changes
        </button>
      )}
    </div>
  );
};

const RightPanel = ({ activeTab, setActiveTab, furniture, categories, selectedCat, setSelectedCat,
  onAddFurniture, selectedItem, room, onUpdateRoom, onUpdateItem, onRemoveItem, onRotateItem, readOnly }) => (
  <div className="dw-right-panel">
    <div className="dw-panel-tabs">
      <button className={`dw-panel-tab ${activeTab==='catalog'?'active':''}`} onClick={() => setActiveTab('catalog')}>Catalog</button>
      <button className={`dw-panel-tab ${activeTab==='properties'?'active':''}`} onClick={() => setActiveTab('properties')}>Properties</button>
    </div>
    <div className="dw-panel-body">
      {activeTab==='catalog' && (
        <div className="dw-catalog">
          {readOnly && (
            <div className="dw-readonly-notice">
              <EyeIcon/> View-only mode — editing disabled
            </div>
          )}
          <div className="dw-catalog-header">
            <span className="dw-catalog-title">Furniture</span>
            <select className="dw-cat-select" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="dw-catalog-list">
            {furniture.filter(f => selectedCat==='all'||f.category===selectedCat).map(item => (
              <div key={item._id} className={`dw-catalog-item ${readOnly?'dw-catalog-item-disabled':''}`}
                onClick={() => !readOnly && onAddFurniture(item)} title={readOnly?"View only":"Click to add"}>
                <div className="dw-catalog-img">
                  {item.image2DUrl
                    ? <img src={resolveAssetUrl(item.image2DUrl)} alt={item.name}/>
                    : <div className="dw-catalog-placeholder">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B0B0B0" strokeWidth="1.5">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                      </div>
                  }
                </div>
                <span className="dw-catalog-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab==='properties' && (
        <div className="dw-properties">
          {!selectedItem && !room && <p className="dw-empty-panel">Select a room or furniture item.</p>}
          {selectedItem
            ? <FurnitureProperties item={selectedItem} onUpdate={onUpdateItem}
                onRemove={onRemoveItem} onRotate={onRotateItem} readOnly={readOnly}/>
            : room
              ? <RoomProperties room={room} onUpdate={onUpdateRoom} readOnly={readOnly}/>
              : null
          }
        </div>
      )}
    </div>
  </div>
);

// ─── Main Workspace ───────────────────────────────────────────────────────────
const DesignWorkspace = () => {
  const navigate      = useNavigate();
  const { id }        = useParams();
  const [searchParams]= useSearchParams();

  // mode: 'new' | 'edit' | 'view'
  // viewStart: '2D' | '3D'  (only relevant for view mode)
  const mode      = searchParams.get('mode') || (id ? 'edit' : 'new');
  const viewStart = searchParams.get('view') || '2D';
  const readOnly  = mode === 'view';

  const [viewMode,      setViewMode]      = useState(viewStart);
  const [designName,    setDesignName]    = useState('Untitled Design');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameSaved,     setNameSaved]     = useState(false);
  const nameInputRef = useRef(null);

  const [room,         setRoom]         = useState(null);
  const [placedItems,  setPlacedItems]  = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [collisions,   setCollisions]   = useState(new Set());

  const [zoom,         setZoom]         = useState(100);
  const [history,      setHistory]      = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [showSetupModal, setShowSetupModal] = useState(!id);
  const [showSaveModal,  setShowSaveModal]  = useState(false);
  const [activeTab,      setActiveTab]      = useState('catalog');
  const [furniture,      setFurniture]      = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [selectedCat,    setSelectedCat]    = useState('all');

  const [isSaving,     setIsSaving]     = useState(false);
  const [designId,     setDesignId]     = useState(id || null);
  const [saveStatus,   setSaveStatus]   = useState('');
  const [designStyle,  setDesignStyle]  = useState('');
  const [roomType,     setRoomType]     = useState('');

  // Load furniture catalog
  useEffect(() => {
    listFurniture({ limit: 200 }).then(res => {
      const items = res.data || [];
      setFurniture(items);
      setCategories([...new Set(items.map(f => f.category).filter(Boolean))]);
    }).catch(console.error);
  }, []);

  // Load existing design
  useEffect(() => {
    if (!id) return;
    getDesignById(id).then(res => {
      const d = res.data;
      setDesignName(d.name || 'Untitled Design');
      setDesignStyle(d.designStyle || '');
      setRoomType(d.roomType || '');
      setRoom(d.room || null);
      setPlacedItems(d.placedItems || []);
      setDesignId(d._id);
      setShowSetupModal(false);
      // Switch to correct start view
      setViewMode(viewStart);
    }).catch(console.error);
  }, [id, viewStart]);

  useEffect(() => { setCollisions(checkCollisions(placedItems, room)); }, [placedItems, room]);

  // historyIndex is kept in a ref alongside state so pushHistory never captures stale values
  const historyIndexRef = useRef(-1);

  const pushHistory = useCallback((items) => {
    const snapshot = JSON.stringify(items);
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndexRef.current + 1);
      const next   = [...sliced, snapshot].slice(-50);
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

  const handleNameBlur = () => { setIsEditingName(false); setNameSaved(true); setTimeout(()=>setNameSaved(false),2000); };
  const handleRoomLoaded = (roomData) => {
    setRoom(roomData); setShowSetupModal(false);
    setPlacedItems([]); setSelectedId(null);
    setHistory([]); historyIndexRef.current = -1; setHistoryIndex(-1);
  };

  const handleAddFurniture = (fi) => {
    if (!room) return;
    const bW=fi.dimensions?.width||1, bD=fi.dimensions?.depth||1, bH=fi.dimensions?.height||0.8;
    const newItem = {
      id:`item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      furnitureId:fi._id, name:fi.name, category:fi.category, price:fi.price,
      image2DUrl:fi.image2DUrl, model3DUrl:fi.model3D?.fileUrl||'',
      colors:fi.colors||[], activeColor:fi.colors?.[0]||'#D4B896',
      width:bW, depth:bD, height:bH, baseWidth:bW, baseDepth:bD, baseHeight:bH,
      xM:0.5, yM:0.5, rotation:0, scale:1, shading:fi.shading!==false,
    };
    const updated = [...placedItems, newItem];
    setPlacedItems(updated); pushHistory(updated);
    setSelectedId(newItem.id); setActiveTab('properties');
  };

  const handleMoveItem = useCallback((itemId, xM, yM, rotation) => {
    setPlacedItems(prev => prev.map(item =>
      item.id===itemId ? {...item, xM, yM, ...(rotation!=null?{rotation}:{})} : item
    ));
  }, []);

  const handleMoveItem3D = useCallback((itemId, xM, yM) => {
    setPlacedItems(prev => prev.map(item => item.id===itemId ? {...item,xM,yM} : item));
  }, []);

  const handleUpdateItem = (itemId, updates) => {
    setPlacedItems(prev => {
      const updated = prev.map(item => item.id===itemId?{...item,...updates}:item);
      pushHistory(updated); return updated;
    });
  };

  const handleRemoveItem = (itemId) => {
    setPlacedItems(prev => { const u=prev.filter(i=>i.id!==itemId); pushHistory(u); return u; });
    setSelectedId(null); setActiveTab('catalog');
  };

  const handleRotateItem = (itemId) => {
    setPlacedItems(prev => {
      const updated = prev.map(item => item.id===itemId?{...item,rotation:((item.rotation||0)+90)%360}:item);
      pushHistory(updated); return updated;
    });
  };

  const handleUpdateRoom = (updates) => {
    setRoom(prev => {
      const next = {...prev,...updates};
      if (updates.dimensions) next.dimensions = {...(prev?.dimensions||{}),...updates.dimensions};
      return next;
    });
  };

  // ── Save flow — opens modal first ──
  const handleSaveClick = () => {
    if (!room) return alert('Please add a room before saving.');
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async (formData) => {
    try {
      setIsSaving(true);
      const payload = {
        name:        formData.name,
        clientName:  formData.clientName,
        status:      formData.status,
        isFinalized: formData.isFinalized,
        designStyle: formData.designStyle || '',
        roomType:    formData.roomType    || '',
        room,
        placedItems,
      };
      if (mode === 'edit' && designId) {
        // Edit mode: update in place then go to library
        await updateDesign(designId, payload);
        setDesignName(formData.name);
        setDesignStyle(formData.designStyle || '');
        setRoomType(formData.roomType || '');
        setShowSaveModal(false);
        navigate('/admin/design-library');
      } else {
        // New design: create then go to library
        const res = await createDesign(payload);
        setDesignId(res.data._id);
        setDesignName(formData.name);
        setDesignStyle(formData.designStyle || '');
        setRoomType(formData.roomType || '');
        setShowSaveModal(false);
        navigate('/admin/design-library');
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // ── "Save Changes" for edit mode — opens modal so designer can update metadata ──
  const handleSaveChanges = () => { setShowSaveModal(true); };

  const selectedItem = placedItems.find(i => i.id===selectedId) || null;
  const orbitRef = useRef(null);
  const camPos = room
    ? [room.dimensions?.width||4, (room.dimensions?.height||2.8)*1.3, room.dimensions?.length||4]
    : [6,5,8];

  return (
    <div className="dw-root">
      {/* ── Top bar ── */}
      <div className="dw-topbar">
        <div className="dw-topbar-left">
          {/* Back to library */}
          <button className="dw-back-btn" onClick={() => navigate('/admin/design-library')} title="Back to Design Library">
            <BackIcon/>
          </button>

          {readOnly ? (
            // View mode — read-only label
            <div className="dw-view-mode-label">
              <EyeIcon/>
              <span>{designName}</span>
              <span className="dw-readonly-badge">View Only</span>
            </div>
          ) : isEditingName ? (
            <input ref={nameInputRef} className="dw-name-input" value={designName}
              onChange={e => setDesignName(e.target.value)}
              onBlur={handleNameBlur} onKeyDown={e => e.key==='Enter'&&handleNameBlur()} autoFocus/>
          ) : (
            <span className="dw-name-display" onClick={() => setIsEditingName(true)}>{designName}</span>
          )}

          {nameSaved           && <span className="dw-name-saved">name saved</span>}
          {saveStatus==='saved' && <span className="dw-name-saved">✓ Saved</span>}
          {saveStatus==='error' && <span className="dw-name-saved" style={{color:'#EF4444'}}>Save failed</span>}
        </div>

        <div className="dw-topbar-center">
          <div className="dw-view-toggle">
            <button className={`dw-view-btn ${viewMode==='2D'?'active':''}`} onClick={() => setViewMode('2D')}>2D</button>
            <button className={`dw-view-btn ${viewMode==='3D'?'active':''}`} onClick={() => setViewMode('3D')}>3D</button>
          </div>
          {!readOnly && (
            <div className="dw-history-btns">
              <button className="dw-hist-btn" onClick={handleUndo} disabled={historyIndex<=0}><UndoIcon/></button>
              <button className="dw-hist-btn" onClick={handleRedo} disabled={historyIndex>=history.length-1}><RedoIcon/></button>
            </div>
          )}
        </div>

        <div className="dw-topbar-right">
          {/* Choose Room button always visible in edit/new modes */}
          {!readOnly && (
            <button className="dw-btn-choose-room" onClick={() => setShowSetupModal(true)} title="Set or change room">
              <RoomIcon/><span>Choose Room</span>
            </button>
          )}
          {readOnly ? (
            <button className="dw-btn-save" onClick={() => navigate('/admin/design-library')}>
              <BackIcon/><span>Back to Library</span>
            </button>
          ) : mode === 'edit' ? (
            <button className="dw-btn-save" onClick={handleSaveChanges} disabled={isSaving}>
              <SaveIcon/><span>{isSaving?'Saving…':'Save Changes'}</span>
            </button>
          ) : (
            <button className="dw-btn-save" onClick={handleSaveClick} disabled={isSaving}>
              <SaveIcon/><span>Save Design</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="dw-body">
        <div className="dw-canvas-area">
          {viewMode==='2D' && (
            <div className="dw-zoom-controls">
              <button className="dw-zoom-btn" onClick={() => setZoom(z=>Math.min(z+10,200))}><ZoomInIcon/></button>
              <span className="dw-zoom-label">{zoom}%</span>
              <button className="dw-zoom-btn" onClick={() => setZoom(z=>Math.max(z-10,30))}><ZoomOutIcon/></button>
            </div>
          )}
          {readOnly && (
            <div className="dw-readonly-banner">
              <EyeIcon/> View-only mode — changes are not saved
            </div>
          )}

          <div className="dw-canvas-scroll">
            {viewMode==='2D' ? (
              <Canvas2D
                room={room} placedItems={placedItems} selectedId={selectedId}
                onSelectItem={itemId => { setSelectedId(itemId); setActiveTab('properties'); }}
                onMoveItem={handleMoveItem}
                onCanvasClick={() => { setSelectedId(null); if(room) setActiveTab('properties'); }}
                zoom={zoom} collisions={collisions} readOnly={readOnly}
              />
            ) : (
              <div className="dw-canvas-3d-wrap">
                {room
                  ? <>
                      <Canvas shadows camera={{position:camPos,fov:46}}
                        gl={{
                          antialias: true,
                          toneMapping: ACESFilmicToneMapping,
                          toneMappingExposure: 1.06,
                        }}>
                        <Scene3D room={room} placedItems={placedItems} selectedId={selectedId}
                          collisions={collisions}
                          onSelectItem={itemId => { setSelectedId(itemId||null); setActiveTab('properties'); }}
                          onMoveItem3D={handleMoveItem3D} readOnly={readOnly} orbitRef={orbitRef}/>
                      </Canvas>
                      {/* 3D zoom controls overlay */}
                      <div className="dw-zoom-controls dw-zoom-3d">
                        <button className="dw-zoom-btn" title="Zoom In"
                          onClick={() => { orbitRef.current?.dollyIn(1.2); orbitRef.current?.update(); }}>
                          <ZoomInIcon/>
                        </button>
                        <button className="dw-zoom-btn" title="Zoom Out"
                          onClick={() => { orbitRef.current?.dollyOut(1.2); orbitRef.current?.update(); }}>
                          <ZoomOutIcon/>
                        </button>
                      </div>
                    </>
                  : <div className="dw-canvas-empty"><p>No room loaded.</p></div>
                }
              </div>
            )}
          </div>


        </div>

        <RightPanel
          activeTab={activeTab} setActiveTab={setActiveTab}
          furniture={furniture} categories={categories}
          selectedCat={selectedCat} setSelectedCat={setSelectedCat}
          onAddFurniture={handleAddFurniture}
          selectedItem={selectedItem} room={room}
          onUpdateRoom={handleUpdateRoom}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          onRotateItem={handleRotateItem}
          readOnly={readOnly}
        />
      </div>

      {/* ── Modals ── */}
      {showSetupModal && !readOnly && (
        <RoomSetupModal onRoomLoaded={handleRoomLoaded} onClose={() => setShowSetupModal(false)}/>
      )}

      {showSaveModal && (
        <SaveDesignModal
          designName={designName}
          designStyle={designStyle}
          roomType={roomType}
          room={room}
          placedItems={placedItems}
          onConfirm={handleSaveConfirm}
          onClose={() => setShowSaveModal(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default DesignWorkspace;