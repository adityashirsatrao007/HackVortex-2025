
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { NotificationType, Booking, ServiceCategory } from '@/lib/types';
import { useAuth } from './auth-context'; // To get current worker ID

interface NotificationContextType {
  notifications: NotificationType[];
  addNotification: (booking: Booking, message?: string) => void;
  getUnreadNotificationsCount: (workerId: string) => number;
  getNotificationsForWorker: (workerId: string) => NotificationType[];
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (workerId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = 'karigarKartNotifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>(() => {
    if (typeof window !== 'undefined') {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return storedNotifications ? JSON.parse(storedNotifications) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((booking: Booking, message?: string) => {
    const newNotification: NotificationType = {
      id: `notif-${Date.now()}-${booking.id}`,
      workerId: booking.workerId,
      bookingId: booking.id,
      customerName: booking.customerName,
      serviceCategory: booking.serviceCategory,
      message: message || `New booking request for ${booking.serviceCategory} from ${booking.customerName}.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const getUnreadNotificationsCount = useCallback((workerId: string): number => {
    return notifications.filter(n => n.workerId === workerId && !n.read).length;
  }, [notifications]);

  const getNotificationsForWorker = useCallback((workerId: string): NotificationType[] => {
    return notifications.filter(n => n.workerId === workerId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback((workerId: string) => {
    setNotifications(prev => 
      prev.map(n => n.workerId === workerId ? { ...n, read: true } : n)
    );
  }, []);


  const value = {
    notifications,
    addNotification,
    getUnreadNotificationsCount,
    getNotificationsForWorker,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
