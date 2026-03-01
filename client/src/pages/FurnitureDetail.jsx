import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/FurnitureDetail.css';

// Generic SVGs for the UI
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill="currentColor" />
        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="currentColor" />
        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CubeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8C20.9996 7.64927 20.9071 7.30691 20.7315 7.00511C20.556 6.70331 20.3031 6.4521 20 6.276L13 2.276C12.6953 2.09886 12.3508 2.00586 12 2.00586C11.6492 2.00586 11.3047 2.09886 11 2.276L4 6.276C3.6969 6.4521 3.44403 6.70331 3.26846 7.00511C3.09289 7.30691 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09289 16.6931 3.26846 16.9949C3.44403 17.2967 3.6969 17.5479 4 17.724L11 21.724C11.3047 21.9011 11.6492 21.9941 12 21.9941C12.3508 21.9941 12.6953 21.9011 13 21.724L20 17.724C20.3031 17.5479 20.556 17.2967 20.7315 16.9949C20.9071 16.6931 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.27002 6.95996L12 12.01L20.73 6.95996" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChairSVG = ({ width = "100%", height = "100%", isThumbnail = false }) => {
    const scale = isThumbnail ? 0.3 : 1;
    return (
        <svg width={width} height={height} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform={`scale(${scale}) translate(${isThumbnail ? 350 : 0}, ${isThumbnail ? 350 : 0})`}>
                {/* Shadow */}
                <ellipse cx="150" cy="270" rx="100" ry="30" fill="rgba(0,0,0,0.1)" />
                {/* Legs */}
                <path d="M 80 230 L 70 280 L 85 280 Z" fill="#b07d5b" />
                <path d="M 220 230 L 230 280 L 215 280 Z" fill="#b07d5b" />
                <path d="M 120 240 L 115 270 L 125 270 Z" fill="#8c5b3e" />
                <path d="M 180 240 L 185 270 L 175 270 Z" fill="#8c5b3e" />
                {/* Base */}
                <polygon points="50,200 250,200 230,240 70,240" fill="#6e4428" />
                {/* Seat Cushion */}
                <path d="M 50 160 Q 150 180 250 160 L 250 200 Q 150 220 50 200 Z" fill="#a05d3a" />
                {/* Tufting on Seat */}
                <circle cx="110" cy="180" r="5" fill="#6e4428" />
                <circle cx="150" cy="185" r="5" fill="#6e4428" />
                <circle cx="190" cy="180" r="5" fill="#6e4428" />
                {/* Left Armrest */}
                <path d="M 40 100 L 70 100 L 70 200 L 40 180 Z" fill="#b86d45" />
                <path d="M 40 100 L 50 90 L 80 90 L 70 100 Z" fill="#d9895f" />
                <path d="M 70 100 L 80 90 L 80 190 L 70 200 Z" fill="#8f4a28" />
                {/* Right Armrest */}
                <path d="M 260 100 L 230 100 L 230 200 L 260 180 Z" fill="#b86d45" />
                <path d="M 260 100 L 250 90 L 220 90 L 230 100 Z" fill="#d9895f" />
                <path d="M 230 100 L 220 90 L 220 190 L 230 200 Z" fill="#8f4a28" />
                {/* Backrest */}
                <path d="M 70 60 Q 150 40 230 60 L 230 160 Q 150 180 70 160 Z" fill="#a05d3a" />
                <path d="M 70 60 L 80 50 Q 150 30 220 50 L 230 60 Q 150 40 70 60 Z" fill="#d9895f" />
                {/* Cushion highlights */}
                <path d="M 90 80 Q 150 60 210 80" stroke="#b86d45" strokeWidth="2" fill="none" />
                <path d="M 90 120 Q 150 100 210 120" stroke="#b86d45" strokeWidth="2" fill="none" />
            </g>
        </svg>
    );
};


const FurnitureDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Using ID to mimic fetching data

    // Mock Data
    const furnitureData = {
        name: "Nordic Oak Chair",
        description: "Bring calm, contemporary character to your space with this Nordic Oak Chair. Crafted from solid oak and finished in a soft natural tone, its clean lines and gently curved profile reflect timeless Scandinavian design.",
        dimensions: "55 × 54 × 64",
        material: "Wood",
        price: "LKR 23,000",
        colors: ["#cba072", "#a65c40", "#ffffff", "#6b513d", "#faebd8"],
    };

    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(0);

    const handleDecrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };

    return (
        <div className="cd-page-container">
            <div className="cd-inner-wrapper">

                {/* Back Button */}
                <button className="cd-back-btn" onClick={() => navigate('/furniture')}>
                    <div className="cd-back-icon-circle">
                        <ArrowLeftIcon />
                    </div>
                    <span>Back to Furniture Catalog</span>
                </button>

                <div className="cd-split-layout">

                    {/* LEFT: Image Gallery View */}
                    <div className="cd-gallery-section">
                        <div className="cd-main-image-box">
                            <ChairSVG />
                        </div>
                        <div className="cd-thumbnail-row">
                            <div className="cd-thumbnail active"><ChairSVG isThumbnail={true} /></div>
                            <div className="cd-thumbnail"><ChairSVG isThumbnail={true} /></div>
                            <div className="cd-thumbnail"><ChairSVG isThumbnail={true} /></div>
                            <div className="cd-thumbnail"><ChairSVG isThumbnail={true} /></div>
                        </div>
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="cd-details-section">
                        <h1 className="cd-title">{furnitureData.name}</h1>
                        <p className="cd-description">{furnitureData.description}</p>

                        {/* Spec Boxes */}
                        <div className="cd-specs-row">
                            <div className="cd-spec-box">
                                <span className="cd-spec-label">Dimensions</span>
                                <span className="cd-spec-value">{furnitureData.dimensions}</span>
                            </div>
                            <div className="cd-spec-box">
                                <span className="cd-spec-label">Material</span>
                                <span className="cd-spec-value">{furnitureData.material}</span>
                            </div>
                            <div className="cd-spec-box">
                                <span className="cd-spec-label">Price</span>
                                <span className="cd-spec-value">{furnitureData.price}</span>
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="cd-color-section">
                            <span className="cd-section-label">Available Colors</span>
                            <div className="cd-color-options">
                                {furnitureData.colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        className={`cd-color-swatch ${selectedColor === idx ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(idx)}
                                        aria-label={`Select Color ${idx}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="cd-quantity-picker">
                            <button className="cd-qty-btn" onClick={handleDecrease}>−</button>
                            <input type="number" className="cd-qty-input" value={quantity} readOnly />
                            <button className="cd-qty-btn" onClick={handleIncrease}>+</button>
                        </div>

                        {/* Actions */}
                        <div className="cd-action-buttons">
                            <button className="cd-btn-primary">
                                <CartIcon />
                                Add to Cart
                            </button>
                            <button className="cd-btn-secondary">
                                <CubeIcon />
                                View in Room
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default FurnitureDetail;
