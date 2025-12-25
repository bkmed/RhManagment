import { store } from '../store';
import {
  addIllness as addIllnessAction,
  updateIllness as updateIllnessAction,
  deleteIllness as deleteIllnessAction,
  selectAllIllnesses,
  selectExpiringSoonIllnesses,
} from '../store/slices/illnessesSlice';
import { Illness, IllnessHistory } from './schema';
import { storageService } from '../services/storage';

const ILLNESSES_HISTORY_KEY = 'illnesses_history';

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
    const illnesses = selectAllIllnesses(store.getState());
    return illnesses.sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    );
  },

  // Get expiring illnesses (within 30 days)
  getExpiringSoon: async (): Promise<Illness[]> => {
    return selectExpiringSoonIllnesses(store.getState());
  },

  // Get illness by ID
  getById: async (id: number): Promise<Illness | null> => {
    const illnesses = selectAllIllnesses(store.getState());
    return illnesses.find(p => p.id === id) || null;
  },

  // Add new illness
  add: async (
    illness: Omit<Illness, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const now = new Date().toISOString();
    const id = Date.now();

    const newIllness: Illness = {
      ...illness,
      id,
      createdAt: now,
      updatedAt: now,
    };

    store.dispatch(addIllnessAction(newIllness));
    recordHistory(id, 'created', 'Initial illness record created');

    return id;
  },

  // Update illness
  update: async (id: number, updates: Partial<Illness>): Promise<void> => {
    const illnesses = selectAllIllnesses(store.getState());
    const existing = illnesses.find(p => p.id === id);

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateIllnessAction(updated));
      recordHistory(id, 'updated', 'Illness details updated');
    }
  },

  // Delete illness
  delete: async (id: number): Promise<void> => {
    store.dispatch(deleteIllnessAction(id));

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
