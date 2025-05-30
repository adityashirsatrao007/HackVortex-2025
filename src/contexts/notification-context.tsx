
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { NotificationType, Booking, ServiceCategory, UserRole } from '@/lib/types'; // Added UserRole
import { useAuth } from './auth-context';

interface NotificationContextType {
  notifications: NotificationType[];
  addNotification: (details: Omit<NotificationType, 'id' | 'timestamp' | 'read'>) => void; // Made more generic
  getUnreadNotificationsCount: (userId: string) => number;
  getNotificationsForUser: (userId: string) => NotificationType[];
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = 'karigarKartNotifications';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>(() => {
    if (typeof window !== 'undefined') {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      try {
        const parsed = storedNotifications ? JSON.parse(storedNotifications) : [];
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse notifications from localStorage", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((details: Omit<NotificationType, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationType = {
      ...details,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications
  }, []);

  const getUnreadNotificationsCount = useCallback((userId: string): number => {
    return notifications.filter(n => n.recipientId === userId && !n.read).length;
  }, [notifications]);

  const getNotificationsForUser = useCallback((userId: string): NotificationType[] => {
    return notifications.filter(n => n.recipientId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback((userId: string) => {
    setNotifications(prev =>
      prev.map(n => n.recipientId === userId ? { ...n, read: true } : n)
    );
  }, []);


  const value = {
    notifications,
    addNotification,
    getUnreadNotificationsCount,
    getNotificationsForUser,
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
