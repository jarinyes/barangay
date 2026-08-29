import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { NotificationItem } from '../types';
import { supabase } from '../utils/supabaseClient';

export interface NotificationState {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export const NotificationContext = createContext<NotificationState | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        const notifsRes = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
        if (notifsRes.data) {
          setNotifications(notifsRes.data as NotificationItem[]);
        }
      } catch (err) {
        console.error('Error fetching notifications from Supabase:', err);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
