import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Announcement } from '../../database/schema';

interface AnnouncementsState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementsState = {
  announcements: [],
  loading: false,
  error: null,
};

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    setAnnouncements: (state, action: PayloadAction<Announcement[]>) => {
      state.announcements = action.payload;
    },
    addAnnouncement: (state, action: PayloadAction<Announcement>) => {
      state.announcements.unshift(action.payload);
    },
    updateAnnouncement: (state, action: PayloadAction<Announcement>) => {
      const index = state.announcements.findIndex(
        a => a.id === action.payload.id,
      );
      if (index !== -1) {
        state.announcements[index] = action.payload;
      }
    },
    deleteAnnouncement: (state, action: PayloadAction<string>) => {
      state.announcements = state.announcements.filter(
        a => a.id !== action.payload,
      );
    },
  },
});

export const {
  setAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = announcementsSlice.actions;

export const selectAllAnnouncements = (state: RootState) =>
  state.announcements.announcements;

export default announcementsSlice.reducer;
