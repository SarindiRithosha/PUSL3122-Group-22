import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";
import { listPublishedFurniture, resolveAssetUrl } from "../services/customerApi";
import { useCart } from "../contexts/CartContext";
import "../styles/FurnitureCatalog.css";

// ── localStorage wishlist helpers 
const WL_KEY = "furniplan_wishlist_furniture";
const loadWL  = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || "{}"); } catch { return {}; } };
const saveWL  = (wl) => { try { localStorage.setItem(WL_KEY, JSON.stringify(wl)); } catch {} };

// Inline sofa placeholder — no emoji
const SofaIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
    stroke="#C8B89A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="9" width="20" height="11" rx="2"/>
    <path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/>
    <path d="M2 15h20"/>
  </svg>
);

export default function FurnitureCatalog() {
  const { addToCart } = useCart();

  const [wishlist,         setWishlist]         = useState(loadWL);
  const [furniture,        setFurniture]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy,           setSortBy]           = useState("newest");

  useEffect(() => {
    setLoading(true);
    const sort =
      sortBy === "priceHigh" ? "price_desc" :
      sortBy === "priceLow"  ? "price_asc"  : "newest";

    listPublishedFurniture({ limit: 200, sort })
      .then(res => setFurniture(res.data || []))
      .catch(err => console.error("FurnitureCatalog fetch error:", err))
      .finally(() => setLoading(false));
  }, [sortBy]);

  // Toggle wishlist and persist immediately
  const toggleWishlist = (e, item) => {
    e.preventDefault();
    setWishlist(prev => {
      const next = { ...prev };
      if (next[item._id]) {
        delete next[item._id];
      } else {
        next[item._id] = {
          _id:        item._id,
          name:       item.name,
          price:      item.price,
          category:   item.category,
          image2DUrl: item.image2DUrl || "",
        };
      }
      saveWL(next);
      return next;
    });
  };

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    addToCart(item, 1, null);
  };

  // Client-side filter (server already enforces Published status)
  const filtered = furniture.filter(item => {
    const matchSearch   = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const categories = ["All Categories", ...new Set(furniture.map(i => i.category).filter(Boolean))];

  return (
    <div className="catalog-container">
      <header className="catalog-header">
        <h2>Furniture Catalog</h2>
        <p>Discover pieces crafted for your perfect room</p>
      </header>

      <div className="catalog-controls">
        <div className="search-box">
          <FaSearch className="icon"/>
          <input
            type="text"
            placeholder="Search furniture..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </div>

      <div className="product-grid">
        {loading ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"3rem", color:"#666" }}>
            Loading furniture…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"3rem", color:"#666" }}>
            {furniture.length === 0
              ? "No published furniture available yet"
              : "No furniture matches your search"}
          </div>
        ) : (
          filtered.map(item => (
            <Link
              key={item._id}
              to={`/furniture/${item._id}`}
              className="product-card"
              style={{ textDecoration:"none", color:"inherit" }}
            >
              {/* Image */}
              <div className="product-image" style={{
                background:"#f5f5f5",
                display:"flex", alignItems:"center", justifyContent:"center",
                overflow:"hidden",
              }}>
                {item.image2DUrl ? (
                  <img
                    src={resolveAssetUrl(item.image2DUrl)}
                    alt={item.name}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <SofaIcon/>
                )}
              </div>

              <h4>{item.name}</h4>

              <div className="product-info">
                <span className="price">LKR {item.price.toLocaleString()}</span>
                <span className="category">{item.category}</span>
              </div>

              <div className="product-actions">
                <button className="cart-btn" onClick={e => handleAddToCart(e, item)}>
                  <FaShoppingCart/> Add to Cart
                </button>
                <button
                  className={`wish-btn ${wishlist[item._id] ? "active" : ""}`}
                  onClick={e => toggleWishlist(e, item)}
                  aria-label={wishlist[item._id] ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {wishlist[item._id] ? <FaHeart/> : <FaRegHeart/>}
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}