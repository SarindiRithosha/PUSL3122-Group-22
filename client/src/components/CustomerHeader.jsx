// client/src/components/CustomerHeader.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiShoppingCart, FiLogOut, FiSettings } from 'react-icons/fi';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useCart } from '../contexts/CartContext';
import Cart from '../pages/Cart';
import '../styles/CustomerHeader.css';

const CustomerHeader = () => {
  const [isDropdownOpen,  setIsDropdownOpen]  = useState(false);
  const [isGuestPopupOpen,setIsGuestPopupOpen]= useState(false);
  const [isCartOpen,      setIsCartOpen]      = useState(false);

  const { customer, isCustomerLoggedIn, logoutCustomer } = useCustomerAuth();
  const { cartItems, incrementItem, decrementItem, removeItem, getCartCount } = useCart();
  const navigate  = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutCustomer();
    navigate('/');
  };

  const handleMyAccount = () => {
    setIsDropdownOpen(false);
    navigate('/myaccount');
  };

  // Get initials for avatar when logged in
  const initials = customer?.name
    ? customer.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : '';

  return (
    <header className="customer-header">
      <div className="header-container">

        {/* Logo */}
        <div className="logo-section">
          <Link to="/">
            <img src="/images/logo.png" alt="FurniPlan Logo" className="logo"/>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="nav-section">
          <ul className="nav-links">
            <li><Link to="/furniture">Furniture</Link></li>
            <li><Link to="/design">Design</Link></li>
            <li><Link to="/room">Room</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>

        {/* Icons */}
        <div className="icons-section">

          {/* Cart */}
          <button className="cart-icon" onClick={() => setIsCartOpen(true)}>
            <FiShoppingCart size={22} strokeWidth={1.8}/>
            {getCartCount() > 0 && (
              <span className="cart-count">{getCartCount()}</span>
            )}
          </button>

          {/* Single profile area — dropdown if logged in, popup if guest */}
          <div className="profile-area" ref={dropdownRef}>
            {isCustomerLoggedIn ? (
              <>
                <button
                  className="profile-btn logged-in"
                  onClick={() => setIsDropdownOpen(o => !o)}
                  aria-label="Account menu"
                  aria-expanded={isDropdownOpen}>
                  {initials
                    ? <span className="profile-avatar">{initials}</span>
                    : <FiUser size={22} strokeWidth={1.8}/>
                  }
                </button>

                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <span className="profile-dropdown-name">{customer?.name || 'Customer'}</span>
                      <span className="profile-dropdown-email">{customer?.email || ''}</span>
                    </div>
                    <div className="profile-dropdown-divider"/>
                    <button className="profile-dropdown-item" onClick={handleMyAccount}>
                      <FiSettings size={15} strokeWidth={1.8}/>
                      My Account
                    </button>
                    <button className="profile-dropdown-item logout" onClick={handleLogout}>
                      <FiLogOut size={15} strokeWidth={1.8}/>
                      Log Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  className="profile-btn"
                  onClick={() => setIsGuestPopupOpen(o => !o)}
                  aria-label="Sign in">
                  <FiUser size={22} strokeWidth={1.8}/>
                </button>

                {isGuestPopupOpen && (
                  <div className="profile-dropdown guest">
                    <div className="profile-dropdown-header">
                      <span className="profile-dropdown-name">Sign In</span>
                    </div>
                    <div className="profile-dropdown-divider"/>
                    <Link
                      className="profile-dropdown-item"
                      to="/sign-in"
                      onClick={() => setIsGuestPopupOpen(false)}>
                      <FiUser size={15} strokeWidth={1.8}/>
                      Customer Sign In
                    </Link>
                    <Link
                      className="profile-dropdown-item"
                      to="/admin/signin"
                      onClick={() => setIsGuestPopupOpen(false)}>
                      <FiSettings size={15} strokeWidth={1.8}/>
                      Admin(Designer) Sign In
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  );
};

export default CustomerHeader;