import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPublishedFurniture, listPublishedDesigns, resolveAssetUrl } from "../services/customerApi";
import "../styles/Home.css";

// ── Mini room thumbnail (SVG, no external images) ─────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────────────
const Home = () => {
  const [featuredDesigns,  setFeaturedDesigns]  = useState([]);
  const [popularFurniture, setPopularFurniture] = useState([]);
  const [loading,          setLoading]          = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const [designsRes, furnitureRes] = await Promise.all([
          listPublishedDesigns(),                              // /api/public/designs
          listPublishedFurniture({ limit: 8, sort: "newest" }), // /api/public/furniture
        ]);
        if (cancelled) return;
        setFeaturedDesigns((designsRes.data  || []).slice(0, 6));
        setPopularFurniture(furnitureRes.data || []);
      } catch (err) {
        console.error("Home: failed to load published content:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const testimonials = [
    { id:1, text:'"FurniPlan helped me visualize my living room perfectly. Ordered three pieces and they fit exactly as planned!"', name:"Emma S." },
    { id:2, text:'"FurniPlan helped me visualize my living room perfectly. Ordered three pieces and they fit exactly as planned!"', name:"Emma S." },
    { id:3, text:'"FurniPlan helped me visualize my living room perfectly. Ordered three pieces and they fit exactly as planned!"', name:"Emma S." },
  ];

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-tag">
              <img src="/images/hero-tag.png" alt="" style={{ width:"20px", height:"20px" }}/>
              <span>Design Your Perfect Space</span>
            </div>
            <h1 className="hero-title">
              Furnish Your<br/>
              <span className="hero-title-accent">Dream Room</span>
            </h1>
            <p className="hero-description">
              Explore curated furniture collections and visualize them<br/>
              in your room with our immersive 3D/AR planner.
            </p>
            <div className="hero-buttons">
              <Link to="/furniture" className="btn btn-primary" style={{ borderRadius:"15px" }}>
                Browse Catalog
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft:"8px" }}>
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/design" className="btn btn-secondary" style={{ borderRadius:"15px" }}>View Designs</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/hero-furniture.png" alt="3D Furniture Visualization"/>
          </div>
        </div>
      </section>

      {/* ── How to Start ── */}
      <section className="how-to-start-section">
        <h2 className="section-title">How to Start</h2>
        <p className="section-subtitle">Three simple steps to your dream interior</p>
        <div className="steps-container">
          {[
            { img:"step1.png", num:"01", title:"Select Template",  body:"Select a room template of your own room measurements to get started." },
            { img:"step2.png", num:"02", title:"Choose Furniture", body:"Browse our curated catalog and add your favorite pieces to the room." },
            { img:"step3.png", num:"03", title:"Visualize",        body:"See your design come to life in real-time 2D and 3D views." },
          ].map(s => (
            <div className="step-card" key={s.num}>
              <div className="step-icon">
                <img src={`/images/${s.img}`} alt={s.title} style={{ width:"45px", height:"45px" }}/>
              </div>
              <div className="step-number">{s.num}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-description">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Designs (Published only) ── */}
      <div style={{ backgroundColor:"#ffffff" }}>
        <section className="featured-designs-section">
          <div className="section-header" style={{ marginBottom:"1px" }}>
            <div>
              <h2 className="section-title" style={{ fontSize:"29px" }}>Featured Designs</h2>
              <p className="section-subtitle">Curated room designs by our professional designers</p>
            </div>
            <Link to="/design" className="view-all-link" style={{ color:"#000000", fontWeight:500 }}>
              View All <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:"50px", color:"#666" }}>Loading designs…</div>
          ) : featuredDesigns.length === 0 ? (
            <div style={{ textAlign:"center", padding:"50px", color:"#666" }}>No published designs yet</div>
          ) : (
            <div className="designs-grid">
              {featuredDesigns.map(design => (
                <Link
                  key={design._id}
                  to={`/workspace/design/${design._id}`}
                  className="design-card"
                  style={{ borderRadius:"20px", textDecoration:"none", color:"inherit" }}
                >
                  <div className="design-image" style={{
                    background:"#f5f5f5", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    padding:"20px", minHeight:"200px",
                  }}>
                    <RoomPreview
                      floorColor={design.room?.activeFloorColor || design.room?.floorColor}
                      wallColor={design.room?.activeWallColor  || design.room?.wallColor}
                      shape={design.room?.shape}
                    />
                  </div>
                  <div className="design-info">
                    <h3 className="design-name">{design.name}</h3>
                    <div className="design-tags" style={{ gap:"15px" }}>
                      {design.designStyle && <span className="design-tag">{design.designStyle}</span>}
                      {design.roomType    && <span className="design-tag" style={{ backgroundColor:"#FFF6E0", color:"#000000" }}>{design.roomType}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Popular Furniture (Published only) ── */}
      <section className="popular-furniture-section">
        <div className="section-header" style={{ marginBottom:"1px" }}>
          <div>
            <h2 className="section-title" style={{ fontSize:"29px" }}>Popular Furniture</h2>
            <p className="section-subtitle">Handpicked pieces for your space</p>
          </div>
          <Link to="/furniture" className="view-all-link" style={{ color:"#000000", fontWeight:500 }}>
            View All <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"50px", color:"#666" }}>Loading furniture…</div>
        ) : popularFurniture.length === 0 ? (
          <div style={{ textAlign:"center", padding:"50px", color:"#666" }}>No published furniture yet</div>
        ) : (
          <div className="furniture-grid">
            {popularFurniture.map(item => (
              <Link
                key={item._id}
                to={`/furniture/${item._id}`}
                className="furniture-card"
                style={{ borderRadius:"20px", textDecoration:"none" }}
              >
                <div className="furniture-image" style={{ background:"#d9d9d9", position:"relative", overflow:"hidden" }}>
                  {item.image2DUrl ? (
                    <img
                      src={resolveAssetUrl(item.image2DUrl)}
                      alt={item.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover" }}
                      onError={e => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<img src="/images/featured-design.png" alt="" style="width:50px;height:50px"/>';
                      }}
                    />
                  ) : (
                    <img src="/images/featured-design.png" alt="" style={{ width:"50px", height:"50px" }}/>
                  )}
                </div>
                <div className="furniture-info">
                  <h3 className="furniture-name">{item.name}</h3>
                  <div className="furniture-footer">
                    <span className="furniture-price">LKR {item.price.toLocaleString()}</span>
                    <span className="furniture-category" style={{ border:"1px solid #c3c3c3" }}>{item.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Testimonials (static — unchanged) ── */}
      <section className="testimonials-section">
        <h2 className="testimonials-title">What Our Customers Say</h2>
        <p className="testimonials-subtitle">Trusted by thousands of home enthusiasts</p>
        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.id} className="testimonial-card">
              <div className="testimonial-stars">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <span className="avatar-initial">{t.name.charAt(0)}</span>
                </div>
                <span className="author-name">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;