import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listPublishedDesigns } from "../services/customerApi";
import "../styles/DesignCatalog.css";

// ── localStorage wishlist helpers ─────────────────────────────────────────────
const WL_KEY = "furniplan_wishlist_designs";
const loadWL  = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || "{}"); } catch { return {}; } };
const saveWL  = (wl) => { try { localStorage.setItem(WL_KEY, JSON.stringify(wl)); } catch {} };

// ── Room preview (SVG) ────────────────────────────────────────────────────────
const RoomPreview = ({ floorColor, wallColor, shape }) => {
  const fc = floorColor || "#C8A882";
  const wc = wallColor  || "#8B7355";
  if (shape === "L-Shape") {
    return (
      <svg width="100%" height="100%" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,10 110,10 110,60 60,60 60,110 10,110" fill={fc} stroke={wc} strokeWidth="4"/>
        <polygon points="10,10 110,10 110,60 60,60 60,110 10,110" fill="none" stroke={wc} strokeWidth="2" opacity="0.4"/>
      </svg>
    );
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="100" height="100" rx="4" fill={fc} stroke={wc} strokeWidth="4"/>
      {[30,50,70,90].map(x => <line key={`v${x}`} x1={x} y1="10" x2={x} y2="110" stroke={wc} strokeWidth="0.5" opacity="0.3"/>)}
      {[30,50,70,90].map(y => <line key={`h${y}`} x1="10" y1={y} x2="110" y2={y} stroke={wc} strokeWidth="0.5" opacity="0.3"/>)}
      <rect x="18" y="18" width="30" height="18" rx="3" fill={wc} opacity="0.25"/>
      <rect x="52" y="18" width="20" height="14" rx="2" fill={wc} opacity="0.18"/>
      <rect x="76" y="70" width="34" height="24" rx="3" fill={wc} opacity="0.2"/>
    </svg>
  );
};

// ── Heart icons (inline SVG — replaces material-icons) ────────────────────────
const HeartFilled = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill="currentColor" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const HeartOutline = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const THEMES = ["All Themes","Scandinavian","Minimalist","Industrial","Modern","Traditional","Bohemian","Contemporary","Coastal","Rustic","Art Deco","Other"];
const ROOMS  = ["All Rooms","Living Room","Bedroom","Office","Kitchen","Dining Room","Bathroom","Kids Room","Hallway","Balcony","Studio","Other"];

const DesignCatalog = () => {
  const [theme,   setTheme]   = useState("All Themes");
  const [room,    setRoom]    = useState("All Rooms");
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist,setWishlist]= useState(loadWL);

  // Fetch published designs — no admin token needed
  useEffect(() => {
    setLoading(true);
    listPublishedDesigns()
      .then(res => setDesigns(res.data || []))
      .catch(err => console.error("DesignCatalog fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Client-side filter (server already enforces Published)
  const filtered = designs.filter(d =>
    (theme === "All Themes" || d.designStyle === theme) &&
    (room  === "All Rooms"  || d.roomType    === room)
  );

  const toggleWishlist = (e, design) => {
    e.preventDefault();
    setWishlist(prev => {
      const next = { ...prev };
      if (next[design._id]) {
        delete next[design._id];
      } else {
        // Store enough fields for Myaccount.jsx favorites card to render
        next[design._id] = {
          _id:         design._id,
          name:        design.name,
          designStyle: design.designStyle || "",
          roomType:    design.roomType    || "",
          room: {
            shape:            design.room?.shape,
            floorColor:       design.room?.floorColor,
            activeFloorColor: design.room?.activeFloorColor,
            wallColor:        design.room?.wallColor,
            activeWallColor:  design.room?.activeWallColor,
          },
        };
      }
      saveWL(next);
      return next;
    });
  };

  return (
    <div className="design-catalog-page">
      <h1>Design Gallery</h1>
      <p className="tagline">Browse professionally curated room designs and try them out</p>

      <div className="filters">
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={room} onChange={e => setRoom(e.target.value)}>
          {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="design-grid">
        {loading ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"3rem", color:"#666" }}>
            Loading designs…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"3rem", color:"#666" }}>
            {designs.length === 0
              ? "No published designs available yet"
              : "No designs match your filters"}
          </div>
        ) : (
          filtered.map(design => (
            <Link
              key={design._id}
              to={`/workspace/design/${design._id}`}
              className="design-card"
              style={{ textDecoration:"none", color:"inherit" }}
            >
              {/* Room thumbnail */}
              <div className="design-image" style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                padding:"20px", background:"#f5f5f5",
              }}>
                <RoomPreview
                  floorColor={design.room?.activeFloorColor || design.room?.floorColor}
                  wallColor={design.room?.activeWallColor  || design.room?.wallColor}
                  shape={design.room?.shape}
                />
              </div>

              {/* Card info */}
              <div className="design-info">
                <div className="design-header">
                  <h3 className="design-card-title">{design.name}</h3>
                  <button
                    className={`fav-btn ${wishlist[design._id] ? "active" : ""}`}
                    onClick={e => toggleWishlist(e, design)}
                    aria-label={wishlist[design._id] ? "Remove from favorites" : "Add to favorites"}
                  >
                    {wishlist[design._id] ? <HeartFilled/> : <HeartOutline/>}
                  </button>
                </div>
                <p className="design-desc">
                  {design.clientName || `${design.room?.name || "Custom"} design`}
                </p>
                <div className="design-tags">
                  {design.designStyle && <span className="tag">{design.designStyle}</span>}
                  {design.roomType    && <span className="tag room-tag">{design.roomType}</span>}
                  <span className="tag items-tag">
                    {design.itemCount ?? design.placedItems?.length ?? 0} items
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default DesignCatalog;