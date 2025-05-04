import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RadiologyTest } from '@/types';
import { radiologyTests as mockTests } from '@/mocks/tests';

interface TestsState {
  tests: RadiologyTest[];
  selectedTest: RadiologyTest | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTests: () => Promise<void>;
  addTest: (test: Omit<RadiologyTest, 'id'>) => Promise<void>;
  updateTest: (id: string, updates: Partial<RadiologyTest>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  selectTest: (id: string | null) => void;
  filterTestsByModality: (modality: string) => RadiologyTest[];
  filterTestsByBodyPart: (bodyPart: string) => RadiologyTest[];
  searchTests: (query: string) => RadiologyTest[];
}

export const useTestsStore = create<TestsState>()(
  persist(
    (set, get) => ({
      tests: [],
      selectedTest: null,
      isLoading: false,
      error: null,

      fetchTests: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we'll use mock data
          set({ tests: mockTests, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch tests', isLoading: false });
        }
      },

      addTest: async (test) => {
        set({ isLoading: true, error: null });
        try {
          const newTest: RadiologyTest = {
            ...test,
            id: Date.now().toString(),
          };
          set((state) => ({
            tests: [...state.tests, newTest],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to add test', isLoading: false });
        }
      },

      updateTest: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            tests: state.tests.map((test) =>
              test.id === id ? { ...test, ...updates } : test
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update test', isLoading: false });
        }
      },

      deleteTest: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            tests: state.tests.filter((test) => test.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to delete test', isLoading: false });
        }
      },

      selectTest: (id) => {
        if (id === null) {
          set({ selectedTest: null });
          return;
        }
        
        const test = get().tests.find((t) => t.id === id) || null;
        set({ selectedTest: test });
      },

      filterTestsByModality: (modality) => {
        return get().tests.filter((test) => test.modality === modality);
      },

      filterTestsByBodyPart: (bodyPart) => {
        return get().tests.filter((test) => test.bodyPart === bodyPart);
      },

      searchTests: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().tests.filter(
          (test) =>
            test.name.toLowerCase().includes(lowerQuery) ||
            test.description.toLowerCase().includes(lowerQuery) ||
            test.modality.toLowerCase().includes(lowerQuery) ||
            test.bodyPart.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'tests-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);