import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPublishedRooms, resolveAssetUrl } from '../services/customerApi';
import '../styles/Room.css';

// ── Fallback SVG per shape 
const ShapeSvg = ({ shape }) => {
  if (shape === 'L-Shape') {
    return (
      <svg className="room-illustration" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 40 20 L 200 20 L 200 65 L 100 65 L 100 120 L 40 120 Z"
          stroke="#6C584C" strokeWidth="2" fill="white" strokeLinejoin="round"/>
        <path d="M 48 28 L 192 28 L 192 57 L 92 57 L 92 112 L 48 112 Z" fill="#C5B1A5"/>
      </svg>
    );
  }
  // Square-ish rooms
  const isSquare = shape === 'Square';
  return isSquare ? (
    <svg className="room-illustration" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 40 10 L 190 10 L 190 120 L 40 120 Z"
        stroke="#6C584C" strokeWidth="2" fill="white" strokeLinejoin="round"/>
      <path d="M 45 15 L 185 15 L 185 115 L 45 115 Z"
        stroke="#DABEA7" strokeWidth="6" fill="none" strokeLinejoin="round"/>
      <path d="M 50 20 L 180 20 L 180 110 L 50 110 Z" fill="#A59089"/>
    </svg>
  ) : (
    /* Default rectangular */
    <svg className="room-illustration" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 10 20 L 230 20 L 230 120 L 10 120 Z"
        stroke="#6C584C" strokeWidth="2" fill="white" strokeLinejoin="round"/>
      <path d="M 22 30 L 218 30 L 218 110 L 22 110 Z" fill="#7A685D"/>
    </svg>
  );
};

// Colour preview strip from room template palette
const ColorStrip = ({ wallColors, floorColors }) => {
  const colors = [
    ...(wallColors  || []).slice(0, 2),
    ...(floorColors || []).slice(0, 2),
  ].filter(Boolean);

  return (
    <div className="room-card-colors">
      {colors.map((c, i) => (
        <span key={i} className="room-color-swatch" style={{ backgroundColor: c }}/>
      ))}
    </div>
  );
};

// ── Loading skeleton 
const Skeleton = () => (
  <div className="room-grid">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} className="room-card room-card-skeleton">
        <div className="room-skeleton-img"/>
        <div className="room-skeleton-line wide"/>
        <div className="room-skeleton-line"/>
      </div>
    ))}
  </div>
);

// ── Main component 
const Room = () => {
  const navigate = useNavigate();
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    listPublishedRooms()
      .then(res => setRooms(res.data || []))
      .catch(() => setError('Could not load room templates. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoomClick = (room) => {
    navigate(`/workspace/room/${room._id}`);
  };

  return (
    <div className="room-page-wrapper">
      <div className="room-header-section">
        <h1 className="room-main-title">Choose Your Room</h1>
        <p className="room-subtitle">Select a template to start designing your perfect space</p>
      </div>

      {loading && <Skeleton/>}

      {error && (
        <div className="room-error">
          <p>{error}</p>
          <button className="room-retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <p className="room-empty">No published room templates yet. Check back soon!</p>
      )}

      {!loading && !error && rooms.length > 0 && (
        <div className="room-grid">
          {rooms.map(room => (
            <div key={room._id} className="room-card" onClick={() => handleRoomClick(room)}>
              <div className="room-card-image">
                {room.image2DUrl ? (
                  <img
                    className="room-illustration"
                    src={resolveAssetUrl(room.image2DUrl)}
                    alt={room.name}
                  />
                ) : (
                  <ShapeSvg shape={room.shape}/>
                )}
              </div>
              <div className="room-card-details">
                <h3 className="room-card-title">{room.name}</h3>
                <p className="room-card-specs">
                  {room.dimensions?.width}m × {room.dimensions?.length}m
                  {room.dimensions?.height ? ` × ${room.dimensions.height}m` : ''}
                  {' • '}{room.shape}
                </p>
                <ColorStrip
                  wallColors={room.wallColors}
                  floorColors={room.floorColors}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Room;