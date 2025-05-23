import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Plus, Search, Filter, FileText, Download, AlertCircle } from 'lucide-react-native';
import EquipmentManagement from '@/components/management/EquipmentManagement';
import FinancialManagement from '@/components/management/FinancialManagement';

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
      <View style={styles.header}>
        <Text style={styles.title}>Managements</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContainer}
      >
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'equipment' && styles.activeTab]}
            onPress={() => setActiveTab('equipment')}
          >
            <Text style={[styles.tabText, activeTab === 'equipment' && styles.activeTabText]}>
              Equipment
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'financial' && styles.activeTab]}
            onPress={() => setActiveTab('financial')}
          >
            <Text style={[styles.tabText, activeTab === 'financial' && styles.activeTabText]}>
              Financial
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
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
  tabBarContainer: {
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 8,
    borderRadius: 8,
    elevation: 2,
    minWidth: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    minWidth: 120,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.text,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
}); 