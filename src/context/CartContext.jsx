'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { products } from '@/data/products';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const loadCart = async () => {
    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id);
    if (error) return;
    const cartItems = data.map(row => {
      const product = products.find(p => p.id === row.product_id);
      return product ? { ...product, qty: row.quantity } : null;
    }).filter(Boolean);
    setCart(cartItems);
  };

  const addItem = useCallback(async (product) => {
    if (!user) return;
    const existing = cart.find(p => p.id === product.id);
    if (existing) {
      await changeQty(product.id, 1);
      return;
    }
    const { error } = await supabase.from('cart').upsert({
      user_id: user.id,
      product_id: product.id,
      quantity: 1
    }, { onConflict: 'user_id,product_id' });
    if (!error) setCart(prev => [...prev, { ...product, qty: 1 }]);
  }, [user, cart]);

  const removeItem = useCallback(async (productId) => {
    if (!user) return;
    await supabase.from('cart').delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);
    setCart(prev => prev.filter(p => p.id !== productId));
  }, [user]);

  const changeQty = useCallback(async (productId, delta) => {
    if (!user) return;
    const item = cart.find(p => p.id === productId);
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      await removeItem(productId);
      return;
    }
    await supabase.from('cart').update({ quantity: newQty })
      .eq('user_id', user.id)
      .eq('product_id', productId);
    setCart(prev => prev.map(p => p.id === productId ? { ...p, qty: newQty } : p));
  }, [user, cart]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    await supabase.from('cart').delete().eq('user_id', user.id);
    setCart([]);
  }, [user]);

  const totalItems = cart.reduce((sum, p) => sum + p.qty, 0);
  const totalPrice = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <CartContext.Provider value={{ cart, isOpen, setIsOpen, addItem, removeItem, changeQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);