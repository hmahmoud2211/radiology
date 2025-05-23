import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Colors from '@/constants/colors';
import { FileText, Download, Filter, AlertCircle } from 'lucide-react-native';

// Mock Data
const mockData = {
  imagingRevenue: {
    daily: [
      { date: '2024-03-01', mri: 2500, ct: 1800, xray: 800 },
      { date: '2024-03-02', mri: 2800, ct: 2000, xray: 900 },
      // Add more daily data
    ],
    monthly: [
      { month: 'Jan', mri: 75000, ct: 54000, xray: 24000 },
      { month: 'Feb', mri: 82000, ct: 58000, xray: 26000 },
      // Add more monthly data
    ]
  },
  equipment: [
    {
      id: 1,
      name: 'MRI Scanner',
      purchasePrice: 1500000,
      maintenanceCost: 50000,
      nextService: '2024-04-15',
      status: 'Operational'
    },
    {
      id: 2,
      name: 'CT Scanner',
      purchasePrice: 800000,
      maintenanceCost: 30000,
      nextService: '2024-03-30',
      status: 'Maintenance Due'
    },
    // Add more equipment
  ],
  consumables: [
    {
      id: 1,
      name: 'Contrast Agent',
      unitPrice: 150,
      quantity: 50,
      reorderThreshold: 20,
      lastOrdered: '2024-02-15'
    },
    {
      id: 2,
      name: 'X-ray Film',
      unitPrice: 2.5,
      quantity: 1000,
      reorderThreshold: 200,
      lastOrdered: '2024-03-01'
    },
    // Add more consumables
  ]
};

export default function FinancialManagement() {
  const [dateRange, setDateRange] = useState('monthly');
  const [selectedSection, setSelectedSection] = useState('revenue');

  // Calculate totals
  const totals = useMemo(() => {
    const revenue = mockData.imagingRevenue.monthly.reduce((acc, curr) => 
      acc + curr.mri + curr.ct + curr.xray, 0
    );
    
    const equipmentCosts = mockData.equipment.reduce((acc, curr) => 
      acc + curr.maintenanceCost, 0
    );
    
    const consumablesCosts = mockData.consumables.reduce((acc, curr) => 
      acc + (curr.unitPrice * curr.quantity), 0
    );

    return {
      revenue,
      equipmentCosts,
      consumablesCosts,
      netBalance: revenue - equipmentCosts - consumablesCosts
    };
  }, []);

  const renderRevenueSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medical Imaging Revenue</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color={Colors.primary} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: ['MRI', 'CT', 'X-ray'],
            datasets: [{
              data: [
                mockData.imagingRevenue.monthly[0].mri,
                mockData.imagingRevenue.monthly[0].ct,
                mockData.imagingRevenue.monthly[0].xray
              ]
            }]
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: Colors.card,
            backgroundGradientFrom: Colors.card,
            backgroundGradientTo: Colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Revenue Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Revenue:</Text>
          <Text style={styles.summaryValue}>${totals.revenue.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  const renderEquipmentSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Equipment Costs & Maintenance</Text>
      {mockData.equipment.map(equipment => (
        <View key={equipment.id} style={styles.equipmentCard}>
          <View style={styles.equipmentHeader}>
            <Text style={styles.equipmentName}>{equipment.name}</Text>
            <Text style={[
              styles.equipmentStatus,
              equipment.status === 'Maintenance Due' && styles.warningText
            ]}>
              {equipment.status}
            </Text>
          </View>
          <View style={styles.equipmentDetails}>
            <Text style={styles.equipmentDetail}>
              Purchase Price: ${equipment.purchasePrice.toLocaleString()}
            </Text>
            <Text style={styles.equipmentDetail}>
              Maintenance Cost: ${equipment.maintenanceCost.toLocaleString()}
            </Text>
            <Text style={styles.equipmentDetail}>
              Next Service: {equipment.nextService}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderConsumablesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Consumables & Restocking</Text>
      {mockData.consumables.map(item => (
        <View key={item.id} style={styles.consumableCard}>
          <View style={styles.consumableHeader}>
            <Text style={styles.consumableName}>{item.name}</Text>
            {item.quantity <= item.reorderThreshold && (
              <View style={styles.alertBadge}>
                <AlertCircle size={16} color="white" />
                <Text style={styles.alertText}>Low Stock</Text>
              </View>
            )}
          </View>
          <View style={styles.consumableDetails}>
            <Text style={styles.consumableDetail}>
              Unit Price: ${item.unitPrice}
            </Text>
            <Text style={styles.consumableDetail}>
              Quantity: {item.quantity}
            </Text>
            <Text style={styles.consumableDetail}>
              Reorder at: {item.reorderThreshold}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSummarySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Financial Summary</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Revenue:</Text>
          <Text style={styles.summaryValue}>${totals.revenue.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Equipment Costs:</Text>
          <Text style={styles.summaryValue}>${totals.equipmentCosts.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Consumables Costs:</Text>
          <Text style={styles.summaryValue}>${totals.consumablesCosts.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryRow, styles.netBalanceRow]}>
          <Text style={styles.netBalanceLabel}>Net Balance:</Text>
          <Text style={[
            styles.netBalanceValue,
            totals.netBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
          ]}>
            ${totals.netBalance.toLocaleString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.exportButton}>
        <Download size={16} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.exportButtonText}>Export Summary</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedSection === 'revenue' && styles.activeTab]}
          onPress={() => setSelectedSection('revenue')}
        >
          <Text style={[styles.tabText, selectedSection === 'revenue' && styles.activeTabText]}>
            Revenue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedSection === 'equipment' && styles.activeTab]}
          onPress={() => setSelectedSection('equipment')}
        >
          <Text style={[styles.tabText, selectedSection === 'equipment' && styles.activeTabText]}>
            Equipment
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedSection === 'consumables' && styles.activeTab]}
          onPress={() => setSelectedSection('consumables')}
        >
          <Text style={[styles.tabText, selectedSection === 'consumables' && styles.activeTabText]}>
            Consumables
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedSection === 'summary' && styles.activeTab]}
          onPress={() => setSelectedSection('summary')}
        >
          <Text style={[styles.tabText, selectedSection === 'summary' && styles.activeTabText]}>
            Summary
          </Text>
        </TouchableOpacity>
      </View>

      {selectedSection === 'revenue' && renderRevenueSection()}
      {selectedSection === 'equipment' && renderEquipmentSection()}
      {selectedSection === 'consumables' && renderConsumablesSection()}
      {selectedSection === 'summary' && renderSummarySection()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 8,
    borderRadius: 8,
    margin: 16,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
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
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
  filterText: {
    marginLeft: 4,
    color: Colors.primary,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: Colors.text,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  equipmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  equipmentStatus: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  warningText: {
    color: Colors.warning,
  },
  equipmentDetails: {
    gap: 4,
  },
  equipmentDetail: {
    color: Colors.text,
    fontSize: 14,
  },
  consumableCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  consumableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consumableName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  consumableDetails: {
    gap: 4,
  },
  consumableDetail: {
    color: Colors.text,
    fontSize: 14,
  },
  netBalanceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  netBalanceLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  netBalanceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  positiveBalance: {
    color: Colors.success,
  },
  negativeBalance: {
    color: Colors.error,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
}); 