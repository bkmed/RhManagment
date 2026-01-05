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
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteDevice: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
    },
});

export const { setDevices, addDevice, updateDevice, deleteDevice } = devicesSlice.actions;

export const selectAllDevices = (state: { devices: DevicesState }) => state.devices.items;
export const selectDeviceById = (id: number) => (state: { devices: DevicesState }) =>
    state.devices.items.find(d => d.id === id);

export default devicesSlice.reducer;
