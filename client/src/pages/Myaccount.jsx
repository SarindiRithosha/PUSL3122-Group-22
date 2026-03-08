import React, { useState } from "react";
import { 
  FaHeart, 
  FaRegHeart, 
  FaUser, 
  FaHeart as FaHeartSolid, 
  FaHistory, 
  FaCreditCard, 
  FaSignOutAlt,
  FaTrash,
  FaPlus,
  FaTimes
} from "react-icons/fa";
import "../styles/Myaccount.css";

const Myaccount = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [favTab, setFavTab] = useState("furniture"); // 'furniture' or 'design'
  const [orderTab, setOrderTab] = useState("furniture"); // 'furniture' or 'design'

  const [profile, setProfile] = useState({
    firstName: "Emma",
    lastName: "Smith",
    email: "emma.smith@example.com",
    phone: "+1 (555) 987-6543",
  });

  const [address, setAddress] = useState({
    street: "4521 Maplewood Drive, Apt 4B",
    city: "Seattle",
    state: "WA",
    zip: "98101",
  });

  // Mock consultations data
  const [consultations, setConsultations] = useState([
    { id: 1, date: "2025-05-12", status: "Completed", designer: "Alice" },
    { id: 2, date: "2025-06-01", status: "Scheduled", designer: "Bob" },
  ]);

  // Mock saved furniture (from heart button in furniture catalog)
  const [favoriteFurniture, setFavoriteFurniture] = useState([
    { id: 1, name: "Nordic Oak Chair", price: 32000, category: "Chair", image: "" },
    { id: 2, name: "Minimalist Wooden Table", price: 45000, category: "Table", image: "" },
    { id: 3, name: "Scandinavian Sofa", price: 85000, category: "Sofa", image: "" },
  ]);

  // Mock saved designs (from heart button in design catalog)
  const [favoriteDesigns, setFavoriteDesigns] = useState([
    { id: 1, name: "Scandinavian Living Room", description: "Clean lines and natural materials", theme: "Scandinavian", room: "Living Room", image: "" },
    { id: 2, name: "Minimalist Bedroom", description: "Stripped-back elegance", theme: "Minimalist", room: "Bedroom", image: "" },
  ]);

  // Mock order history - separated by type
  const [furnitureOrders, setFurnitureOrders] = useState([
    { id: 101, date: "2025-02-10", total: 54000, status: "Delivered", items: "Nordic Oak Chair, Minimalist Table" },
    { id: 102, date: "2025-03-05", total: 32000, status: "Processing", items: "Scandinavian Sofa" },
    { id: 105, date: "2025-04-15", total: 78000, status: "Delivered", items: "Wooden Bookshelf, Dining Chair Set" },
  ]);

  const [designOrders, setDesignOrders] = useState([
    { id: 201, date: "2025-01-20", total: 125000, status: "Completed", items: "Scandinavian Living Room Design" },
    { id: 202, date: "2025-03-10", total: 95000, status: "In Progress", items: "Minimalist Bedroom Design" },
  ]);

  // Mock payment methods
  const [payments, setPayments] = useState([
    { id: 1, type: "Visa", last4: "1234", expiry: "12/24" },
    { id: 2, type: "Mastercard", last4: "9876", expiry: "08/25" },
  ]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newCard, setNewCard] = useState({ type: "", number: "", expiry: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState({});

  const validateCard = card => {
    const errors = {};
    if (!card.type) errors.type = 'Required';
    
    // Amex uses 15 digits, others use 16
    const cleanNumber = card.number.replace(/\s/g, '');
    if (card.type === 'Amex') {
      if (!/^\d{15}$/.test(cleanNumber)) errors.number = 'Enter 15 digits for Amex';
    } else {
      if (!/^\d{16}$/.test(cleanNumber)) errors.number = 'Enter 16 digits';
    }
    
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(card.expiry)) errors.expiry = 'MM/YY';
    
    // Amex uses 4-digit CVV, others use 3
    if (card.type === 'Amex') {
      if (!/^\d{4}$/.test(card.cvv)) errors.cvv = '4 digits for Amex';
    } else {
      if (!/^\d{3}$/.test(card.cvv)) errors.cvv = '3 digits';
    }
    
    return errors;
  };

  const isCardValid = () => {
    const errors = validateCard(newCard);
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatNumber = (num, cardType) => {
    const cleaned = num.replace(/\D/g, '');
    
    // Amex format: 4-6-5 (e.g., 3711 123456 12345)
    if (cardType === 'Amex') {
      if (cleaned.length <= 4) return cleaned;
      if (cleaned.length <= 10) return cleaned.slice(0, 4) + ' ' + cleaned.slice(4);
      return cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 10) + ' ' + cleaned.slice(10, 15);
    }
    
    // Standard format: 4-4-4-4
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = () => {
    console.log("Saving profile", profile);
  };

  const saveAddress = () => {
    console.log("Saving address", address);
  };

  const changePassword = () => {
    console.log("Change password");
  };

  const enable2FA = () => {
    console.log("Enable 2FA");
  };

  const deleteAccount = () => {
    console.log("Delete account");
  };

  const toggleFurnitureFavorite = (id) => {
    setFavoriteFurniture(prev => prev.filter(item => item.id !== id));
  };

  const toggleDesignFavorite = (id) => {
    setFavoriteDesigns(prev => prev.filter(item => item.id !== id));
  };

  const deletePayment = (id) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  const openPaymentModal = () => {
    setNewCard({ type: "", number: "", expiry: "", cvv: "" });
    setCardErrors({});
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setNewCard({ type: "", number: "", expiry: "", cvv: "" });
    setCardErrors({});
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === 'number') {
      const maxLength = newCard.type === 'Amex' ? 15 : 16;
      const formatted = formatNumber(value, newCard.type);
      if (formatted.replace(/\s/g, '').length <= maxLength) {
        setNewCard(prev => ({ ...prev, [name]: formatted }));
      }
    } else if (name === 'cvv') {
      const maxLength = newCard.type === 'Amex' ? 4 : 3;
      if (/^\d*$/.test(value) && value.length <= maxLength) {
        setNewCard(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'expiry') {
      let val = value.replace(/\D/g, '');
      if (val.length >= 2) {
        val = val.slice(0, 2) + '/' + val.slice(2, 4);
      }
      if (val.length <= 5) {
        setNewCard(prev => ({ ...prev, [name]: val }));
      }
    } else {
      // If card type changes, reset number and cvv to revalidate
      if (name === 'type') {
        setNewCard(prev => ({ ...prev, [name]: value, number: '', cvv: '' }));
      } else {
        setNewCard(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const addPaymentMethod = () => {
    if (!isCardValid()) return;
    
    const newPayment = {
      id: Date.now(),
      type: newCard.type,
      last4: newCard.number.replace(/\s/g, '').slice(-4),
      expiry: newCard.expiry
    };
    
    setPayments(prev => [...prev, newPayment]);
    closePaymentModal();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <>
            <div className="section personal-information">
              <h2>Personal Information</h2>
              <div className="fields">
                <div className="field">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleProfileChange}
                    type="text"
                  />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleProfileChange}
                    type="text"
                  />
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    type="email"
                    disabled
                  />
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    type="tel"
                  />
                </div>
              </div>
              <button className="btn primary" onClick={saveProfile}>
                Save Changes
              </button>
            </div>

            <div className="section default-shipping-address">
              <h2>Default Shipping Address</h2>
              <div className="fields">
                <div className="field full-width">
                  <label>Street Address</label>
                  <input
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    type="text"
                  />
                </div>
                <div className="field">
                  <label>City</label>
                  <input
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    type="text"
                  />
                </div>
                <div className="field">
                  <label>State / Province</label>
                  <select
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                  >
                    <option value="">Select state</option>
                    <option value="WA">Washington</option>
                    <option value="CA">California</option>
                  </select>
                </div>
                <div className="field">
                  <label>ZIP Code</label>
                  <input
                    name="zip"
                    value={address.zip}
                    onChange={handleAddressChange}
                    type="text"
                  />
                </div>
              </div>
              <button className="btn primary" onClick={saveAddress}>
                Save Address
              </button>
            </div>

            <div className="section account-security">
              <h2>Account Security</h2>
              <p>Update your password to keep your account safe and secure.</p>
              <div className="security-container">
                <div className="security-actions">
                  <button className="btn outline" onClick={changePassword}>
                    Change Password
                  </button>
                  <button className="btn outline" onClick={enable2FA}>
                    Enable 2FA
                  </button>
                </div>
                <button className="btn danger" onClick={deleteAccount}>
                  Delete Account
                </button>
              </div>
            </div>
          </>
        );

      case "favorites":
          return (
            <div className="section">
              <h2>My Favorites</h2>
              <div className="favorites-tabs">
                <button 
                  className={`fav-tab-btn ${favTab === 'furniture' ? 'active' : ''}`}
                  onClick={() => setFavTab('furniture')}
                >
                  Furniture
                </button>
                <button 
                  className={`fav-tab-btn ${favTab === 'design' ? 'active' : ''}`}
                  onClick={() => setFavTab('design')}
                >
                  Design
                </button>
              </div>

              {favTab === 'furniture' && (
                <div className="furniture-grid">
                  {favoriteFurniture.length === 0 ? (
                    <p>No favorite furniture items yet.</p>
                  ) : (
                    favoriteFurniture.map(item => (
                      <div className="furniture-card" key={item.id}>
                        <div className="furniture-image">
                          📦
                        </div>
                        <div className="furniture-info">
                          <div className="furniture-header">
                            <h4>{item.name}</h4>
                            <button 
                              className="furniture-wish-btn active"
                              onClick={() => toggleFurnitureFavorite(item.id)}
                              aria-label="Remove from favorites"
                            >
                              <FaHeart />
                            </button>
                          </div>
                          <p className="furniture-price">LKR {item.price.toLocaleString()}</p>
                          <span className="furniture-category">{item.category}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {favTab === 'design' && (
                <div className="design-grid">
                  {favoriteDesigns.length === 0 ? (
                    <p>No favorite designs yet.</p>
                  ) : (
                    favoriteDesigns.map(design => (
                      <div className="design-fav-card" key={design.id}>
                        <div className="design-fav-image">
                          📐
                        </div>
                        <div className="design-fav-content">
                          <div className="design-fav-header">
                            <h4>{design.name}</h4>
                            <button 
                              className="design-fav-wish-btn active"
                              onClick={() => toggleDesignFavorite(design.id)}
                              aria-label="Remove from favorites"
                            >
                              <FaHeart />
                            </button>
                          </div>
                          <div className="design-fav-tags">
                            <span className="design-fav-tag">{design.theme}</span>
                            <span className="design-fav-tag">{design.room}</span>
                          </div>
                          <p className="design-fav-desc">{design.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );

      case "orders":
        return (
          <div className="section order-history">
            <h2>Order History</h2>
            <div className="favorites-tabs">
              <button 
                className={`fav-tab-btn ${orderTab === 'furniture' ? 'active' : ''}`}
                onClick={() => setOrderTab('furniture')}
              >
                Furniture Orders
              </button>
              <button 
                className={`fav-tab-btn ${orderTab === 'design' ? 'active' : ''}`}
                onClick={() => setOrderTab('design')}
              >
                Design Orders
              </button>
            </div>

            {orderTab === 'furniture' && (
              <div className="orders-content">
                {furnitureOrders.length === 0 ? (
                  <p>No furniture orders have been placed yet.</p>
                ) : (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {furnitureOrders.map(o => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.date}</td>
                          <td>{o.items}</td>
                          <td>LKR {o.total.toLocaleString()}</td>
                          <td><span className={`status-badge ${o.status.toLowerCase().replace(' ', '-')}`}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {orderTab === 'design' && (
              <div className="orders-content">
                {designOrders.length === 0 ? (
                  <p>No design orders have been placed yet.</p>
                ) : (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Design</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {designOrders.map(o => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.date}</td>
                          <td>{o.items}</td>
                          <td>LKR {o.total.toLocaleString()}</td>
                          <td><span className={`status-badge ${o.status.toLowerCase().replace(' ', '-')}`}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );

      case "payments":
        return (
          <>
            <div className="section">
              <h2>Payment Methods</h2>
              <p className="section-description">Manage your saved payment methods for faster checkout.</p>
              
              <div className="payment-cards-grid">
                {payments.length === 0 ? (
                  <p className="no-items">No payment methods saved yet.</p>
                ) : (
                  payments.map(payment => (
                    <div className="payment-card-item" key={payment.id}>
                      <div className="payment-card-header">
                        <div className="card-type-icon">
                          {payment.type === 'Visa' ? '💳' : payment.type === 'Mastercard' ? '💳' : '💳'}
                        </div>
                        <div className="card-info">
                          <span className="card-type">{payment.type}</span>
                          <span className="card-number">•••• •••• •••• {payment.last4}</span>
                          <span className="card-expiry">Expires {payment.expiry}</span>
                        </div>
                        <button 
                          className="delete-card-btn"
                          onClick={() => deletePayment(payment.id)}
                          aria-label="Delete payment method"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button className="btn primary" onClick={openPaymentModal}>
                <FaPlus style={{ fontSize: '14px', marginRight: '8px' }} />
                Add Payment Method
              </button>
            </div>

            {showPaymentModal && (
              <div className="modal-overlay" onClick={closePaymentModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Add Payment Method</h3>
                    <button className="modal-close" onClick={closePaymentModal}>
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className="modal-body">
                    <div className="field">
                      <label>Card Type</label>
                      <select 
                        name="type" 
                        value={newCard.type} 
                        onChange={handleCardChange}
                        className={cardErrors.type ? 'error' : ''}
                      >
                        <option value="">Select card type</option>
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Amex">American Express</option>
                      </select>
                      {cardErrors.type && <span className="error-text">{cardErrors.type}</span>}
                    </div>
                    
                    <div className="field">
                      <label>Card Number</label>
                      <input
                        type="text"
                        name="number"
                        value={newCard.number}
                        onChange={handleCardChange}
                        placeholder={newCard.type === 'Amex' ? '3711 123456 12345' : '1234 5678 9012 3456'}
                        className={cardErrors.number ? 'error' : ''}
                      />
                      {cardErrors.number && <span className="error-text">{cardErrors.number}</span>}
                    </div>
                    
                    <div className="fields">
                      <div className="field">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          value={newCard.expiry}
                          onChange={handleCardChange}
                          placeholder="MM/YY"
                          className={cardErrors.expiry ? 'error' : ''}
                        />
                        {cardErrors.expiry && <span className="error-text">{cardErrors.expiry}</span>}
                      </div>
                      
                      <div className="field">
                        <label>CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={newCard.cvv}
                          onChange={handleCardChange}
                          placeholder={newCard.type === 'Amex' ? '1234' : '123'}
                          className={cardErrors.cvv ? 'error' : ''}
                        />
                        {cardErrors.cvv && <span className="error-text">{cardErrors.cvv}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button className="btn outline" onClick={closePaymentModal}>Cancel</button>
                    <button className="btn primary" onClick={addPaymentMethod}>Add Card</button>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="myaccount-container">
      <h1>My Account</h1>
      <p className="subtitle">Manage your profile, shipping addresses, and saved favorites.</p>
      <div className="account-layout">
        <nav className="sidebar">
          <div className="sidebar-profile">
            <div className="avatar">
              {profile.firstName ? profile.firstName.charAt(0) : "U"}
            </div>
            <div className="profile-info">
              <span className="name">
                {profile.firstName || "User"} {profile.lastName || "Name"}
              </span>
              <span className="membership">Premium Member</span>
            </div>
          </div>
          <ul>
            <li
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser className="icon" />
              <span className="text">Profile Details</span>
            </li>
            <li
              className={activeTab === "favorites" ? "active" : ""}
              onClick={() => setActiveTab("favorites")}
            >
              <FaHeartSolid className="icon" />
              <span className="text">My Favorites</span>
              <span className="badge">{favoriteFurniture.length + favoriteDesigns.length}</span>
            </li>
            <li
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              <FaHistory className="icon" />
              <span className="text">Order History</span>
            </li>
            <li
              className={activeTab === "payments" ? "active" : ""}
              onClick={() => setActiveTab("payments")}
            >
              <FaCreditCard className="icon" />
              <span className="text">Payment Methods</span>
            </li>
            <li className="logout" onClick={() => console.log("Log out")}>
              <FaSignOutAlt className="icon" />
              <span className="text">Log Out</span>
            </li>
          </ul>
        </nav>
        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Myaccount;