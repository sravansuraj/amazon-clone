'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { products } from '@/data/products';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', user.id);
    if (error) return;
    const items = data.map(row => {
      return products.find(p => p.id === row.product_id);
    }).filter(Boolean);
    setWishlist(items);
  };

  const toggleWishlist = useCallback(async (product) => {
    if (!user) return;
    const exists = wishlist.find(p => p.id === product.id);
    if (exists) {
      await supabase.from('wishlist').delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      setWishlist(prev => prev.filter(p => p.id !== product.id));
    } else {
      await supabase.from('wishlist').insert({
        user_id: user.id,
        product_id: product.id,
      });
      setWishlist(prev => [...prev, product]);
    }
  }, [user, wishlist]);

  const isWishlisted = useCallback((productId) => {
    return wishlist.some(p => p.id === productId);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);