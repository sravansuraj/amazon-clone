'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(x => x.id === product.id);
      if (existing) return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`"${product.name.split(' ').slice(0, 4).join(' ')}..." added to cart`);
  }, []);

  const changeQty = useCallback((id, delta) => {
    setCart(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x);
      return updated.filter(x => x.qty > 0);
    });
  }, []);

  const removeItem = useCallback((id) => {
    setCart(prev => prev.filter(x => x.id !== id));
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2500);
  };

  const totalItems = cart.reduce((s, x) => s + x.qty, 0);
  const totalPrice = cart.reduce((s, x) => s + x.price * x.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, changeQty, removeItem, isOpen, setIsOpen, toast, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
