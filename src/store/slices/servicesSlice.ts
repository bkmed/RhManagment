import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service } from '../../database/schema';

interface ServicesState {
  items: Service[];
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.items = action.payload;
    },
    addService: (state, action: PayloadAction<Service>) => {
      state.items.push(action.payload);
    },
    updateService: (state, action: PayloadAction<Service>) => {
      const index = state.items.findIndex(
        item => item.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteService: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { setServices, addService, updateService, deleteService } =
  servicesSlice.actions;

export const selectAllServices = (state: { services: ServicesState }) =>
  state.services.items;
export const selectServiceById =
  (id: string) => (state: { services: ServicesState }) =>
    state.services.items.find(s => s.id === id);

export default servicesSlice.reducer;
