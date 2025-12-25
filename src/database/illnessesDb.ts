import { storageService } from '../services/storage';
import { Illness, IllnessHistory } from './schema';

const ILLNESSES_KEY = 'illnesses';
const ILLNESSES_HISTORY_KEY = 'illnesses_history';

// Helper functions
const getAllIllnesses = (): Illness[] => {
  const json = storageService.getString(ILLNESSES_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllIllnesses = (illnesses: Illness[]): void => {
  storageService.setString(ILLNESSES_KEY, JSON.stringify(illnesses));
};

const getAllHistory = (): IllnessHistory[] => {
  const json = storageService.getString(ILLNESSES_HISTORY_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllHistory = (history: IllnessHistory[]): void => {
  storageService.setString(ILLNESSES_HISTORY_KEY, JSON.stringify(history));
};

const recordHistory = (
  illnessId: number,
  action: IllnessHistory['action'],
  notes?: string,
) => {
  const history = getAllHistory();
  const newRecord: IllnessHistory = {
    id: Date.now(),
    illnessId,
    action,
    date: new Date().toISOString(),
    notes,
  };
  history.push(newRecord);
  saveAllHistory(history);
};

export const illnessesDb = {
  // Get all illnesses
  getAll: async (): Promise<Illness[]> => {
    const illnesses = getAllIllnesses();
    return illnesses.sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    );
  },

  // Get expiring illnesses (within 30 days)
  getExpiringSoon: async (): Promise<Illness[]> => {
    const illnesses = getAllIllnesses();
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return illnesses
      .filter(p => {
        if (!p.expiryDate) return false;
        const expiryDate = new Date(p.expiryDate);
        return expiryDate >= now && expiryDate <= thirtyDaysLater;
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime(),
      );
  },

  // Get illness by ID
  getById: async (id: number): Promise<Illness | null> => {
    const illnesses = getAllIllnesses();
    return illnesses.find(p => p.id === id) || null;
  },

  // Add new illness
  add: async (
    illness: Omit<Illness, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const illnesses = getAllIllnesses();
    const now = new Date().toISOString();
    const id = Date.now();

    const newIllness: Illness = {
      ...illness,
      id,
      createdAt: now,
      updatedAt: now,
    };

    illnesses.push(newIllness);
    saveAllIllnesses(illnesses);
    recordHistory(id, 'created', 'Initial illness record created');

    return id;
  },

  // Update illness
  update: async (id: number, updates: Partial<Illness>): Promise<void> => {
    const illnesses = getAllIllnesses();
    const index = illnesses.findIndex(p => p.id === id);

    if (index !== -1) {
      illnesses[index] = {
        ...illnesses[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveAllIllnesses(illnesses);
      recordHistory(id, 'updated', 'Illness details updated');
    }
  },

  // Delete illness
  delete: async (id: number): Promise<void> => {
    const illnesses = getAllIllnesses();
    const filtered = illnesses.filter(p => p.id !== id);
    saveAllIllnesses(filtered);

    // Also delete associated history
    const history = getAllHistory();
    const filteredHistory = history.filter(h => h.illnessId !== id);
    saveAllHistory(filteredHistory);
  },

  // Get history
  getHistory: async (id: number): Promise<IllnessHistory[]> => {
    const history = getAllHistory();
    return history
      .filter(h => h.illnessId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
};
