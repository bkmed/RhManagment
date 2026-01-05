import { store } from '../store';
import {
    setDevices,
    addDevice as addDeviceAction,
    updateDevice as updateDeviceAction,
    deleteDevice as deleteDeviceAction,
    selectAllDevices,
    updateDeviceStatus as updateDeviceStatusAction,
} from '../store/slices/devicesSlice';
import { Device } from './schema';

const MOCK_DEVICES: Device[] = [
    {
        id: 1,
        name: 'MacBook Pro 16"',
        type: 'Laptop',
        serialNumber: 'APPLE-MBP-2024-001',
        status: 'assigned',
        condition: 'working',
        assignedToId: 1, // Demo Admin
        assignedTo: 'Demo Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Dell UltraSharp 27"',
        type: 'Screen',
        serialNumber: 'DELL-U27-002',
        status: 'assigned',
        condition: 'working',
        assignedToId: 2, // Demo Employee
        assignedTo: 'Demo Employee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Logitech MX Master 3S',
        type: 'Mouse',
        serialNumber: 'LOGI-MX-003',
        status: 'available',
        condition: 'working',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const devicesDb = {
    // Initialize if empty
    init: async () => {
        if (selectAllDevices(store.getState()).length === 0) {
            store.dispatch(setDevices(MOCK_DEVICES));
        }
    },

    getAll: async (): Promise<Device[]> => {
        return selectAllDevices(store.getState());
    },

    getById: async (id: number): Promise<Device | null> => {
        const devices = selectAllDevices(store.getState());
        return devices.find(d => d.id === id) || null;
    },

    getByEmployeeId: async (employeeId: number): Promise<Device[]> => {
        const devices = selectAllDevices(store.getState());
        return devices.filter(d => d.assignedToId === employeeId);
    },

    add: async (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
        const now = new Date().toISOString();
        const id = Date.now();
        const newDevice: Device = {
            ...device,
            id,
            createdAt: now,
            updatedAt: now,
        };
        store.dispatch(addDeviceAction(newDevice));
        return id;
    },

    update: async (id: number, updates: Partial<Device>): Promise<void> => {
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

    delete: async (id: number): Promise<void> => {
        store.dispatch(deleteDeviceAction(id));
    },

    updateStatus: async (id: number, condition: 'working' | 'faulty'): Promise<void> => {
        store.dispatch(updateDeviceStatusAction({ id, condition }));
    }
};
