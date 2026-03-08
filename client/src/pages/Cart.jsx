import React from 'react';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';

const Cart = ({ isOpen, onClose, cartItems, onIncrement, onDecrement, onRemove }) => {
  const navigate = useNavigate();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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
              <div className="drawer-cart-item" key={item.id}>
                <div className="item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="image-placeholder">📦</div>
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">LKR {item.price.toLocaleString()}</p>
                  <div className="item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => onDecrement(item.id)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => onIncrement(item.id)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <div className="item-total">
                  <p>LKR {(item.price * item.quantity).toLocaleString()}</p>
                  <button 
                    className="remove-btn"
                    onClick={() => onRemove(item.id)}
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