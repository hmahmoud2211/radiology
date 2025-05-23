import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChecklistItem, ChecklistItemStatus, PatientChecklist } from '@/types';

interface ChecklistState {
  checklists: Record<string, PatientChecklist>;
  currentChecklist: PatientChecklist | null;
  isLoading: boolean;
  error: string | null;
  startChecklist: (patientId: string, studyId: string, userId: string) => void;
  updateChecklistItem: (checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  completeChecklist: (checklistId: string, userId: string) => void;
  getPatientChecklist: (patientId: string, studyId: string) => PatientChecklist | null;
  validateChecklist: (checklist: PatientChecklist) => { isValid: boolean; errors: string[] };
}

const defaultChecklistItems: ChecklistItem[] = [
  {
    id: '1',
    type: 'consent',
    title: 'Signed Informed Consent',
    description: 'Verify that the patient has signed the informed consent form',
    status: 'pending',
    isRequired: true,
  },
  {
    id: '2',
    type: 'renal_function',
    title: 'Renal Function Status',
    description: 'Check if renal function is within acceptable range for contrast administration',
    status: 'pending',
    isRequired: true,
    threshold: 60,
    unit: 'mL/min',
  },
  {
    id: '3',
    type: 'metal_screening',
    title: 'Metal Implants Screening',
    description: 'Screen for any metal implants or devices that may be contraindicated',
    status: 'pending',
    isRequired: true,
  },
  {
    id: '4',
    type: 'npo_status',
    title: 'NPO Status',
    description: 'Verify patient has been fasting for the required duration',
    status: 'pending',
    isRequired: true,
  },
  {
    id: '5',
    type: 'pregnancy_status',
    title: 'Pregnancy Status',
    description: 'Confirm pregnancy status for female patients of childbearing age',
    status: 'pending',
    isRequired: true,
  },
  {
    id: '6',
    type: 'pre_medication',
    title: 'Pre-Medication Requirements',
    description: 'Check if any pre-medication is required and has been administered',
    status: 'pending',
    isRequired: true,
  },
];

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      checklists: {},
      currentChecklist: null,
      isLoading: false,
      error: null,

      startChecklist: (patientId, studyId, userId) => {
        const newChecklist: PatientChecklist = {
          id: Date.now().toString(),
          patientId,
          studyId,
          items: defaultChecklistItems,
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          startedBy: userId,
        };

        set((state) => ({
          checklists: { ...state.checklists, [newChecklist.id]: newChecklist },
          currentChecklist: newChecklist,
        }));
      },

      updateChecklistItem: (checklistId, itemId, updates) => {
        set((state) => {
          const checklist = state.checklists[checklistId];
          if (!checklist) return state;

          const updatedItems = checklist.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          );

          const updatedChecklist: PatientChecklist = {
            ...checklist,
            items: updatedItems,
          };

          return {
            checklists: { ...state.checklists, [checklistId]: updatedChecklist },
            currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist,
          };
        });
      },

      completeChecklist: (checklistId, userId) => {
        set((state) => {
          const checklist = state.checklists[checklistId];
          if (!checklist) return state;

          const updatedChecklist: PatientChecklist = {
            ...checklist,
            status: 'completed',
            completedAt: new Date().toISOString(),
            completedBy: userId,
          };

          return {
            checklists: { ...state.checklists, [checklistId]: updatedChecklist },
            currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist,
          };
        });
      },

      getPatientChecklist: (patientId, studyId) => {
        const checklists = get().checklists;
        return Object.values(checklists).find(
          (checklist) => checklist.patientId === patientId && checklist.studyId === studyId
        ) || null;
      },

      validateChecklist: (checklist) => {
        const errors: string[] = [];
        let isValid = true;

        checklist.items.forEach((item) => {
          if (item.isRequired && item.status !== 'completed') {
            errors.push(`${item.title} is required but not completed`);
            isValid = false;
          }

          if (item.status === 'completed' && item.threshold !== undefined && item.value !== undefined) {
            const value = Number(item.value);
            if (isNaN(value) || value < item.threshold) {
              errors.push(`${item.title} value (${value} ${item.unit}) is below threshold (${item.threshold} ${item.unit})`);
              isValid = false;
            }
          }
        });

        return { isValid, errors };
      },
    }),
    {
      name: 'checklist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 