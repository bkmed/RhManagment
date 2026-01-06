import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeviceTypesState {
  items: string[];
}

const initialState: DeviceTypesState = {
  items: ['Laptop', 'Mouse', 'Keyboard', 'Screen', 'Headset', 'Phone', 'Other'],
};

const deviceTypesSlice = createSlice({
  name: 'deviceTypes',
  initialState,
  reducers: {
    addDeviceType: (state, action: PayloadAction<string>) => {
      if (!state.items.includes(action.payload)) {
        state.items.push(action.payload);
      }
    },
    deleteDeviceType: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(type => type !== action.payload);
    },
  },
});

export const { addDeviceType, deleteDeviceType } = deviceTypesSlice.actions;

export const selectAllDeviceTypes = (state: {
  deviceTypes: DeviceTypesState;
}) => state.deviceTypes.items;

export default deviceTypesSlice.reducer;
