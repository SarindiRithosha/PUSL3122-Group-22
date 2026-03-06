import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  // Sample data for featured designs
  const featuredDesigns = [
    { id: 1, name: 'Scandinavian Living Room', style: 'Scandinavian', room: 'Living Room' },
    { id: 2, name: 'Scandinavian Living Room', style: 'Scandinavian', room: 'Living Room' },
    { id: 3, name: 'Scandinavian Living Room', style: 'Scandinavian', room: 'Living Room' },
    { id: 4, name: 'Scandinavian Living Room', style: 'Scandinavian', room: 'Living Room' },
    { id: 5, name: 'Scandinavian Living Room', style: 'Scandinavian', room: 'Living Room' },
    { id: 6, name: 'Scandinavian Living Room', style: 'Scandinavian', room: 'Living Room' },
  ];

  // Sample data for popular furniture
  const popularFurniture = [
    { id: 1, name: 'Nordic Oak Chair', price: 35000, category: 'Chair', image: null },
    { id: 2, name: 'Walnut Coffee Table', price: 89000, category: 'Table', image: null },
    { id: 3, name: 'Cloud Sofa', price: 89000, category: 'Sofa', image: null },
    { id: 4, name: 'Lily Floor Lamp', price: 12000, category: 'Lamp', image: null },
    { id: 5, name: 'Nordic Oak Chair', price: 35000, category: 'Chair', image: null },
    { id: 6, name: 'Walnut Coffee Table', price: 89000, category: 'Table', image: null },
    { id: 7, name: 'Cloud Sofa', price: 89000, category: 'Sofa', image: null },
    { id: 8, name: 'Lily Floor Lamp', price: 12000, category: 'Lamp', image: null },
  ];

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      text: '"FurniPlan helped me visualize my living room perfectly. Ordered three pieces and they fit exactly as planned!"',
      name: 'Emma S.'
    },
    {
      id: 2,
      text: '"FurniPlan helped me visualize my living room perfectly. Ordered three pieces and they fit exactly as planned!"',
      name: 'Emma S.'
    },
    {
      id: 3,
      text: '"FurniPlan helped me visualize my living room perfectly. Ordered three pieces and they fit exactly as planned!"',
      name: 'Emma S.'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
          <div className="hero-tag">
            <img src="/images/hero-tag.png" alt="Design Your Perfect Space" style={{ width: '20px', height: '20px' }} />
            <span>Design Your Perfect Space</span>
          </div>
          <h1 className="hero-title">
            Furnish Your<br />
            <span className="hero-title-accent">Dream Room</span>
          </h1>
          <p className="hero-description">
            Explore curated furniture collections and visualize them<br />
            in your room with our immersive 3D/AR planner.
          </p>
          <div className="hero-buttons">
            <Link to="/furniture" className="btn btn-primary" style={{ borderRadius: '15px' }}>
              Browse Catalog
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '8px' }}>
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/design" className="btn btn-secondary" style={{ borderRadius: '15px' }}>View Designs</Link>
          </div>
            </div>
            <div className="hero-image">
          <img src="/images/hero-furniture.png" alt="3D Furniture Visualization" />
            </div>
          </div>
        </section>

        {/* How to Start Section */}
          <section className="how-to-start-section">
            <h2 className="section-title">How to Start</h2>
            <p className="section-subtitle">Three simple steps to your dream interior</p>
            <div className="steps-container">
              <div className="step-card">
            <div className="step-icon">
              <img src="/images/step1.png" alt="Select Template" style={{ width: '45px', height: '45px' }}/>
            </div>
            <div className="step-number">01</div>
            <h3 className="step-title">Select Template</h3>
            <p className="step-description">
              Select a room template of your<br />
              own room measurements to get<br />
              started.
            </p>
              </div>

              <div className="step-card">
            <div className="step-icon">
              <img src="/images/step2.png" alt="Choose Furniture" style={{ width: '45px', height: '45px' }}/>
            </div>
            <div className="step-number">02</div>
            <h3 className="step-title">Choose Furniture</h3>
            <p className="step-description">
              Browse our curated catalog and<br />
              add your favorite pieces to the<br />
              room.
            </p>
              </div>

              <div className="step-card">
            <div className="step-icon">
              <img src="/images/step3.png" alt="Visualize" style={{ width: '45px', height: '45px' }}/>
            </div>
            <div className="step-number">03</div>
            <h3 className="step-title">Visualize</h3>
            <p className="step-description">
              See your design come to life in<br />
              real-time 2D and 3D views.
            </p>
              </div>
            </div>
          </section>
          
      {/* Featured Designs Section */}
      <diV style={{ backgroundColor: '#ffffff' }}>  
      <section className="featured-designs-section">
        <div className="section-header" style={{ marginBottom: '1px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '29px' }}>Featured Designs</h2>
            <p className="section-subtitle">Curated room designs by our professional designers</p>
          </div>
          <Link to="/design" className="view-all-link" style={{ color: '#000000', fontWeight: 500 }}>
            View All <span>→</span>
          </Link>
        </div>
        <div className="designs-grid">
          {featuredDesigns.map((design) => (
            <div key={design.id} className="design-card" style={{ borderRadius: '20px' }}>
              <div className="design-image" style={{ background: '#d9d9d9' }}>
                <img src="/images/featured-design.png" alt="Design" style={{ width: '50px', height: '50px' }}/>
              </div>
              <div className="design-info">
                <h3 className="design-name">{design.name}</h3>
                <div className="design-tags" style={{ gap: '15px' }}>
                  <span className="design-tag">{design.style}</span>
                  <span className="design-tag" style={{ backgroundColor: '#FFF6E0', color: '#000000' }}>{design.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </diV> 

      {/* Popular Furniture Section */}
      <section className="popular-furniture-section">
        <div className="section-header" style={{ marginBottom: '1px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '29px' }}>Popular Furniture </h2>
            <p className="section-subtitle">Handpicked pieces for your space</p>
          </div>
          <Link to="/furniture" className="view-all-link" style={{ color: '#000000', fontWeight: 500 }}>
            View All <span>→</span>
          </Link>
        </div>
        <div className="furniture-grid">
          {popularFurniture.map((item) => (
            <div key={item.id} className="furniture-card" style={{ borderRadius: '20px' }}>
              <div className="furniture-image" style={{ background: '#d9d9d9' }}>
                <img src="/images/featured-design.png" alt="Furniture" style={{ width: '50px', height: '50px' }}/>
              </div>
              <div className="furniture-info">
                <h3 className="furniture-name">{item.name}</h3>
                <div className="furniture-footer">
                  <span className="furniture-price">LKR {item.price.toLocaleString()}</span>
                  <span className="furniture-category" style={{ border: '1px solid #c3c3c3' }}>{item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="testimonials-title">What Our Customers Say</h2>
        <p className="testimonials-subtitle">Trusted by thousands of home enthusiasts</p>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-stars">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <span className="avatar-initial">{testimonial.name.charAt(0)}</span>
                </div>
                <span className="author-name">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
