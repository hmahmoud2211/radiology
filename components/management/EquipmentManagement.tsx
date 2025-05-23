import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { Plus, AlertCircle, Wrench } from 'lucide-react-native';

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
    condition: 'Good'
  },
  {
    id: 2,
    name: 'CT Scanner',
    model: 'GE Revolution CT',
    status: 'Maintenance Due',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-03-20',
    location: 'Room 102',
    condition: 'Good'
  },
  {
    id: 3,
    name: 'X-Ray Machine',
    model: 'Philips DigitalDiagnost',
    status: 'Operational',
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-04-01',
    location: 'Room 103',
    condition: 'Good'
  }
];

export default function EquipmentManagement() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredEquipment = mockEquipment.filter(equipment => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'maintenance') return equipment.status === 'Maintenance Due';
    return equipment.status === selectedFilter;
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
          equipment.status === 'Maintenance Due' && styles.maintenanceBadge
        ]}>
          <Text style={[
            styles.statusText,
            equipment.status === 'Maintenance Due' && styles.maintenanceText
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
        <TouchableOpacity style={styles.actionButton}>
          <Wrench size={16} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Schedule Maintenance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.viewDetailsButton]}>
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
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
      </View>

      <View style={styles.equipmentList}>
        {filteredEquipment.map(renderEquipmentCard)}
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Plus size={24} color="white" />
        <Text style={styles.addButtonText}>Add New Equipment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
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
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    gap: 8,
  },
  actionButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  viewDetailsButton: {
    backgroundColor: Colors.primary,
  },
  viewDetailsText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 