import { storageService } from '../services/storage';
import { Doctor } from './schema';

const DOCTORS_KEY = 'doctors';

// Helper functions
const getAllDoctors = (): Doctor[] => {
  const json = storageService.getString(DOCTORS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllDoctors = (doctors: Doctor[]): void => {
  storageService.setString(DOCTORS_KEY, JSON.stringify(doctors));
};

export const doctorsDb = {
  // Get all doctors
  getAll: async (): Promise<Doctor[]> => {
    const doctors = getAllDoctors();
    return doctors.sort((a, b) => a.name.localeCompare(b.name));
  },

  // Get doctor by ID
  getById: async (id: number): Promise<Doctor | null> => {
    const doctors = getAllDoctors();
    return doctors.find(d => d.id === id) || null;
  },

  // Add new doctor
  add: async (
    doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const doctors = getAllDoctors();
    const now = new Date().toISOString();
    const id = Date.now();

    const newDoctor: Doctor = {
      ...doctor,
      id,
      createdAt: now,
      updatedAt: now,
    };

    doctors.push(newDoctor);
    saveAllDoctors(doctors);

    return id;
  },

  // Update doctor
  update: async (id: number, updates: Partial<Doctor>): Promise<void> => {
    const doctors = getAllDoctors();
    const index = doctors.findIndex(d => d.id === id);

    if (index !== -1) {
      doctors[index] = {
        ...doctors[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveAllDoctors(doctors);
    }
  },

  // Delete doctor
  delete: async (id: number): Promise<void> => {
    const doctors = getAllDoctors();
    const filtered = doctors.filter(d => d.id !== id);
    saveAllDoctors(filtered);
  },
};
