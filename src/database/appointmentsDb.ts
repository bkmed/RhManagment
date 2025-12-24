import { storageService } from '../services/storage';
import { Appointment } from './schema';

const APPOINTMENTS_KEY = 'appointments';

// Helper functions
const getAllAppointments = (): Appointment[] => {
  const json = storageService.getString(APPOINTMENTS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllAppointments = (appointments: Appointment[]): void => {
  storageService.setString(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const appointmentsDb = {
  // Get all appointments
  getAll: async (): Promise<Appointment[]> => {
    const appointments = getAllAppointments();
    return appointments.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
  },

  // Get upcoming appointments
  getUpcoming: async (): Promise<Appointment[]> => {
    const appointments = getAllAppointments();
    const now = new Date().toISOString();

    return appointments
      .filter(a => a.dateTime >= now)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
  },

  // Get appointments by doctor ID
  getByDoctorId: async (doctorId: number): Promise<Appointment[]> => {
    const appointments = getAllAppointments();
    return appointments
      .filter(a => a.doctorId === doctorId)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
  },

  // Get appointment by ID
  getById: async (id: number): Promise<Appointment | null> => {
    const appointments = getAllAppointments();
    return appointments.find(a => a.id === id) || null;
  },

  // Add new appointment
  add: async (
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const appointments = getAllAppointments();
    const now = new Date().toISOString();
    const id = Date.now();

    const newAppointment: Appointment = {
      ...appointment,
      id,
      createdAt: now,
      updatedAt: now,
    };

    appointments.push(newAppointment);
    saveAllAppointments(appointments);

    return id;
  },

  // Update appointment
  update: async (id: number, updates: Partial<Appointment>): Promise<void> => {
    const appointments = getAllAppointments();
    const index = appointments.findIndex(a => a.id === id);

    if (index !== -1) {
      appointments[index] = {
        ...appointments[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveAllAppointments(appointments);
    }
  },

  // Delete appointment
  delete: async (id: number): Promise<void> => {
    const appointments = getAllAppointments();
    const filtered = appointments.filter(a => a.id !== id);
    saveAllAppointments(filtered);
  },
};
