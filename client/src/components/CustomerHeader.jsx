import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CustomerHeader.css';

const CustomerHeader = () => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const toggleLoginPopup = () => {
    setIsLoginPopupOpen(!isLoginPopupOpen);
  };

  return (
    <header className="customer-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/">
            <img src="/images/logo.png" alt="FurniPlan Logo" className="logo" />
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="nav-section">
          <ul className="nav-links">
            <li><Link to="/furniture">Furniture</Link></li>
            <li><Link to="/design">Design</Link></li>
            <li><Link to="/room">Room</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>

        {/* Icons Section */}
        <div className="icons-section">
          <Link to="/cart" className="cart-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 2H6L8 16H20" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          
          <button className="user-icon" onClick={toggleLoginPopup}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Login Popup */}
        {isLoginPopupOpen && (
          <div className="login-popup">
            <div className="popup-content">
              <button className="close-popup" onClick={toggleLoginPopup}>×</button>
              <h3>Login</h3>
              <div className="login-options">
                <Link to="/customer/login" className="login-option" onClick={toggleLoginPopup}>
                  Customer Login
                </Link>
                <Link to="/admin/login" className="login-option" onClick={toggleLoginPopup}>
                  Admin / Designer Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default CustomerHeader;