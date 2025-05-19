import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Equipment,
  Consumable,
  MaintenanceRecord,
  RestockRequest,
  Alert,
  AlertType,
  AlertStatus,
} from '@/types/equipment';

interface EquipmentState {
  equipment: Record<string, Equipment>;
  consumables: Record<string, Consumable>;
  maintenanceRecords: Record<string, MaintenanceRecord>;
  restockRequests: Record<string, RestockRequest>;
  alerts: Record<string, Alert>;
  isLoading: boolean;
  error: string | null;

  // Equipment actions
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  // Consumable actions
  addConsumable: (consumable: Consumable) => void;
  updateConsumable: (id: string, updates: Partial<Consumable>) => void;
  deleteConsumable: (id: string) => void;

  // Maintenance actions
  addMaintenanceRecord: (record: MaintenanceRecord) => void;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;

  // Restock actions
  createRestockRequest: (request: RestockRequest) => void;
  updateRestockRequest: (id: string, updates: Partial<RestockRequest>) => void;

  // Alert actions
  addAlert: (alert: Alert) => void;
  updateAlertStatus: (id: string, status: AlertStatus, resolvedBy?: string) => void;
  deleteAlert: (id: string) => void;

  // Utility functions
  checkLowStock: () => void;
  checkExpiringItems: () => void;
  checkMaintenanceDue: () => void;
  getEquipmentById: (id: string) => Equipment | null;
  getConsumableById: (id: string) => Consumable | null;
  getActiveAlerts: () => Alert[];
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      equipment: {},
      consumables: {},
      maintenanceRecords: {},
      restockRequests: {},
      alerts: {},
      isLoading: false,
      error: null,

      addEquipment: (equipment) => {
        set((state) => ({
          equipment: { ...state.equipment, [equipment.id]: equipment },
        }));
      },

      updateEquipment: (id, updates) => {
        set((state) => ({
          equipment: {
            ...state.equipment,
            [id]: { ...state.equipment[id], ...updates },
          },
        }));
      },

      deleteEquipment: (id) => {
        set((state) => {
          const { [id]: _, ...remainingEquipment } = state.equipment;
          return { equipment: remainingEquipment };
        });
      },

      addConsumable: (consumable) => {
        set((state) => ({
          consumables: { ...state.consumables, [consumable.id]: consumable },
        }));
      },

      updateConsumable: (id, updates) => {
        set((state) => ({
          consumables: {
            ...state.consumables,
            [id]: { ...state.consumables[id], ...updates },
          },
        }));
      },

      deleteConsumable: (id) => {
        set((state) => {
          const { [id]: _, ...remainingConsumables } = state.consumables;
          return { consumables: remainingConsumables };
        });
      },

      addMaintenanceRecord: (record) => {
        set((state) => ({
          maintenanceRecords: {
            ...state.maintenanceRecords,
            [record.id]: record,
          },
        }));
      },

      updateMaintenanceRecord: (id, updates) => {
        set((state) => ({
          maintenanceRecords: {
            ...state.maintenanceRecords,
            [id]: { ...state.maintenanceRecords[id], ...updates },
          },
        }));
      },

      createRestockRequest: (request) => {
        set((state) => ({
          restockRequests: {
            ...state.restockRequests,
            [request.id]: request,
          },
        }));
      },

      updateRestockRequest: (id, updates) => {
        set((state) => ({
          restockRequests: {
            ...state.restockRequests,
            [id]: { ...state.restockRequests[id], ...updates },
          },
        }));
      },

      addAlert: (alert) => {
        set((state) => ({
          alerts: { ...state.alerts, [alert.id]: alert },
        }));
      },

      updateAlertStatus: (id, status, resolvedBy) => {
        set((state) => ({
          alerts: {
            ...state.alerts,
            [id]: {
              ...state.alerts[id],
              status,
              resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
              resolvedBy: status === 'resolved' ? resolvedBy : undefined,
            },
          },
        }));
      },

      deleteAlert: (id) => {
        set((state) => {
          const { [id]: _, ...remainingAlerts } = state.alerts;
          return { alerts: remainingAlerts };
        });
      },

      checkLowStock: () => {
        const state = get();
        Object.values(state.consumables).forEach((consumable) => {
          if (consumable.quantity <= consumable.minimumQuantity) {
            const alert: Alert = {
              id: Date.now().toString(),
              type: 'low_stock',
              status: 'active',
              message: `Low stock alert: ${consumable.name} quantity is below minimum threshold`,
              createdAt: new Date().toISOString(),
              relatedId: consumable.id,
              priority: 'high',
            };
            state.addAlert(alert);
          }
        });
      },

      checkExpiringItems: () => {
        const state = get();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        Object.values(state.consumables).forEach((consumable) => {
          const expirationDate = new Date(consumable.expirationDate);
          if (expirationDate <= thirtyDaysFromNow) {
            const alert: Alert = {
              id: Date.now().toString(),
              type: 'expiring',
              status: 'active',
              message: `Expiration alert: ${consumable.name} will expire on ${consumable.expirationDate}`,
              createdAt: new Date().toISOString(),
              relatedId: consumable.id,
              priority: expirationDate <= new Date() ? 'high' : 'medium',
            };
            state.addAlert(alert);
          }
        });
      },

      checkMaintenanceDue: () => {
        const state = get();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        Object.values(state.equipment).forEach((equipment) => {
          const nextMaintenanceDate = new Date(equipment.nextMaintenanceDate);
          if (nextMaintenanceDate <= sevenDaysFromNow) {
            const alert: Alert = {
              id: Date.now().toString(),
              type: 'maintenance_due',
              status: 'active',
              message: `Maintenance due: ${equipment.name} requires maintenance by ${equipment.nextMaintenanceDate}`,
              createdAt: new Date().toISOString(),
              relatedId: equipment.id,
              priority: nextMaintenanceDate <= new Date() ? 'high' : 'medium',
            };
            state.addAlert(alert);
          }
        });
      },

      getEquipmentById: (id) => {
        return get().equipment[id] || null;
      },

      getConsumableById: (id) => {
        return get().consumables[id] || null;
      },

      getActiveAlerts: () => {
        return Object.values(get().alerts).filter(
          (alert) => alert.status === 'active'
        );
      },
    }),
    {
      name: 'equipment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 