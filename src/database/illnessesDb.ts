import { store } from '../store';
import {
  addIllness as addIllnessAction,
  updateIllness as updateIllnessAction,
  deleteIllness as deleteIllnessAction,
  selectAllIllnesses,
  selectExpiringSoonIllnesses,
} from '../store/slices/illnessesSlice';
import { Illness } from './schema';

export const illnessesDb = {
  // Get all illnesses
  getAll: async (): Promise<Illness[]> => {
    const illnesses = selectAllIllnesses(store.getState());
    return [...illnesses].sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    );
  },

  // Get expiring illnesses (within 30 days)
  getExpiringSoon: async (): Promise<Illness[]> => {
    return selectExpiringSoonIllnesses(store.getState());
  },

  // Get illness by ID
  getById: async (id: string): Promise<Illness | null> => {
    const illnesses = selectAllIllnesses(store.getState());
    return illnesses.find(p => p.id === id) || null;
  },

  // Add new illness
  add: async (
    illness: Omit<Illness, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();

    const newIllness: Illness = {
      ...illness,
      id,
      createdAt: now,
      updatedAt: now,
    };

    store.dispatch(addIllnessAction(newIllness));

    return id;
  },

  // Update illness
  update: async (id: string, updates: Partial<Illness>): Promise<void> => {
    const illnesses = selectAllIllnesses(store.getState());
    const existing = illnesses.find(p => p.id === id);

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateIllnessAction(updated));
    }
  },

  // Delete illness
  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteIllnessAction(id));
  },
};
