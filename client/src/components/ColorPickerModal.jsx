import React, { useState, useMemo, useEffect, useRef } from 'react';

/* ───────────────────────────── curated home paint colours ───────────────────────────── */
const COLOR_CATEGORIES = [
    {
        name: 'All',
        colors: [],              // filled dynamically
    },
    {
        name: 'Whites & Neutrals',
        colors: [
            { name: 'Snow White', hex: '#FFFAFA' },
            { name: 'Ivory', hex: '#FFFFF0' },
            { name: 'Linen', hex: '#FAF0E6' },
            { name: 'Alabaster', hex: '#F2F0EB' },
            { name: 'Swiss Coffee', hex: '#DBD1C4' },
            { name: 'Chantilly Lace', hex: '#F5F0EC' },
            { name: 'White Dove', hex: '#F0EDE3' },
            { name: 'Cloud White', hex: '#F0EEE4' },
            { name: 'Simply White', hex: '#F7F4EF' },
            { name: 'Decorator White', hex: '#E8E5DD' },
            { name: 'Oxford White', hex: '#EDE9DF' },
            { name: 'Snowbound', hex: '#EDE8DF' },
            { name: 'Extra White', hex: '#F1F0EC' },
            { name: 'Whisper White', hex: '#F5F3EE' },
            { name: 'Vanilla Milkshake', hex: '#F3EEE3' },
            { name: 'Marshmallow', hex: '#F0EDEB' },
            { name: 'Antique White', hex: '#FAEBD7' },
            { name: 'Pearl White', hex: '#F5F1EA' },
        ],
    },
    {
        name: 'Beiges & Creams',
        colors: [
            { name: 'Accessible Beige', hex: '#D1C4AE' },
            { name: 'Kilim Beige', hex: '#C9B99A' },
            { name: 'Balanced Beige', hex: '#C4B59E' },
            { name: 'Macadamia', hex: '#D4C3A8' },
            { name: 'Natural Linen', hex: '#D4C9B7' },
            { name: 'Warm Sand', hex: '#C7B998' },
            { name: 'Creamy', hex: '#EDE1CB' },
            { name: 'Navajo White', hex: '#FFDEAD' },
            { name: 'Wheat', hex: '#F5DEB3' },
            { name: 'Blanched Almond', hex: '#FFEBCD' },
            { name: 'Champagne', hex: '#F7E7CE' },
            { name: 'Buttermilk', hex: '#F3ECCE' },
            { name: 'Sandy Shores', hex: '#E2D1B2' },
            { name: 'Biscuit', hex: '#E3D2B4' },
            { name: 'Harvest Cream', hex: '#F0E2C5' },
            { name: 'Pale Honey', hex: '#F0DFB8' },
            { name: 'Toasted Almond', hex: '#D2B48C' },
            { name: 'Cashew', hex: '#CBB994' },
        ],
    },
    {
        name: 'Grays',
        colors: [
            { name: 'Repose Gray', hex: '#C0BAB2' },
            { name: 'Agreeable Gray', hex: '#D0C9BF' },
            { name: 'Mindful Gray', hex: '#B7AFA6' },
            { name: 'Passive', hex: '#C6C4BE' },
            { name: 'Worldly Gray', hex: '#C4BEAF' },
            { name: 'Light French Gray', hex: '#C7C4BC' },
            { name: 'Gray Owl', hex: '#C6C5BF' },
            { name: 'Stonington Gray', hex: '#B5B7B3' },
            { name: 'Classic Gray', hex: '#D5D0CB' },
            { name: 'Silver Satin', hex: '#C5C6C1' },
            { name: 'Revere Pewter', hex: '#C4BAA9' },
            { name: 'Edgecomb Gray', hex: '#D3C9B7' },
            { name: 'Collingwood', hex: '#C1BBB3' },
            { name: 'Misty', hex: '#C9CCC9' },
            { name: 'Pebble', hex: '#B3AFA5' },
            { name: 'Fog', hex: '#BBBCB8' },
            { name: 'Stormy Monday', hex: '#A6A5A0' },
            { name: 'Steel Gray', hex: '#9EA1A1' },
            { name: 'Pewter', hex: '#8E9191' },
        ],
    },
    {
        name: 'Blues',
        colors: [
            { name: 'Hale Navy', hex: '#3E4B5C' },
            { name: 'Gentleman\'s Gray', hex: '#53687B' },
            { name: 'Van Deusen Blue', hex: '#496682' },
            { name: 'Boothbay Gray', hex: '#8B9DA9' },
            { name: 'Nimbus Gray', hex: '#9DAAB0' },
            { name: 'Sea Salt', hex: '#C1CFC1' },
            { name: 'Palladian Blue', hex: '#B7D0C8' },
            { name: 'Quiet Moments', hex: '#B4C9CB' },
            { name: 'Breath of Fresh Air', hex: '#C4D8E0' },
            { name: 'Mountain Air', hex: '#B5CAD4' },
            { name: 'Windy Blue', hex: '#9FB6C8' },
            { name: 'Dusty Blue', hex: '#8DA8B5' },
            { name: 'Santorini Blue', hex: '#5D89A8' },
            { name: 'Blueprint', hex: '#2B5278' },
            { name: 'Naval', hex: '#2C3E50' },
            { name: 'Powder Blue', hex: '#B0D4E8' },
            { name: 'Robin Egg', hex: '#98D7E0' },
            { name: 'Niagara', hex: '#558FAD' },
            { name: 'Denim', hex: '#486B8F' },
            { name: 'Twilight Blue', hex: '#3C5A7E' },
        ],
    },
    {
        name: 'Greens',
        colors: [
            { name: 'Sage', hex: '#B2AC88' },
            { name: 'Clary Sage', hex: '#B5B49E' },
            { name: 'Evergreen Fog', hex: '#969E8C' },
            { name: 'Retreat', hex: '#849283' },
            { name: 'Pewter Green', hex: '#8C9E8C' },
            { name: 'Olive Grove', hex: '#7B7E5E' },
            { name: 'Rosemary', hex: '#7A7D5E' },
            { name: 'Dried Thyme', hex: '#8A8D66' },
            { name: 'Jasper Stone', hex: '#91977F' },
            { name: 'Eucalyptus', hex: '#7A9E7E' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Hunter Green', hex: '#355E3B' },
            { name: 'Emerald', hex: '#50C878' },
            { name: 'Mint Condition', hex: '#B2DFCE' },
            { name: 'Sea Foam', hex: '#93E9BE' },
            { name: 'Soft Fern', hex: '#AAC8A7' },
            { name: 'Laurel', hex: '#6B8E5C' },
            { name: 'Herb Garden', hex: '#6E825C' },
            { name: 'Pistachio', hex: '#93C572' },
        ],
    },
    {
        name: 'Reds & Pinks',
        colors: [
            { name: 'Caliente', hex: '#B13934' },
            { name: 'Heritage Red', hex: '#9E3333' },
            { name: 'Crimson', hex: '#DC143C' },
            { name: 'Marsala', hex: '#964F4F' },
            { name: 'Wine', hex: '#722F37' },
            { name: 'Rose Quartz', hex: '#F7CAC9' },
            { name: 'Blush Pink', hex: '#F5C7C0' },
            { name: 'Dusty Rose', hex: '#C4A4A4' },
            { name: 'Rethink Pink', hex: '#E8C3B8' },
            { name: 'Rosy Outlook', hex: '#E2ACA0' },
            { name: 'Coral Clay', hex: '#D4887A' },
            { name: 'Peach Fuzz', hex: '#FFBE98' },
            { name: 'First Light', hex: '#F5DDD4' },
            { name: 'Soft Salmon', hex: '#F5A08C' },
            { name: 'Terra Rosa', hex: '#C47062' },
            { name: 'Pomegranate', hex: '#C44536' },
            { name: 'Brick Dust', hex: '#B56357' },
            { name: 'Mauve', hex: '#E0B0FF' },
        ],
    },
    {
        name: 'Yellows & Golds',
        colors: [
            { name: 'Hawthorne Yellow', hex: '#D4B95E' },
            { name: 'Sunflower', hex: '#FFDA03' },
            { name: 'Golden Hour', hex: '#D4A84B' },
            { name: 'Soft Gold', hex: '#D4C18E' },
            { name: 'Sundance', hex: '#C9A952' },
            { name: 'Honey Bee', hex: '#D4A32D' },
            { name: 'Banana Cream', hex: '#F7E8A4' },
            { name: 'Lemon Chiffon', hex: '#FFFACD' },
            { name: 'Pale Yellow', hex: '#F5F0C1' },
            { name: 'Butter Up', hex: '#F3E5AB' },
            { name: 'Tuscan Sun', hex: '#D4A44C' },
            { name: 'Amber', hex: '#FFBF00' },
            { name: 'Saffron', hex: '#F4C430' },
            { name: 'Goldenrod', hex: '#DAA520' },
            { name: 'Marigold', hex: '#EAA221' },
            { name: 'Vintage Gold', hex: '#C19A5B' },
        ],
    },
    {
        name: 'Purples',
        colors: [
            { name: 'Plum', hex: '#8E4585' },
            { name: 'Lavender', hex: '#E6E6FA' },
            { name: 'Wisteria', hex: '#C9A0DC' },
            { name: 'Purple Haze', hex: '#736384' },
            { name: 'Amethyst', hex: '#9966CC' },
            { name: 'Grape Juice', hex: '#6B3FA0' },
            { name: 'Pale Iris', hex: '#D5C4E0' },
            { name: 'Soft Lilac', hex: '#DCD0E0' },
            { name: 'Dusted Violet', hex: '#9E8DA5' },
            { name: 'Dreamy', hex: '#D6CDDE' },
            { name: 'Thistle', hex: '#D8BFD8' },
            { name: 'Orchid', hex: '#DA70D6' },
            { name: 'Ash Violet', hex: '#8A7A8D' },
            { name: 'Mulberry', hex: '#77446C' },
            { name: 'Eggplant', hex: '#614051' },
        ],
    },
    {
        name: 'Oranges',
        colors: [
            { name: 'Cavern Clay', hex: '#B67B5E' },
            { name: 'Copper Wire', hex: '#B5694B' },
            { name: 'Warm Copper', hex: '#C07745' },
            { name: 'Terracotta', hex: '#C67A4B' },
            { name: 'Adobe', hex: '#BD6E3C' },
            { name: 'Burnt Orange', hex: '#CC5500' },
            { name: 'Tangerine', hex: '#FF9966' },
            { name: 'Apricot', hex: '#FBCEB1' },
            { name: 'Melon', hex: '#FEBAAD' },
            { name: 'Cantaloupe', hex: '#FFA62F' },
            { name: 'Persimmon', hex: '#EC5800' },
            { name: 'Pumpkin Spice', hex: '#C8753D' },
            { name: 'Toffee', hex: '#A07040' },
            { name: 'Caramel', hex: '#C68E5B' },
            { name: 'Ginger', hex: '#B06500' },
            { name: 'Cinnamon', hex: '#A0522D' },
        ],
    },
    {
        name: 'Browns & Tans',
        colors: [
            { name: 'Urbane Bronze', hex: '#736350' },
            { name: 'Chocolate', hex: '#5C3A21' },
            { name: 'Mocha', hex: '#6F4E37' },
            { name: 'Espresso', hex: '#4B3832' },
            { name: 'Cocoa', hex: '#5C4033' },
            { name: 'Saddle Brown', hex: '#8B4513' },
            { name: 'Warm Walnut', hex: '#654321' },
            { name: 'Deep Oak', hex: '#5B3A29' },
            { name: 'Sienna', hex: '#A0522D' },
            { name: 'Tan', hex: '#D2B48C' },
            { name: 'Khaki', hex: '#C3B091' },
            { name: 'Sand Dollar', hex: '#E8D5B5' },
            { name: 'Driftwood', hex: '#B8A088' },
            { name: 'Tawny', hex: '#CD7F32' },
            { name: 'Umber', hex: '#635147' },
            { name: 'Truffle', hex: '#6B5855' },
        ],
    },
    {
        name: 'Dark Tones',
        colors: [
            { name: 'Tricorn Black', hex: '#2F2E2E' },
            { name: 'Iron Ore', hex: '#484643' },
            { name: 'Peppercorn', hex: '#5B5856' },
            { name: 'Charcoal', hex: '#36454F' },
            { name: 'Wrought Iron', hex: '#46464A' },
            { name: 'Inkwell', hex: '#31373D' },
            { name: 'Midnight', hex: '#25282B' },
            { name: 'Jet Black', hex: '#1C1C1C' },
            { name: 'Onyx', hex: '#353839' },
            { name: 'Graphite', hex: '#4A4A4A' },
            { name: 'Gunmetal', hex: '#536872' },
            { name: 'Dark Night', hex: '#2A2D34' },
        ],
    },
];

// Flatten all colours into the "All" category
const allColors = COLOR_CATEGORIES.slice(1).flatMap((cat) => cat.colors);
COLOR_CATEGORIES[0].colors = allColors;

/* ────────────────────── SVG icons ────────────────────── */
const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const SwatchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor" opacity="0.3" />
        <rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor" />
        <rect x="13" y="7" width="4" height="4" rx="1" fill="currentColor" />
        <rect x="7" y="13" width="4" height="4" rx="1" fill="currentColor" />
        <rect x="13" y="13" width="4" height="4" rx="1" fill="currentColor" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ────────────────────── helpers ────────────────────── */
const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function getContrastColor(hex) {
    const c = hex.replace('#', '');
    const full = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 170 ? '#333333' : '#FFFFFF';
}

/* ────────────────────── component ────────────────────── */
const ColorPickerModal = ({ isOpen, onClose, onSelectColor, title = 'Pick a Color' }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [customHex, setCustomHex] = useState('#');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const tabsRef = useRef(null);
    const tabsInnerRef = useRef(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveCategory('All');
            setSearchTerm('');
            setSelectedColor(null);
            setCustomHex('#');
        }
    }, [isOpen]);

    // Track tab scroll position
    const updateScrollIndicators = () => {
        const el = tabsInnerRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        const el = tabsInnerRef.current;
        if (!el || !isOpen) return;
        updateScrollIndicators();
        el.addEventListener('scroll', updateScrollIndicators, { passive: true });
        window.addEventListener('resize', updateScrollIndicators);
        return () => {
            el.removeEventListener('scroll', updateScrollIndicators);
            window.removeEventListener('resize', updateScrollIndicators);
        };
    }, [isOpen]);

    const scrollTabs = (direction) => {
        const el = tabsInnerRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === 'left' ? -160 : 160, behavior: 'smooth' });
    };

    // Lock background scroll while modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Filtered colours
    const filteredColors = useMemo(() => {
        const category = COLOR_CATEGORIES.find((c) => c.name === activeCategory) || COLOR_CATEGORIES[0];
        if (!searchTerm.trim()) return category.colors;
        const lower = searchTerm.toLowerCase();
        return category.colors.filter(
            (c) => c.name.toLowerCase().includes(lower) || c.hex.toLowerCase().includes(lower),
        );
    }, [activeCategory, searchTerm]);

    const handleSwatchClick = (color) => {
        setSelectedColor(color);
        setCustomHex(color.hex);
    };

    const handleCustomHexChange = (e) => {
        let value = e.target.value;
        if (!value.startsWith('#')) value = '#' + value;
        setCustomHex(value);
        if (hexRegex.test(value)) {
            setSelectedColor({ name: 'Custom Color', hex: value.toUpperCase() });
        }
    };

    const handleAddColor = () => {
        if (selectedColor && hexRegex.test(selectedColor.hex)) {
            onSelectColor(selectedColor.hex.toUpperCase());
            onClose();
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="cpm-overlay" onClick={handleOverlayClick}>
            <div className="cpm-modal">
                {/* Header */}
                <div className="cpm-header">
                    <div className="cpm-header-left">
                        <SwatchIcon />
                        <h3 className="cpm-title">{title}</h3>
                    </div>
                    <button className="cpm-close-btn" type="button" onClick={onClose}><CloseIcon /></button>
                </div>

                {/* Search */}
                <div className="cpm-search-bar">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search colors by name or hex..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Category Tabs */}
                <div className="cpm-tabs-wrap" ref={tabsRef}>
                    {canScrollLeft && (
                        <button type="button" className="cpm-tabs-arrow cpm-tabs-arrow-left" onClick={() => scrollTabs('left')}>
                            <ChevronLeftIcon />
                        </button>
                    )}
                    <div className={`cpm-tabs-scroll ${canScrollLeft ? 'fade-left' : ''} ${canScrollRight ? 'fade-right' : ''}`} ref={tabsInnerRef}>
                        <div className="cpm-tabs">
                            {COLOR_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.name}
                                    type="button"
                                    className={`cpm-tab ${activeCategory === cat.name ? 'active' : ''}`}
                                    onClick={() => { setActiveCategory(cat.name); setSearchTerm(''); }}
                                >
                                    {cat.name}
                                    <span className="cpm-tab-count">{cat.colors.length}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {canScrollRight && (
                        <button type="button" className="cpm-tabs-arrow cpm-tabs-arrow-right" onClick={() => scrollTabs('right')}>
                            <ChevronRightIcon />
                        </button>
                    )}
                </div>

                {/* Color Grid */}
                <div className="cpm-grid-area">
                    {filteredColors.length === 0 ? (
                        <div className="cpm-empty">No colours found matching "{searchTerm}"</div>
                    ) : (
                        <div className="cpm-grid">
                            {filteredColors.map((color) => {
                                const isSelected = selectedColor?.hex === color.hex;
                                return (
                                    <button
                                        key={color.hex + color.name}
                                        type="button"
                                        className={`cpm-swatch ${isSelected ? 'selected' : ''}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={`${color.name} — ${color.hex}`}
                                        onClick={() => handleSwatchClick(color)}
                                    >
                                        {isSelected && (
                                            <svg className="cpm-check" viewBox="0 0 24 24" fill="none">
                                                <path d="M5 13l4 4L19 7" stroke={getContrastColor(color.hex)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer: preview + custom hex + add button */}
                <div className="cpm-footer">
                    <div className="cpm-preview-strip">
                        <div
                            className="cpm-preview-swatch"
                            style={{ backgroundColor: selectedColor ? selectedColor.hex : '#e0e0e0' }}
                        />
                        <div className="cpm-preview-info">
                            <span className="cpm-preview-name">{selectedColor ? selectedColor.name : 'No color selected'}</span>
                            <span className="cpm-preview-hex">{selectedColor ? selectedColor.hex : '—'}</span>
                        </div>
                    </div>

                    <div className="cpm-footer-right">
                        <div className="cpm-custom-hex-wrap">
                            <span className="cpm-hex-label">HEX</span>
                            <input
                                type="text"
                                className="cpm-hex-input"
                                value={customHex}
                                onChange={handleCustomHexChange}
                                placeholder="#AABBCC"
                                maxLength={7}
                            />
                        </div>
                        <button
                            type="button"
                            className="cpm-add-btn"
                            disabled={!selectedColor || !hexRegex.test(selectedColor.hex)}
                            onClick={handleAddColor}
                        >
                            Add Color
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorPickerModal;
