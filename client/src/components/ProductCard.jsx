import React, { useState } from 'react';
import '../styles/ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  const { name, price, category, image } = product;
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <div className="placeholder">
            <span className="material-icons" style={{ fontSize: 48, color: '#ccc' }}>
              inventory_2
            </span>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <div className="price-row">
          <span className="product-price">LKR {price.toLocaleString()}</span>
          <span className="remove-btn">Clear</span>
        </div>
      </div>
      <div className="product-footer">
        <button className="add-to-cart" onClick={() => onAddToCart(product)}>
          <span className="material-icons">shopping_cart</span>
          Add to cart
        </button>
        <button className="fav-btn" onClick={handleFavorite}>
          <span className="material-icons">{isFavorite ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
