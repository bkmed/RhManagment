import { storageService } from '../services/storage';
import { RemoteWork } from './schema';

const REMOTE_KEY = 'remote_work';

const getAllRemote = (): RemoteWork[] => {
  const json = storageService.getString(REMOTE_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllRemote = (data: RemoteWork[]): void => {
  storageService.setString(REMOTE_KEY, JSON.stringify(data));
};

export const remoteDb = {
  getAll: async (): Promise<RemoteWork[]> => {
    return getAllRemote();
  },

  getByEmployeeId: async (employeeId: number): Promise<RemoteWork[]> => {
    const data = getAllRemote();
    return data.filter(r => r.employeeId === employeeId);
  },

  getByDate: async (date: string): Promise<RemoteWork[]> => {
    const data = getAllRemote();
    return data.filter(r => r.date === date);
  },

  addOrUpdate: async (
    remote: Omit<RemoteWork, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> => {
    const data = getAllRemote();
    const now = new Date().toISOString();
    const index = data.findIndex(
      r => r.employeeId === remote.employeeId && r.date === remote.date,
    );

    if (index !== -1) {
      data[index] = {
        ...data[index],
        status: remote.status,
        updatedAt: now,
      };
    } else {
      data.push({
        ...remote,
        id: Date.now(),
        createdAt: now,
        updatedAt: now,
      });
    }
    saveAllRemote(data);
  },

  delete: async (id: number): Promise<void> => {
    const data = getAllRemote();
    const filtered = data.filter(r => r.id !== id);
    saveAllRemote(filtered);
  },
};
