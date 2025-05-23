import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEquipmentStore } from '@/store/equipmentStore';
import { useTheme } from '@/theme';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ReportExporterProps {
  type: 'equipment' | 'consumables' | 'maintenance' | 'alerts';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const ReportExporter: React.FC<ReportExporterProps> = ({
  type,
  dateRange,
}) => {
  const theme = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const {
    equipment,
    consumables,
    maintenanceRecords,
    alerts,
  } = useEquipmentStore();

  const generateReport = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);

      let data: any[] = [];
      let fileName = '';

      switch (type) {
        case 'equipment':
          data = Object.values(equipment);
          fileName = 'equipment_report';
          break;
        case 'consumables':
          data = Object.values(consumables);
          fileName = 'consumables_report';
          break;
        case 'maintenance':
          data = Object.values(maintenanceRecords);
          fileName = 'maintenance_report';
          break;
        case 'alerts':
          data = Object.values(alerts);
          fileName = 'alerts_report';
          break;
      }

      // Filter by date range if provided
      if (dateRange) {
        data = data.filter((item) => {
          const itemDate = new Date(item.createdAt || item.date);
          return itemDate >= dateRange.start && itemDate <= dateRange.end;
        });
      }

      // Generate file content based on format
      let fileContent = '';
      let fileExtension = '';

      if (format === 'pdf') {
        fileExtension = 'pdf';
        // Here you would use a PDF generation library
        // For now, we'll create a simple text representation
        fileContent = data.map((item) => JSON.stringify(item, null, 2)).join('\n\n');
      } else {
        fileExtension = 'csv';
        // Create CSV header
        const headers = Object.keys(data[0] || {}).join(',');
        fileContent = headers + '\n';
        // Add data rows
        data.forEach((item) => {
          fileContent += Object.values(item).join(',') + '\n';
        });
      }

      // Save file
      const fileUri = `${FileSystem.documentDirectory}${fileName}.${fileExtension}`;
      await FileSystem.writeAsStringAsync(fileUri, fileContent);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Report</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.pdfButton]}
          onPress={() => generateReport('pdf')}
          disabled={isExporting}
        >
          <MaterialIcons name="picture-as-pdf" size={24} color="#fff" />
          <Text style={styles.buttonText}>Export as PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.excelButton]}
          onPress={() => generateReport('excel')}
          disabled={isExporting}
        >
          <MaterialIcons name="table-chart" size={24} color="#fff" />
          <Text style={styles.buttonText}>Export as Excel</Text>
        </TouchableOpacity>
      </View>

      {isExporting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Generating report...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  pdfButton: {
    backgroundColor: '#FF3B30',
  },
  excelButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
}); 