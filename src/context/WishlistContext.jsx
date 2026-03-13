'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(x => x.id === product.id);
      if (exists) return prev.filter(x => x.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback((id) => {
    return wishlist.some(x => x.id === id);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);