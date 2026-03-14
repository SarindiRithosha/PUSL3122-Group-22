// client/src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { resolveAssetUrl } from '../services/customerApi';
import '../styles/CartToast.css';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('furniplan_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('furniplan_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message) => {
    setToastMessage(message);
  };

  const addToCart = (furniture, quantity = 1, selectedColor = null) => {
    const newItem = {
      id: furniture._id || furniture.id,
      name: furniture.name,
      price: furniture.price,
      quantity: quantity,
      image2DUrl: furniture.image2DUrl || furniture.image,
      category: furniture.category,
      selectedColor: selectedColor,
    };

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === newItem.id && item.selectedColor === newItem.selectedColor
      );

      if (existingIndex > -1) {
        // Item exists, increment quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        // New item, add to cart
        return [...prev, newItem];
      }
    });

    // Show toast notification
    showToast(`Added ${furniture.name} to cart!`);
  };

  const incrementItem = (id, selectedColor = null) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id && item.selectedColor === selectedColor
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      )
    );
  };

  const decrementItem = (id, selectedColor = null) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id && item.selectedColor === selectedColor
          ? { ...item, quantity: Math.max(1, item.quantity - 1) } 
          : item
      )
    );
  };

  const removeItem = (id, selectedColor = null) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === id && item.selectedColor === selectedColor)
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        incrementItem,
        decrementItem,
        removeItem,
        clearCart,
        getCartTotal,
        getCartCount,
        showToast,
      }}
    >
      {children}
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="cart-toast">
          <div className="cart-toast-content">
            <svg className="cart-toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span className="cart-toast-message">{toastMessage}</span>
          </div>
          <button 
            className="cart-toast-close" 
            onClick={() => setToastMessage(null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
};
