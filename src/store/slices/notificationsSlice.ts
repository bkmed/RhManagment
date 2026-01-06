import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string; // Route name or deep link
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [
    {
      id: '1',
      title: 'Welcome to RhManagment!',
      message: 'Explore the new Phase 3 features like Search and Chat.',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsRead: state => {
      state.items.forEach(n => {
        n.isRead = true;
      });
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(n => n.id !== action.payload);
    },
    clearAll: state => {
      state.items = [];
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} = notificationsSlice.actions;

export const selectAllNotifications = (state: {
  notifications: NotificationsState;
}) => state.notifications.items;
export const selectUnreadCount = (state: {
  notifications: NotificationsState;
}) => state.notifications.items.filter(n => !n.isRead).length;

export default notificationsSlice.reducer;
