import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Device } from '../../database/schema';

interface DevicesState {
  items: Device[];
  loading: boolean;
  error: string | null;
}

const initialState: DevicesState = {
  items: [],
  loading: false,
  error: null,
};

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.items = action.payload;
    },
    addDevice: (state, action: PayloadAction<Device>) => {
      state.items.push(action.payload);
    },
    updateDevice: (state, action: PayloadAction<Device>) => {
      const index = state.items.findIndex(
        item => item.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateDeviceStatus: (
      state,
      action: PayloadAction<{ id: number; condition: 'working' | 'faulty' }>,
    ) => {
      const device = state.items.find(item => item.id === action.payload.id);
      if (device) {
        device.condition = action.payload.condition;
        device.updatedAt = new Date().toISOString();
      }
    },
    assignDevice: (
      state,
      action: PayloadAction<{
        id: number;
        employeeId: number;
        employeeName: string;
      }>,
    ) => {
      const device = state.items.find(item => item.id === action.payload.id);
      if (device) {
        device.assignedToId = action.payload.employeeId;
        device.assignedTo = action.payload.employeeName;
        device.status = 'assigned';
        device.updatedAt = new Date().toISOString();
      }
    },
    deleteDevice: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const {
  setDevices,
  addDevice,
  updateDevice,
  deleteDevice,
  updateDeviceStatus,
  assignDevice,
} = devicesSlice.actions;

export const selectAllDevices = (state: { devices: DevicesState }) =>
  state.devices.items;
export const selectDeviceById =
  (id: number) => (state: { devices: DevicesState }) =>
    state.devices.items.find(d => d.id === id);

export default devicesSlice.reducer;
