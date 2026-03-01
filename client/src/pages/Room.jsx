import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Room.css';

// SVGs for room types
const RoomSvg = ({ type }) => {
  switch (type) {
    case 'rectangular-dark':
      return (
        <svg className="room-illustration" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer stroke with slight unevenness to simulate hand-drawn/blueprint feel */}
          <path d="M 10 20 L 230 20 L 230 120 L 10 120 Z" stroke="#6C584C" strokeWidth="2" fill="white" strokeLinejoin="round" />
          <path d="M 22 30 L 218 30 L 218 110 L 22 110 Z" fill="#7A685D" />
        </svg>
      );
    case 'square':
      return (
        <svg className="room-illustration" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 40 10 L 190 10 L 190 120 L 40 120 Z" stroke="#6C584C" strokeWidth="2" fill="white" strokeLinejoin="round" />
          {/* Inner thicker border */}
          <path d="M 45 15 L 185 15 L 185 115 L 45 115 Z" stroke="#DABEA7" strokeWidth="6" fill="none" strokeLinejoin="round" />
          <path d="M 50 20 L 180 20 L 180 110 L 50 110 Z" fill="#A59089" />
        </svg>
      );
    case 'rectangular-light':
      return (
        <svg className="room-illustration" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 15 25 L 225 25 L 225 115 L 15 115 Z" stroke="#6C584C" strokeWidth="2" fill="white" strokeLinejoin="round" />
          <path d="M 25 35 L 215 35 L 215 105 L 25 105 Z" fill="#AEA39A" />
        </svg>
      );
    case 'l-shape':
      return (
        <svg className="room-illustration" viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 40 20 L 200 20 L 200 65 L 100 65 L 100 120 L 40 120 Z" stroke="#6C584C" strokeWidth="2" fill="white" strokeLinejoin="round" />
          <path d="M 48 28 L 192 28 L 192 57 L 92 57 L 92 112 L 48 112 Z" fill="#C5B1A5" />
        </svg>
      );
    default:
      return null;
  }
};

const mockRooms = [
  {
    id: 1,
    name: 'Master Bedroom',
    dimensions: '4m x 5m',
    shape: 'Rectangular',
    type: 'rectangular-dark',
    colors: ['#E6DFD7', '#6E5D52'] // Light beige, very dark brown
  },
  {
    id: 2,
    name: 'Living Room',
    dimensions: '4m x 5m',
    shape: 'Square',
    type: 'square',
    colors: ['#A09088', '#DABEA7'] // Grayish brown, pale pink/beige
  },
  {
    id: 3,
    name: 'Kitchen',
    dimensions: '4m x 5m',
    shape: 'Rectangular',
    type: 'rectangular-light',
    colors: ['#FFFFFF', '#A09088'] // White, grayish brown
  },
  {
    id: 4,
    name: 'Master Bedroom',
    dimensions: '4m x 5m',
    shape: 'Rectangular',
    type: 'rectangular-dark',
    colors: ['#E6DFD7', '#6E5D52']
  },
  {
    id: 5,
    name: 'Living Room',
    dimensions: '4m x 5m',
    shape: 'L-Shape',
    type: 'l-shape',
    colors: ['#9C8C85', '#E1D1C7']
  }
];

const Room = () => {
  const navigate = useNavigate();

  return (
    <div className="room-page-wrapper">
      <div className="room-header-section">
        <h1 className="room-main-title">Choose your Room</h1>
        <p className="room-subtitle">Select a template to start designing</p>
      </div>

      <div className="room-grid">
        {mockRooms.map((room) => (
          <div className="room-card" key={room.id} onClick={() => navigate('/design')}>
            <div className="room-card-image">
              <RoomSvg type={room.type} />
            </div>

            <div className="room-card-details">
              <h3 className="room-card-title">{room.name}</h3>
              <p className="room-card-specs">
                {room.dimensions} • {room.shape}
              </p>

              <div className="room-card-colors">
                {room.colors.map((color, idx) => (
                  <span
                    key={idx}
                    className="room-color-swatch"
                    style={{ backgroundColor: color }}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;