import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button, Platform } from 'react-native';
import Colors from '@/constants/colors';
import { Plus, AlertCircle, Wrench, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'lucide-react-native';

// Mock data for equipment
const mockEquipment = [
  {
    id: 1,
    name: 'MRI Scanner',
    model: 'Siemens MAGNETOM Aera',
    status: 'Operational',
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-04-15',
    location: 'Room 101',
    condition: 'Good',
    notes: 'No issues.'
  },
  {
    id: 2,
    name: 'CT Scanner',
    model: 'GE Revolution CT',
    status: 'Maintenance Due',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-03-20',
    location: 'Room 102',
    condition: 'Good',
    notes: 'Check cooling system.'
  },
  {
    id: 3,
    name: 'X-Ray Machine',
    model: 'Philips DigitalDiagnost',
    status: 'Operational',
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-04-01',
    location: 'Room 103',
    condition: 'Good',
    notes: 'Replace film soon.'
  },
  {
    id: 4,
    name: 'Old Ultrasound',
    model: 'Toshiba Xario',
    status: 'Out of Service',
    lastMaintenance: '2023-10-01',
    nextMaintenance: 'N/A',
    location: 'Storage',
    condition: 'Needs Repair',
    notes: 'Power issue.'
  },
  {
    id: 5,
    name: 'Portable X-Ray',
    model: 'Siemens Mobilett',
    status: 'Needs Upgrade',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-05-10',
    location: 'ER',
    condition: 'Fair',
    notes: 'Software outdated.'
  }
];

const statusOptions = ['Operational', 'Maintenance Due', 'Out of Service', 'Needs Upgrade'];

export default function EquipmentManagement() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    model: '',
    location: '',
    condition: '',
    purchaseDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    status: 'Operational',
  });
  const [showPurchaseDate, setShowPurchaseDate] = useState(false);
  const [showLastMaintenance, setShowLastMaintenance] = useState(false);
  const [showNextMaintenance, setShowNextMaintenance] = useState(false);

  const filteredEquipment = mockEquipment.filter(equipment => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'maintenance') return equipment.status === 'Maintenance Due';
    if (selectedFilter === 'Operational') return equipment.status === 'Operational';
    if (selectedFilter === 'outofservice') return equipment.status === 'Out of Service';
    if (selectedFilter === 'needsupgrade') return equipment.status === 'Needs Upgrade';
    if (selectedFilter === 'alldevices') return true;
    return true;
  });

  const renderEquipmentCard = (equipment) => (
    <View key={equipment.id} style={styles.equipmentCard}>
      <View style={styles.equipmentHeader}>
        <View>
          <Text style={styles.equipmentName}>{equipment.name}</Text>
          <Text style={styles.equipmentModel}>{equipment.model}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          equipment.status === 'Maintenance Due' && styles.maintenanceBadge,
          equipment.status === 'Out of Service' && styles.outOfServiceBadge,
          equipment.status === 'Needs Upgrade' && styles.needsUpgradeBadge
        ]}>
          <Text style={[
            styles.statusText,
            (equipment.status === 'Maintenance Due' || equipment.status === 'Out of Service' || equipment.status === 'Needs Upgrade') && styles.maintenanceText
          ]}>
            {equipment.status}
          </Text>
        </View>
      </View>

      <View style={styles.equipmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>{equipment.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Maintenance:</Text>
          <Text style={styles.detailValue}>{equipment.lastMaintenance}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Next Maintenance:</Text>
          <Text style={styles.detailValue}>{equipment.nextMaintenance}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Condition:</Text>
          <Text style={styles.detailValue}>{equipment.condition}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.maintenanceButton} onPress={() => { setSelectedEquipment(equipment); setShowMaintenance(true); }}>
          <Wrench size={16} color={Colors.primary} />
          <Text style={styles.maintenanceButtonText}>Schedule Maintenance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton} onPress={() => { setSelectedEquipment(equipment); setShowDetails(true); }}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Details Modal
  const DetailsModal = () => selectedEquipment && (
    <Modal visible={showDetails} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetails(false)}>
            <X size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{selectedEquipment.name} Details</Text>
          <Text>Model: {selectedEquipment.model}</Text>
          <Text>Status: {selectedEquipment.status}</Text>
          <Text>Location: {selectedEquipment.location}</Text>
          <Text>Last Maintenance: {selectedEquipment.lastMaintenance}</Text>
          <Text>Next Maintenance: {selectedEquipment.nextMaintenance}</Text>
          <Text>Condition: {selectedEquipment.condition}</Text>
          <Text>Notes: {selectedEquipment.notes}</Text>
        </View>
      </View>
    </Modal>
  );

  // Maintenance Modal
  const MaintenanceModal = () => selectedEquipment && (
    <Modal visible={showMaintenance} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowMaintenance(false)}>
            <X size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Schedule Maintenance for {selectedEquipment.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="Maintenance Date (YYYY-MM-DD)"
            value={maintenanceDate}
            onChangeText={setMaintenanceDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={maintenanceNotes}
            onChangeText={setMaintenanceNotes}
          />
          <Button title="Save" onPress={() => { setShowMaintenance(false); setMaintenanceDate(''); setMaintenanceNotes(''); }} />
        </View>
      </View>
    </Modal>
  );

  // Add Equipment Modal
  const AddModal = () => (
    <Modal visible={showAdd} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowAdd(false)}>
            <X size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add New Equipment</Text>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={newEquipment.name}
            onChangeText={v => setNewEquipment(e => ({ ...e, name: v }))}
          />
          <Text style={styles.inputLabel}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Model"
            value={newEquipment.model}
            onChangeText={v => setNewEquipment(e => ({ ...e, model: v }))}
          />
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newEquipment.location}
            onChangeText={v => setNewEquipment(e => ({ ...e, location: v }))}
          />
          <Text style={styles.inputLabel}>Condition</Text>
          <TextInput
            style={styles.input}
            placeholder="Condition"
            value={newEquipment.condition}
            onChangeText={v => setNewEquipment(e => ({ ...e, condition: v }))}
          />
          <Text style={styles.inputLabel}>Purchase Date</Text>
          <TouchableOpacity style={styles.dateInputRow} onPress={() => setShowPurchaseDate(true)}>
            <Calendar size={18} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: newEquipment.purchaseDate ? Colors.text : Colors.subtext }}>
              {newEquipment.purchaseDate || 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showPurchaseDate && (
            <DateTimePicker
              value={newEquipment.purchaseDate ? new Date(newEquipment.purchaseDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowPurchaseDate(false);
                if (date) setNewEquipment(e => ({ ...e, purchaseDate: date.toISOString().split('T')[0] }));
              }}
            />
          )}
          <Text style={styles.inputLabel}>Last Maintenance</Text>
          <TouchableOpacity style={styles.dateInputRow} onPress={() => setShowLastMaintenance(true)}>
            <Calendar size={18} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: newEquipment.lastMaintenance ? Colors.text : Colors.subtext }}>
              {newEquipment.lastMaintenance || 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showLastMaintenance && (
            <DateTimePicker
              value={newEquipment.lastMaintenance ? new Date(newEquipment.lastMaintenance) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowLastMaintenance(false);
                if (date) setNewEquipment(e => ({ ...e, lastMaintenance: date.toISOString().split('T')[0] }));
              }}
            />
          )}
          <Text style={styles.inputLabel}>Next Maintenance</Text>
          <TouchableOpacity style={styles.dateInputRow} onPress={() => setShowNextMaintenance(true)}>
            <Calendar size={18} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: newEquipment.nextMaintenance ? Colors.text : Colors.subtext }}>
              {newEquipment.nextMaintenance || 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showNextMaintenance && (
            <DateTimePicker
              value={newEquipment.nextMaintenance ? new Date(newEquipment.nextMaintenance) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowNextMaintenance(false);
                if (date) setNewEquipment(e => ({ ...e, nextMaintenance: date.toISOString().split('T')[0] }));
              }}
            />
          )}
          <Text style={styles.inputLabel}>Status</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={newEquipment.status}
              onValueChange={v => setNewEquipment(e => ({ ...e, status: v }))}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {statusOptions.map(opt => (
                <Picker.Item key={opt} label={opt} value={opt} />
              ))}
            </Picker>
          </View>
          <Button title="Add" onPress={() => { setShowAdd(false); setNewEquipment({ name: '', model: '', location: '', condition: '', purchaseDate: '', lastMaintenance: '', nextMaintenance: '', status: 'Operational' }); }} />
        </View>
      </View>
    </Modal>
  );

  // Section content for special tabs
  const renderSpecialTab = () => {
    if (selectedFilter === 'outofservice') {
      const outOfService = mockEquipment.filter(e => e.status === 'Out of Service');
      return (
        <View style={styles.specialTabSection}>
          <Text style={styles.specialTabTitle}>Out of Service Devices</Text>
          {outOfService.length === 0 ? <Text>No devices out of service.</Text> : outOfService.map(renderEquipmentCard)}
        </View>
      );
    }
    if (selectedFilter === 'needsupgrade') {
      const needsUpgrade = mockEquipment.filter(e => e.status === 'Needs Upgrade');
      return (
        <View style={styles.specialTabSection}>
          <Text style={styles.specialTabTitle}>Devices Needing Upgrade</Text>
          {needsUpgrade.length === 0 ? <Text>No devices need upgrade.</Text> : needsUpgrade.map(renderEquipmentCard)}
        </View>
      );
    }
    if (selectedFilter === 'alldevices') {
      return (
        <View style={styles.specialTabSection}>
          <Text style={styles.specialTabTitle}>All Devices Summary</Text>
          <Text>Total Devices: {mockEquipment.length}</Text>
          <Text>Operational: {mockEquipment.filter(e => e.status === 'Operational').length}</Text>
          <Text>Maintenance Due: {mockEquipment.filter(e => e.status === 'Maintenance Due').length}</Text>
          <Text>Out of Service: {mockEquipment.filter(e => e.status === 'Out of Service').length}</Text>
          <Text>Needs Upgrade: {mockEquipment.filter(e => e.status === 'Needs Upgrade').length}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarContainer}
          style={{ marginBottom: 8 }}
        >
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
                All Equipment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'maintenance' && styles.activeFilter]}
              onPress={() => setSelectedFilter('maintenance')}
            >
              <Text style={[styles.filterText, selectedFilter === 'maintenance' && styles.activeFilterText]}>
                Maintenance Due
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'Operational' && styles.activeFilter]}
              onPress={() => setSelectedFilter('Operational')}
            >
              <Text style={[styles.filterText, selectedFilter === 'Operational' && styles.activeFilterText]}>
                Operational
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'outofservice' && styles.activeFilter]}
              onPress={() => setSelectedFilter('outofservice')}
            >
              <Text style={[styles.filterText, selectedFilter === 'outofservice' && styles.activeFilterText]}>
                Out of Service
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'needsupgrade' && styles.activeFilter]}
              onPress={() => setSelectedFilter('needsupgrade')}
            >
              <Text style={[styles.filterText, selectedFilter === 'needsupgrade' && styles.activeFilterText]}>
                Needs Upgrade
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'alldevices' && styles.activeFilter]}
              onPress={() => setSelectedFilter('alldevices')}
            >
              <Text style={[styles.filterText, selectedFilter === 'alldevices' && styles.activeFilterText]}>
                All Devices
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {['outofservice', 'needsupgrade', 'alldevices'].includes(selectedFilter)
          ? renderSpecialTab()
          : <View style={styles.equipmentList}>{filteredEquipment.map(renderEquipmentCard)}</View>}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
        <Plus size={28} color="white" />
      </TouchableOpacity>
      {DetailsModal()}
      {MaintenanceModal()}
      {AddModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBarContainer: {
    paddingHorizontal: 8,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    minWidth: '100%',
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginHorizontal: 2,
    minWidth: 110,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.text,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  equipmentList: {
    padding: 16,
  },
  equipmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  equipmentModel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.success,
  },
  maintenanceBadge: {
    backgroundColor: Colors.warning,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  maintenanceText: {
    color: 'white',
  },
  equipmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  maintenanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E6F0FF',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  maintenanceButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  detailsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: Colors.primary,
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  outOfServiceBadge: {
    backgroundColor: Colors.error,
  },
  needsUpgradeBadge: {
    backgroundColor: Colors.warning,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.primary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  specialTabSection: {
    padding: 16,
  },
  specialTabTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  inputLabel: {
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
    marginTop: 8,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 40,
  },
  pickerItem: {
    fontSize: 16,
  },
}); 