export type EquipmentType = 'machine' | 'tool' | 'device';
export type EquipmentStatus = 'active' | 'maintenance' | 'inactive';
export type ConsumableType = 'contrast' | 'catheter' | 'syringe' | 'glove' | 'other';
export type AlertType = 'low_stock' | 'expiring' | 'maintenance_due';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  serialNumber: string;
  location: string;
  status: EquipmentStatus;
  purchaseDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  manufacturer: string;
  model: string;
  notes?: string;
}

export interface Consumable {
  id: string;
  name: string;
  type: ConsumableType;
  quantity: number;
  minimumQuantity: number;
  location: string;
  purchaseDate: string;
  expirationDate: string;
  supplier: string;
  lotNumber: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  date: string;
  technician: string;
  description: string;
  cost: number;
  nextMaintenanceDate: string;
  status: 'completed' | 'scheduled' | 'cancelled';
}

export interface RestockRequest {
  id: string;
  consumableId: string;
  requestedQuantity: number;
  requestedBy: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  status: AlertStatus;
  message: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  relatedId: string; // ID of the related equipment or consumable
  priority: 'low' | 'medium' | 'high';
} 