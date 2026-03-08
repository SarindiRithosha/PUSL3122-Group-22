import React, { useState } from "react";
import "../styles/FurnitureCatalog.css";
import { FaSearch, FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";

const products = Array(12).fill({
  name: "Nordic Oak Chair",
  price: "LKR 32,000",
  category: "Chair",
});

export default function FurnitureCatalog() {
  const [wishlist, setWishlist] = useState({});

  const toggleWishlist = (index) => {
    setWishlist(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="catalog-container">
      <header className="catalog-header">
        <h2>Furniture Catalog</h2>
        <p>Discover pieces crafted for your perfect room</p>
      </header>

      <div className="catalog-controls">
        <div className="search-box">
          <FaSearch className="icon" />
          <input type="text" placeholder="Search furniture..." />
        </div>

        <select>
          <option>All Categories</option>
          <option>Chair</option>
          <option>Table</option>
          <option>Sofa</option>
        </select>

        <select>
          <option>Newest</option>
          <option>Price Low</option>
          <option>Price High</option>
        </select>
      </div>

      <div className="product-grid">
        {products.map((item, index) => (
          <div className="product-card" key={index}>
            <div className="product-image">
              📦
            </div>

            <h4>{item.name}</h4>

            <div className="product-info">
              <span className="price">{item.price}</span>
              <span className="category">{item.category}</span>
            </div>

            <div className="product-actions">
              <button className="cart-btn">
                <FaShoppingCart /> Add to Cart
              </button>

              <button 
                className={`wish-btn ${wishlist[index] ? 'active' : ''}`}
                onClick={() => toggleWishlist(index)}
                aria-label="Add to wishlist"
              >
                {wishlist[index] ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}