import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Patient, Appointment } from '@/types';
import { patients as mockPatients } from '@/mocks/patients';
import { appointments as mockAppointments } from '@/mocks/appointments';
import { TIME_SLOTS } from '@/app/(tabs)/weekly-schedule';

interface PatientState {
  patients: Patient[];
  appointments: Appointment[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPatients: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  selectPatient: (id: string | null) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getPatientAppointments: (patientId: string) => Appointment[];
}

// Helper to normalize date to YYYY-MM-DD
function normalizeDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

// Helper to normalize time to TIME_SLOTS format
function normalizeTime(input: string): string {
  // Try to parse input like '11 am', '11:00', '11:00 AM', etc.
  let date = new Date('1970-01-01T' + input.replace(/(am|pm)/i, (m) => m.toUpperCase()).replace(/ /g, ''));
  if (isNaN(date.getTime())) {
    // Try to parse '11 am' or '11pm'
    const match = input.match(/^(\d{1,2})(:(\d{2}))? ?([APap][Mm])?$/);
    if (match) {
      let hour = parseInt(match[1], 10);
      let min = match[3] ? parseInt(match[3], 10) : 0;
      let ampm = match[4] ? match[4].toUpperCase() : (hour < 8 ? 'PM' : 'AM');
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      date = new Date(1970, 0, 1, hour, min);
    }
  }
  // Format as 'HH:MM AM/PM' with leading zero
  let hour = date.getHours();
  let min = date.getMinutes();
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const hourStr = hour < 10 ? '0' + hour : '' + hour;
  const minStr = min < 10 ? '0' + min : '' + min;
  const formatted = `${hourStr}:${minStr} ${ampm}`;
  // If not in TIME_SLOTS, fallback to closest
  if (TIME_SLOTS && !TIME_SLOTS.includes(formatted)) {
    // Find closest slot
    let best = TIME_SLOTS[0];
    let bestDiff = Math.abs(
      parseInt(TIME_SLOTS[0].split(':')[0], 10) * 60 + parseInt(TIME_SLOTS[0].split(':')[1], 10) - (date.getHours() * 60 + date.getMinutes())
    );
    for (const slot of TIME_SLOTS) {
      const [h, rest] = slot.split(':');
      const [m, ap] = rest.split(' ');
      let slotHour = parseInt(h, 10);
      if (ap === 'PM' && slotHour < 12) slotHour += 12;
      if (ap === 'AM' && slotHour === 12) slotHour = 0;
      const slotMin = parseInt(m, 10);
      const diff = Math.abs(slotHour * 60 + slotMin - (date.getHours() * 60 + date.getMinutes()));
      if (diff < bestDiff) {
        best = slot;
        bestDiff = diff;
      }
    }
    return best;
  }
  return formatted;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: [],
      appointments: [],
      selectedPatient: null,
      isLoading: false,
      error: null,

      fetchPatients: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we'll use mock data
          set({ patients: mockPatients, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch patients', isLoading: false });
        }
      },

      fetchAppointments: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, just keep current state (persisted by zustand)
          set((state) => ({ appointments: state.appointments, isLoading: false }));
        } catch (error) {
          set({ error: 'Failed to fetch appointments', isLoading: false });
        }
      },

      addPatient: async (patient) => {
        set({ isLoading: true, error: null });
        try {
          const newPatient: Patient = {
            ...patient,
            id: Date.now().toString(),
          };
          set((state) => ({
            patients: [...state.patients, newPatient],
            isLoading: false,
          }));
          return newPatient;
        } catch (error) {
          set({ error: 'Failed to add patient', isLoading: false });
          throw error;
        }
      },

      updatePatient: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            patients: state.patients.map((patient) =>
              patient.id === id ? { ...patient, ...updates } : patient
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update patient', isLoading: false });
        }
      },

      deletePatient: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            patients: state.patients.filter((patient) => patient.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete patient', isLoading: false });
        }
      },

      selectPatient: (id) => {
        if (id === null) {
          set({ selectedPatient: null });
          return;
        }
        
        const patient = get().patients.find((p) => p.id === id) || null;
        set({ selectedPatient: patient });
      },

      addAppointment: async (appointment) => {
        set({ isLoading: true, error: null });
        try {
          // Normalize date and time
          const normalizedDate = normalizeDate(appointment.date);
          const normalizedTime = normalizeTime(appointment.time);
          const newAppointment: Appointment = {
            ...appointment,
            id: Date.now().toString(),
            date: normalizedDate,
            time: normalizedTime,
          };
          set((state) => ({
            appointments: [...state.appointments, newAppointment],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to add appointment', isLoading: false });
        }
      },

      updateAppointment: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            appointments: state.appointments.map((appointment) =>
              appointment.id === id ? { ...appointment, ...updates } : appointment
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update appointment', isLoading: false });
        }
      },

      deleteAppointment: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            appointments: state.appointments.filter((appointment) => appointment.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete appointment', isLoading: false });
        }
      },

      getPatientAppointments: (patientId) => {
        return get().appointments.filter((appointment) => appointment.patientId === patientId);
      },
    }),
    {
      name: 'patient-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);