import React from 'react';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { resolveAssetUrl } from '../services/customerApi';
import '../styles/Cart.css';

const Cart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, incrementItem, decrementItem, removeItem, getCartTotal } = useCart();

  const subtotal = getCartTotal();

  const handleCheckout = () => {
    onClose(); // Close the drawer
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`cart-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      ></div>

      {/* Cart Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>
            <FaShoppingCart /> Your Cart ({cartItems.length})
          </h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div className="drawer-cart-item" key={`${item.id}-${item.selectedColor || 'default'}`}>
                <div className="item-image">
                  {item.image2DUrl ? (
                    <img src={resolveAssetUrl(item.image2DUrl)} alt={item.name} />
                  ) : (
                    <div className="image-placeholder">📦</div>
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  {item.selectedColor && (
                    <p className="item-color" style={{ fontSize: '0.85rem', color: '#666' }}>
                      Color: <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: item.selectedColor, 
                        border: '1px solid #ddd',
                        borderRadius: '2px',
                        verticalAlign: 'middle',
                        marginLeft: '4px'
                      }}></span>
                    </p>
                  )}
                  <p className="item-price">LKR {item.price.toLocaleString()}</p>
                  <div className="item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => decrementItem(item.id, item.selectedColor)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => incrementItem(item.id, item.selectedColor)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <div className="item-total">
                  <p>LKR {(item.price * item.quantity).toLocaleString()}</p>
                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item.id, item.selectedColor)}
                    aria-label="Remove item"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="subtotal">
              <span>Subtotal:</span>
              <span>LKR {subtotal.toLocaleString()}</span>
            </div>
            <button className="checkout-drawer-btn" onClick={handleCheckout}>
              Go to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;