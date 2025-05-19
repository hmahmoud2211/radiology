import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useEquipmentStore } from '@/store/equipmentStore';
import { Equipment, Consumable, Alert as AlertType } from '@/types/equipment';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { EquipmentForm } from '@/components/EquipmentForm';
import { ConsumableForm } from '@/components/ConsumableForm';
import { MaintenanceForm } from '@/components/MaintenanceForm';
import { AlertList } from '@/components/AlertList';
import { Alert as RNAlert } from 'react-native';

type TabType = 'equipment' | 'consumables' | 'maintenance' | 'alerts';

export const EquipmentManagementScreen = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('equipment');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [editingConsumable, setEditingConsumable] = useState<Consumable | null>(null);
  const {
    equipment,
    consumables,
    maintenanceRecords,
    alerts,
    checkLowStock,
    checkExpiringItems,
    checkMaintenanceDue,
    getActiveAlerts,
    deleteEquipment,
    deleteConsumable,
  } = useEquipmentStore();

  useEffect(() => {
    // Run checks periodically
    const interval = setInterval(() => {
      checkLowStock();
      checkExpiringItems();
      checkMaintenanceDue();
    }, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(interval);
  }, []);

  const handleAddPress = () => {
    setShowAddModal(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setShowAddModal(true);
  };

  const handleDeleteEquipment = (id: string) => {
    RNAlert.alert(
      'Delete Equipment',
      'Are you sure you want to delete this equipment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEquipment(id) },
      ]
    );
  };

  const handleEditConsumable = (item: Consumable) => {
    setEditingConsumable(item);
    setShowAddModal(true);
  };

  const handleDeleteConsumable = (id: string) => {
    RNAlert.alert(
      'Delete Consumable',
      'Are you sure you want to delete this consumable?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteConsumable(id) },
      ]
    );
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingEquipment(null);
    setEditingConsumable(null);
  };

  const renderEquipmentList = () => (
    <ScrollView style={styles.listContainer}>
      {Object.values(equipment).length === 0 ? (
        <View style={styles.emptyState}><Text style={styles.emptyStateText}>No equipment found. Tap + to add new equipment.</Text></View>
      ) : (
        Object.values(equipment).map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleEditEquipment(item)} style={{ marginRight: 8 }}>
                  <MaterialIcons name="edit" size={20} color={theme.colors.info} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteEquipment(item.id)}>
                  <MaterialIcons name="delete" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}> 
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.itemSubtitle}>{item.type}</Text>
            <Text style={styles.itemDetail}>Location: {item.location}</Text>
            <Text style={styles.itemDetail}>Next Maintenance: {item.nextMaintenanceDate}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  const isConsumableExpiringSoon = (item: Consumable) => {
    const expirationDate = new Date(item.expirationDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow && expirationDate >= now;
  };

  const isConsumableLowStock = (item: Consumable) => {
    return item.quantity <= item.minimumQuantity;
  };

  const renderConsumablesList = () => (
    <ScrollView style={styles.listContainer}>
      {Object.values(consumables).length === 0 ? (
        <View style={styles.emptyState}><Text style={styles.emptyStateText}>No consumables found. Tap + to add new consumable.</Text></View>
      ) : (
        Object.values(consumables).map((item) => {
          const expiringSoon = isConsumableExpiringSoon(item);
          const lowStock = isConsumableLowStock(item);
          return (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                (expiringSoon || lowStock) && { borderColor: lowStock ? theme.colors.error : theme.colors.warning, borderWidth: 2 },
              ]}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => handleEditConsumable(item)} style={{ marginRight: 8 }}>
                    <MaterialIcons name="edit" size={20} color={theme.colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteConsumable(item.id)}>
                    <MaterialIcons name="delete" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.quantityBadge, { backgroundColor: getQuantityColor(item.quantity, item.minimumQuantity) }]}> 
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.itemSubtitle}>{item.type}</Text>
              <Text style={styles.itemDetail}>Location: {item.location}</Text>
              <Text style={styles.itemDetail}>Expires: {item.expirationDate}</Text>
              {(expiringSoon || lowStock) && (
                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  {lowStock && (
                    <Text style={{ backgroundColor: theme.colors.error, color: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, fontWeight: 'bold', marginRight: 8 }}>Low Stock</Text>
                  )}
                  {expiringSoon && (
                    <Text style={{ backgroundColor: theme.colors.warning, color: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, fontWeight: 'bold' }}>Expiring Soon</Text>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );

  const renderMaintenanceList = () => (
    <ScrollView style={styles.listContainer}>
      {Object.values(maintenanceRecords).length === 0 ? (
        <View style={styles.emptyState}><Text style={styles.emptyStateText}>No maintenance records found. Tap + to add a new record.</Text></View>
      ) : (
        Object.values(maintenanceRecords).map((record) => {
          const eq = equipment[record.equipmentId];
          return (
            <TouchableOpacity
              key={record.id}
              style={styles.itemCard}
              onPress={() => {/* Optionally show details or edit */}}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{eq ? eq.name : 'Unknown Equipment'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}> 
                  <Text style={styles.statusText}>{record.status}</Text>
                </View>
              </View>
              <Text style={styles.itemSubtitle}>Technician: {record.technician}</Text>
              <Text style={styles.itemDetail}>Date: {record.date}</Text>
              <Text style={styles.itemDetail}>Next: {record.nextMaintenanceDate}</Text>
              <Text style={styles.itemDetail}>Description: {record.description}</Text>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'maintenance':
        return theme.colors.warning;
      case 'inactive':
        return theme.colors.error;
      default:
        return theme.colors.gray;
    }
  };

  const getQuantityColor = (quantity: number, minimum: number) => {
    if (quantity <= minimum) return theme.colors.error;
    if (quantity <= minimum * 1.5) return theme.colors.warning;
    return theme.colors.success;
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.info;
      default:
        return theme.colors.gray;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'warning';
      case 'expiring':
        return 'event';
      case 'maintenance_due':
        return 'build';
      default:
        return 'info';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Equipment Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (activeTab === 'maintenance') {
              // Optionally, you can let user pick equipment first
              setSelectedEquipmentId(Object.keys(equipment)[0] || null);
            }
            setShowAddModal(true);
          }}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {(['equipment', 'consumables', 'maintenance', 'alerts'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'equipment' && renderEquipmentList()}
      {activeTab === 'consumables' && renderConsumablesList()}
      {activeTab === 'alerts' && <AlertList />}
      {activeTab === 'maintenance' && renderMaintenanceList()}

      {/* Add Modal for Equipment/Consumable/Maintenance */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, minWidth: 320, maxWidth: '90%' }}>
            {activeTab === 'equipment' && (
              <EquipmentForm equipment={editingEquipment || undefined} onSave={handleModalClose} onCancel={handleModalClose} />
            )}
            {activeTab === 'consumables' && (
              <ConsumableForm consumable={editingConsumable || undefined} onSave={handleModalClose} onCancel={handleModalClose} />
            )}
            {activeTab === 'maintenance' && selectedEquipmentId && (
              <MaintenanceForm equipmentId={selectedEquipmentId} onSave={handleModalClose} onCancel={handleModalClose} />
            )}
            {activeTab !== 'equipment' && activeTab !== 'consumables' && activeTab !== 'maintenance' && (
              <TouchableOpacity onPress={handleModalClose} style={{ alignSelf: 'flex-end', marginTop: 12 }}>
                <Text style={{ color: theme.colors.primary }}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  alertDate: {
    fontSize: 12,
    color: '#666',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 