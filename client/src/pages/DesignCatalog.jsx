import React, { useState } from 'react';
import '../styles/DesignCatalog.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const initialDesigns = [
  {
    id: 1,
    title: 'Scandinavian Living Room',
    description: 'Clean lines, natural materials, and a neutral palette for a serene living space.',
    theme: 'Scandinavian',
    room: 'Living Room',
    items: 2,
    image: '',
  },
  {
    id: 2,
    title: 'Minimalist Bedroom',
    description: 'Stripped‑back elegance with a focus on natural light and quality materials.',
    theme: 'Minimalist',
    room: 'Bedroom',
    items: 7,
    image: '',
  },
  {
    id: 3,
    title: 'Industrial Home Office',
    description: 'Raw materials meet modern ergonomics in this productive workspace.',
    theme: 'Industrial',
    room: 'Office',
    items: 5,
    image: '',
  },
  {
    id: 4,
    title: 'Bohemian Lounge',
    description: 'A colorful mix of patterns and textures for a relaxed, artistic vibe.',
    theme: 'Bohemian',
    room: 'Living Room',
    items: 4,
    image: '',
  },
  {
    id: 5,
    title: 'Modern Kitchen',
    description: 'Sleek surfaces and smart storage in a contemporary culinary space.',
    theme: 'Modern',
    room: 'Kitchen',
    items: 6,
    image: '',
  },
  {
    id: 6,
    title: 'Vintage Study',
    description: 'Antique furnishings and warm lighting for a cozy reading nook.',
    theme: 'Vintage',
    room: 'Office',
    items: 3,
    image: '',
  },
];

const themes = ['All Themes', 'Scandinavian', 'Minimalist', 'Industrial', 'Modern', 'Vintage', 'Bohemian'];
const rooms = ['All Rooms', 'Living Room', 'Bedroom', 'Office', 'Kitchen'];

const DesignCatalog = () => {
  const [theme, setTheme] = useState('All Themes');
  const [room, setRoom] = useState('All Rooms');
  const [favorites, setFavorites] = useState([]);

  const filtered = initialDesigns
    .filter(d =>
      (theme === 'All Themes' || d.theme === theme) &&
      (room === 'All Rooms' || d.room === room)
    );

  const toggleFavorite = id => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

    return (
      <div className="design-catalog-page">
        <h1>Design Gallery</h1>
        <p className="tagline">Browse professionally curated room designs and try them out</p>
        <div className="filters">
          <select value={theme} onChange={e => setTheme(e.target.value)}>
            {themes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={room} onChange={e => setRoom(e.target.value)}>
            {rooms.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="design-grid">
          {filtered.map(design => (
            <div className="design-card" key={design.id}>
              <div className="design-image">
                {design.image ? (
                  <img src={design.image} alt={design.title} />
                ) : (
                  <div className="placeholder" />
                )}
              </div>
              <div className="design-info">
                <div className="design-header">
                  <h3 className="design-card-title">{design.title}</h3>
                  <button
                    className={`fav-btn ${favorites.includes(design.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(design.id)}
                    aria-label="Add to favorites"
                  >
                    {favorites.includes(design.id) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
                <p className="design-desc">{design.description}</p>
                <div className="design-tags">
                  <span className="tag">{design.theme}</span>
                  <span className="tag room-tag">{design.room}</span>
                  <span className="tag items-tag">{design.items} items</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default DesignCatalog;