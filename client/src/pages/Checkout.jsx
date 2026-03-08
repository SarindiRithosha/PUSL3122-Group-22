import React, { useState, useEffect } from 'react';
import '../styles/Checkout.css';

// very simple cart helper that uses localStorage; you can replace this
// with a context/provider or network call once you have a backend.
const loadCart = () => {
  try {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCart = items => {
  localStorage.setItem('cart', JSON.stringify(items));
};

const Checkout = () => {
  const [cartItems, setCartItems] = useState(loadCart);
  const [showModal, setShowModal] = useState(false);
  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const increment = id => {
    setCartItems(items =>
      items.map(i =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decrement = id => {
    setCartItems(items =>
      items
        .map(i =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
        )
        .filter(i => i.quantity > 0)
    );
  };

  const removeItem = id => {
    setCartItems(items => items.filter(i => i.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const tax = +(subtotal * 0.08).toFixed(2);
  const shippingCost = subtotal > 0 ? 0 : 0;
  const total = +((subtotal + tax + shippingCost).toFixed(2));

  const placeOrder = () => {
    if (cartItems.length === 0) return;
    setShowModal(true);
  };

  const handleConfirm = () => {
    // Here you could send shipping info to a server
    alert(`Order placed!\nName: ${shipping.name}`);
    setCartItems([]);
    setShowModal(false);
    setShipping({ name: '', email: '', address: '', city: '', zip: '' });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setShipping(s => ({ ...s, [name]: value }));
  };

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <p className="subtitle">Your Items ({itemCount})</p>
      <div className="checkout-content">
        <div className="items-list">
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map(item => (
              <div className="checkout-item" key={item.id}>
                <div className="item-info">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>LKR {item.price.toLocaleString()} each</p>
                  </div>
                </div>
                <div className="item-controls">
                  <button onClick={() => decrement(item.id)}>-</button>
                  <span className="quantity">{item.quantity}</span>
                  <button onClick={() => increment(item.id)}>+</button>
                  <span className="item-total">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    className="remove"
                    onClick={() => removeItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

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
            <span>{shippingCost === 0 ? 'Free' : `LKR ${shippingCost.toLocaleString()}`}</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span>LKR {total.toLocaleString()}</span>
          </div>
          <button className="place-order" onClick={placeOrder}>
            Place Order
          </button>
          <p className="note">
            Free delivery on all orders. 30‑day returns.
          </p>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Shipping Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <label>Full Name</label>
                <input
                  name="name"
                  value={shipping.name}
                  onChange={handleChange}
                />
                <label>Email</label>
                <input
                  name="email"
                  value={shipping.email}
                  onChange={handleChange}
                />
              </div>
              <div className="field-single">
                <label>Address</label>
                <input
                  name="address"
                  value={shipping.address}
                  onChange={handleChange}
                />
              </div>
              <div className="field-row">
                <label>City</label>
                <input
                  name="city"
                  value={shipping.city}
                  onChange={handleChange}
                />
                <label>ZIP Code</label>
                <input
                  name="zip"
                  value={shipping.zip}
                  onChange={handleChange}
                />
              </div>
              <button className="confirm-order" onClick={handleConfirm}>
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
