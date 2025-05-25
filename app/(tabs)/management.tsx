import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/colors';
import { Search, Filter } from 'lucide-react-native';
import EquipmentManagement from '../../components/management/EquipmentManagement';
import FinancialManagement from '../../components/management/FinancialManagement';

export default function ManagementScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('equipment');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'equipment':
        return <EquipmentManagement />;
      case 'financial':
        return <FinancialManagement />;
      default:
        return <EquipmentManagement />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'equipment' && styles.activeTab]}
            onPress={() => setActiveTab('equipment')}
          >
            <Text style={[styles.tabText, activeTab === 'equipment' && styles.activeTabText]}>Equipment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'financial' && styles.activeTab]}
            onPress={() => setActiveTab('financial')}
          >
            <Text style={[styles.tabText, activeTab === 'financial' && styles.activeTabText]}>Financial</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton} onPress={() => Alert.alert('Search', 'Search functionality coming soon!')}>
            <Search size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => Alert.alert('Filter', 'Filter functionality coming soon!')}>
            <Filter size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.title}>Managements</Text>
      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 6,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.text,
    fontWeight: '500',
    fontSize: 15,
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 16,
    marginBottom: 4,
  },
}); 