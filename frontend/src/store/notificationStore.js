import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],

      // Add a notification
      addNotification: ({ type = 'info', title, message, icon }) => {
        const notification = {
          id: Date.now() + Math.random(),
          type,
          title,
          message,
          icon: icon || getDefaultIcon(type),
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 50),
        }));
      },

      // Mark one as read
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      // Delete one
      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      // Delete all
      deleteAll: () => {
        set({ notifications: [] });
      },

      // Unread count
      get unreadCount() {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: 'medcare-notifications',
    }
  )
);

function getDefaultIcon(type) {
  switch (type) {
    case 'appointment': return '📅';
    case 'payment':     return '💳';
    case 'profile':     return '👤';
    case 'system':      return '⚙️';
    case 'success':     return '✅';
    case 'warning':     return '⚠️';
    case 'error':       return '❌';
    default:            return '🔔';
  }
}
