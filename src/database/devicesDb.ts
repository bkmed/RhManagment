import { store } from '../store';
import {
  addDevice as addDeviceAction,
  updateDevice as updateDeviceAction,
  deleteDevice as deleteDeviceAction,
  selectAllDevices,
  updateDeviceStatus as updateDeviceStatusAction,
} from '../store/slices/devicesSlice';
import { Device } from './schema';

export const devicesDb = {
  // Initialize if empty
  init: async () => {},

  getAll: async (): Promise<Device[]> => {
    return selectAllDevices(store.getState());
  },

  getById: async (id: string): Promise<Device | null> => {
    const devices = selectAllDevices(store.getState());
    return devices.find(d => d.id === id) || null;
  },

  getByEmployeeId: async (employeeId: string): Promise<Device[]> => {
    const devices = selectAllDevices(store.getState());
    return devices.filter(d => d.assignedToId === employeeId);
  },

  add: async (
    device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();
    const newDevice: Device = {
      ...device,
      id,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addDeviceAction(newDevice));
    return id;
  },

  update: async (id: string, updates: Partial<Device>): Promise<void> => {
    const devices = selectAllDevices(store.getState());
    const existing = devices.find(d => d.id === id);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateDeviceAction(updated));
    }
  },

  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteDeviceAction(id));
  },

  updateStatus: async (
    id: string,
    condition: 'working' | 'faulty',
  ): Promise<void> => {
    store.dispatch(updateDeviceStatusAction({ id, condition }));
  },
};
