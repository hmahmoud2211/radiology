import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Patient, Appointment } from '@/types';
import { patients as mockPatients } from '@/mocks/patients';
import { appointments as mockAppointments } from '@/mocks/appointments';

interface PatientState {
  patients: Patient[];
  appointments: Appointment[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPatients: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  selectPatient: (id: string | null) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getPatientAppointments: (patientId: string) => Appointment[];
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
          set({ appointments: mockAppointments, isLoading: false });
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
        } catch (error) {
          set({ error: 'Failed to add patient', isLoading: false });
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
          const newAppointment: Appointment = {
            ...appointment,
            id: Date.now().toString(),
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