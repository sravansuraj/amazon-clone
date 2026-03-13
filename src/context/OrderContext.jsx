'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) loadOrders();
    else setOrders([]);
  }, [user]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return;
    setOrders(data.map(row => ({
      id: row.order_id,
      date: new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date(row.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: row.status,
      estimatedDelivery: 'Tomorrow by 9 PM',
      items: row.items,
      grandTotal: row.grand_total,
      deliveryFee: row.delivery_fee,
      tax: row.tax,
      discount: row.discount,
      payMethod: row.pay_method,
      city: row.city,
      state: row.state,
    })));
  };

  const placeOrder = useCallback(async (orderDetails) => {
    if (!user) return null;
    const orderId = `ORD-${Date.now()}`;
    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      order_id: orderId,
      items: orderDetails.items,
      grand_total: orderDetails.grandTotal,
      delivery_fee: orderDetails.deliveryFee,
      tax: orderDetails.tax,
      discount: orderDetails.discount,
      pay_method: orderDetails.payMethod,
      city: orderDetails.city,
      state: orderDetails.state,
      status: 'Confirmed',
    });
    if (error) return null;
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Confirmed',
      estimatedDelivery: 'Tomorrow by 9 PM',
      ...orderDetails,
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [user]);

  return (
    <OrderContext.Provider value={{ orders, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);