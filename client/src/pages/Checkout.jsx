import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { resolveAssetUrl } from '../services/customerApi';
import { createOrder } from '../services/orderApi';
import { FaTrash } from 'react-icons/fa';
import '../styles/Checkout.css';
import '../styles/CartToast.css';

const Checkout = () => {
  const { cartItems, incrementItem, decrementItem, removeItem, clearCart, getCartTotal, getCartCount } = useCart();
  const { customer } = useCustomerAuth();
  const [showModal,        setShowModal]        = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [shipping, setShipping] = useState({
    name: '', email: '', address: '', city: '', zip: '',
  });

  // Auto-fill shipping from logged-in customer
  useEffect(() => {
    if (customer) {
      setShipping({
        name:    customer.name                  || '',
        email:   customer.email                 || '',
        address: customer.address?.street       || '',
        city:    customer.address?.city         || '',
        zip:     customer.address?.postalCode   || '',
      });
    }
  }, [customer]);

  // Auto-hide success toast
  useEffect(() => {
    if (!showSuccessToast) return;
    const t = setTimeout(() => setShowSuccessToast(false), 3000);
    return () => clearTimeout(t);
  }, [showSuccessToast]);

  const subtotal     = getCartTotal();
  const tax          = +(subtotal * 0.08).toFixed(2);
  const shippingCost = 0;
  const total        = +((subtotal + tax + shippingCost).toFixed(2));

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          furnitureId:   item.id,
          name:          item.name,
          image2DUrl:    item.image2DUrl    || '',
          price:         item.price,
          quantity:      item.quantity,
          selectedColor: item.selectedColor || '',
          subtotal:      item.price * item.quantity,
        })),
        shipping: { name: shipping.name, email: shipping.email, address: shipping.address, city: shipping.city, zip: shipping.zip },
        subtotal, tax, shippingCost, total,
      };
      const response = await createOrder(orderData);
      if (response.success) {
        clearCart();
        setShowModal(false);
        setShowSuccessToast(true);
        setShipping({ name: '', email: '', address: '', city: '', zip: '' });
      } else {
        alert(response.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      alert(error.message || 'Failed to place order. Please check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setShipping(s => ({ ...s, [name]: value }));
  };

  const itemCount = getCartCount();

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <p className="subtitle">Your Items ({itemCount})</p>

      <div className="checkout-content">
        {/* ── Item list ── */}
        <div className="items-list">
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map(item => (
              <div className="checkout-item" key={`${item.id}-${item.selectedColor || 'default'}`}>
                <div className="item-info">
                  <div className="item-image">
                    {item.image2DUrl ? (
                      <img src={resolveAssetUrl(item.image2DUrl)} alt={item.name}/>
                    ) : (
                      <div className="image-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                          stroke="#C8B89A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="9" width="20" height="11" rx="2"/>
                          <path d="M6 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/>
                          <path d="M2 15h20"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    {item.selectedColor && (
                      <p style={{ fontSize:'0.85rem', color:'#666', marginBottom:'4px' }}>
                        Color:&nbsp;
                        <span style={{
                          display:'inline-block', width:'14px', height:'14px',
                          backgroundColor: item.selectedColor,
                          border:'1px solid #ddd', borderRadius:'3px',
                          verticalAlign:'middle', marginLeft:'4px',
                        }}/>
                      </p>
                    )}
                    <p>LKR {item.price.toLocaleString()} each</p>
                  </div>
                </div>

                <div className="item-controls">
                  <button onClick={() => decrementItem(item.id, item.selectedColor)}>−</button>
                  <span className="quantity">{item.quantity}</span>
                  <button onClick={() => incrementItem(item.id, item.selectedColor)}>+</button>
                  <span className="item-total">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                  {/* Red trash icon — react-icons, no material-icons */}
                  <button
                    className="remove"
                    onClick={() => removeItem(item.id, item.selectedColor)}
                    aria-label="Remove item"
                  >
                    <FaTrash/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Order summary ── */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="row">
            <span>Subtotal</span>
            <span>LKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="row">
            <span>Tax (8%)</span>
            <span>LKR {tax.toLocaleString()}</span>
          </div>
          <div className="row">
            <span>Shipping</span>
            <span style={{ color:'#30A114' }}>
              {shippingCost === 0 ? 'Free' : `LKR ${shippingCost.toLocaleString()}`}
            </span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>LKR {total.toLocaleString()}</span>
          </div>
          <button className="place-order" onClick={() => cartItems.length > 0 && setShowModal(true)}>
            Place Order
          </button>
          <p className="note">Free delivery on all orders. 30‑day returns.</p>
        </div>
      </div>

      {/* ── Shipping modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Shipping Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field-group">
                  <label>Full Name</label>
                  <input name="name" value={shipping.name} onChange={handleChange} placeholder="Enter your full name"/>
                </div>
                <div className="field-group">
                  <label>Email</label>
                  <input type="email" name="email" value={shipping.email} onChange={handleChange} placeholder="Enter your email"/>
                </div>
              </div>
              <div className="field-group" style={{ marginBottom:'1rem' }}>
                <label>Address</label>
                <input name="address" value={shipping.address} onChange={handleChange} placeholder="Enter your address"/>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>City</label>
                  <input name="city" value={shipping.city} onChange={handleChange} placeholder="Enter your city"/>
                </div>
                <div className="field-group">
                  <label>ZIP Code</label>
                  <input name="zip" value={shipping.zip} onChange={handleChange} placeholder="Enter ZIP code"/>
                </div>
              </div>
              <button
                className="confirm-order"
                onClick={handleConfirm}
                disabled={isSubmitting || !shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.zip}
              >
                {isSubmitting ? 'Processing…' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success toast ── */}
      {showSuccessToast && (
        <div className="cart-toast">
          <div className="cart-toast-content">
            <svg className="cart-toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span className="cart-toast-message">Order placed successfully!</span>
          </div>
          <button className="cart-toast-close" onClick={() => setShowSuccessToast(false)} aria-label="Close">✕</button>
        </div>
      )}
    </div>
  );
};

export default Checkout;