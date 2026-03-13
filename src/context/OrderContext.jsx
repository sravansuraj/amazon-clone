'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const placeOrder = useCallback((orderDetails) => {
    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Confirmed',
      estimatedDelivery: 'Tomorrow by 9 PM',
      ...orderDetails,
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  return (
    <OrderContext.Provider value={{ orders, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);