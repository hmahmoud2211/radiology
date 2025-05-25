import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Study, ImageAnnotation, Measurement } from '@/types';
import { studies as mockStudies } from '@/mocks/studies';

interface StudiesState {
  studies: Study[];
  selectedStudy: Study | null;
  annotations: ImageAnnotation[];
  measurements: Measurement[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStudies: () => Promise<void>;
  addStudy: (study: Omit<Study, 'id'>) => Promise<Study>;
  updateStudy: (id: string, study: Partial<Study>) => Promise<Study>;
  deleteStudy: (id: string) => Promise<void>;
  selectStudy: (id: string) => void;
  getPatientStudies: (patientId: string) => Study[];
  
  // Annotations and measurements
  addAnnotation: (annotation: Omit<ImageAnnotation, 'id' | 'createdAt'>) => void;
  updateAnnotation: (id: string, updates: Partial<ImageAnnotation>) => void;
  deleteAnnotation: (id: string) => void;
  addMeasurement: (measurement: Omit<Measurement, 'id' | 'createdAt'>) => void;
  updateMeasurement: (id: string, updates: Partial<Measurement>) => void;
  deleteMeasurement: (id: string) => void;
}

export const useStudiesStore = create<StudiesState>()(
  persist(
    (set, get) => ({
      studies: [],
      selectedStudy: null,
      annotations: [],
      measurements: [],
      isLoading: false,
      error: null,

      fetchStudies: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we'll use mock data
          set({ studies: mockStudies, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch studies', isLoading: false });
        }
      },

      addStudy: async (study: Omit<Study, 'id'>) => {
        const newStudy: Study = {
          ...study,
          id: Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({
          studies: [...state.studies, newStudy],
        }));
        return newStudy;
      },

      updateStudy: async (id: string, study: Partial<Study>) => {
        const updatedStudy: Study = {
          ...get().studies.find((s) => s.id === id)!,
          ...study,
          id,
        };
        set((state) => ({
          studies: state.studies.map((s) => (s.id === id ? updatedStudy : s)),
        }));
        return updatedStudy;
      },

      deleteStudy: async (id: string) => {
        set((state) => ({
          studies: state.studies.filter((s) => s.id !== id),
        }));
      },

      selectStudy: (id: string) => {
        const study = get().studies.find((s) => s.id === id);
        set({ selectedStudy: study || null });
      },

      getPatientStudies: (patientId: string) => {
        return get().studies.filter((s) => s.patientId === patientId);
      },

      addAnnotation: (annotation) => {
        const newAnnotation: ImageAnnotation = {
          ...annotation,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          annotations: [...state.annotations, newAnnotation],
        }));
      },

      updateAnnotation: (id, updates) => {
        set((state) => ({
          annotations: state.annotations.map((annotation) =>
            annotation.id === id ? { ...annotation, ...updates } : annotation
          ),
        }));
      },

      deleteAnnotation: (id) => {
        set((state) => ({
          annotations: state.annotations.filter((annotation) => annotation.id !== id),
        }));
      },

      addMeasurement: (measurement) => {
        const newMeasurement: Measurement = {
          ...measurement,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          measurements: [...state.measurements, newMeasurement],
        }));
      },

      updateMeasurement: (id, updates) => {
        set((state) => ({
          measurements: state.measurements.map((measurement) =>
            measurement.id === id ? { ...measurement, ...updates } : measurement
          ),
        }));
      },

      deleteMeasurement: (id) => {
        set((state) => ({
          measurements: state.measurements.filter((measurement) => measurement.id !== id),
        }));
      },
    }),
    {
      name: 'studies-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);