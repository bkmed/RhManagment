import { storageService } from '../services/storage';
import { Medication, MedicationHistory } from './schema';

const MEDICATIONS_KEY = 'medications';
const MEDICATION_HISTORY_KEY = 'medication_history';

// Helper functions
const getAllMedications = (): Medication[] => {
  const json = storageService.getString(MEDICATIONS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllMedications = (medications: Medication[]): void => {
  storageService.setString(MEDICATIONS_KEY, JSON.stringify(medications));
};

const getAllHistory = (): MedicationHistory[] => {
  const json = storageService.getString(MEDICATION_HISTORY_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllHistory = (history: MedicationHistory[]): void => {
  storageService.setString(MEDICATION_HISTORY_KEY, JSON.stringify(history));
};

export const medicationsDb = {
  // Get all medications
  getAll: async (): Promise<Medication[]> => {
    return getAllMedications();
  },

  // Get medication by ID
  getById: async (id: number): Promise<Medication | null> => {
    const medications = getAllMedications();
    return medications.find(m => m.id === id) || null;
  },

  // Add new medication
  add: async (
    medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const medications = getAllMedications();
    const now = new Date().toISOString();
    const id = Date.now(); // Use timestamp as ID

    const newMedication: Medication = {
      ...medication,
      id,
      createdAt: now,
      updatedAt: now,
    };

    medications.push(newMedication);
    saveAllMedications(medications);

    return id;
  },

  // Update medication
  update: async (id: number, updates: Partial<Medication>): Promise<void> => {
    const medications = getAllMedications();
    const index = medications.findIndex(m => m.id === id);

    if (index !== -1) {
      medications[index] = {
        ...medications[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveAllMedications(medications);
    }
  },

  // Delete medication
  delete: async (id: number): Promise<void> => {
    const medications = getAllMedications();
    const filtered = medications.filter(m => m.id !== id);
    saveAllMedications(filtered);

    // Also delete associated history
    const history = getAllHistory();
    const filteredHistory = history.filter(h => h.medicationId !== id);
    saveAllHistory(filteredHistory);
  },

  // Get medication history
  getHistory: async (medicationId: number): Promise<MedicationHistory[]> => {
    const history = getAllHistory();
    return history
      .filter(h => h.medicationId === medicationId)
      .sort(
        (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime(),
      );
  },

  // Add history entry
  addHistory: async (
    medicationId: number,
    status: 'taken' | 'missed' | 'skipped',
    notes?: string,
  ): Promise<void> => {
    const history = getAllHistory();
    const now = new Date().toISOString();
    const id = Date.now();

    const newEntry: MedicationHistory = {
      id,
      medicationId,
      takenAt: now,
      status,
      notes,
    };

    history.push(newEntry);
    saveAllHistory(history);
  },

  // Get all history (for analytics)
  getAllHistory: async (): Promise<MedicationHistory[]> => {
    return getAllHistory();
  },
};
