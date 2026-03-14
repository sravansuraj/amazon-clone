'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) loadNotifications();
    else setNotifications([]);
  }, [user]);

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error) setNotifications(data);
  };

  const addNotification = useCallback(async (message, type = 'info') => {
    if (!user) return;
    const { data, error } = await supabase.from('notifications').insert({
      user_id: user.id,
      message,
      type,
      read: false,
    }).select().single();
    if (!error) setNotifications(prev => [data, ...prev]);
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [user]);

  const clearAll = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications').delete().eq('user_id', user.id);
    setNotifications([]);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);