import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CustomerFooter.css';

const CustomerFooter = () => {
  return (
    <footer className="customer-footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          {/* Left Column - Company Info */}
          <div className="footer-left">
            <img src="/images/logo.png" alt="FurniPlan Logo" className="footer-logo" />
            <p className="company-description">
              Transform your space with our intuitive 3D furniture<br />
              planning tool. Design, visualize, and perfect your<br />
              interior before you buy.
            </p>
          </div>

          {/* Center Column - Product Section */}
          <div className="footer-center">
            <h4 className="footer-section-title">Product</h4>
            <ul className="footer-links">
              <li><Link to="/design">Design Catalog</Link></li>
              <li><Link to="/furniture">Furniture Catalog</Link></li>
              <li><Link to="/room">Room Template</Link></li>
            </ul>
          </div>

          {/* Right Column - Support Section */}
          <div className="footer-right">
            <h4 className="footer-section-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Horizontal Line */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="copyright">© 2026 FurniPlan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;