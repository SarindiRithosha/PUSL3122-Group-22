import React, { useState } from 'react';
// icons for contact information
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
// import '../services/...' // placeholder removed; add actual service when available
import '../styles/Contactus.css';

const Contactus = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Design Consultation Inquiry',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send data to backend
    console.log('submit', formData);
    alert('Message sent!');
  };

  return (
    <div className="contact-page">
      <h1>Get in Touch</h1>
      <p className="intro">Have a question about a design or need help with a custom order?<br />Our team is here to help you build your perfect space.</p>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Contact Information</h2>
          <p>Fill out the form and our team will get back to you within 24 hours.</p>
          <ul>
            <li>
              <span className="icon"><FaMapMarkerAlt /></span>
              <div>
                <strong>Our Store</strong><br />123 Furniture Avenue<br />Design District, NY 10001
              </div>
            </li>
            <li>
              <span className="icon"><FaPhoneAlt /></span>
              <div>
                <strong>Phone</strong><br />+1 (555) 123-4567
              </div>
            </li>
            <li>
              <span className="icon"><FaEnvelope /></span>
              <div>
                <strong>Email Address</strong><br />support@furniplan.com
              </div>
            </li>
            <li>
              <span className="icon"><FaClock /></span>
              <div>
                <strong>Business Hours</strong><br />Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM
              </div>
            </li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="field">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            >
              <option>Design Consultation Inquiry</option>
              <option>Order Question</option>
              <option>Custom Furniture Request</option>
              <option>Other</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-button">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contactus;
