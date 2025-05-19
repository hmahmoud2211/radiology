import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useEquipmentStore } from '@/store/equipmentStore';
import { MaintenanceRecord } from '@/types/equipment';
import { useTheme } from '@/theme';

interface MaintenanceFormProps {
  equipmentId: string;
  maintenanceRecord?: MaintenanceRecord;
  onSave: () => void;
  onCancel: () => void;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  equipmentId,
  maintenanceRecord,
  onSave,
  onCancel,
}) => {
  const theme = useTheme();
  const { addMaintenanceRecord, updateMaintenanceRecord } = useEquipmentStore();
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>(
    maintenanceRecord || {
      equipmentId,
      date: new Date().toISOString(),
      technician: '',
      description: '',
      cost: 0,
      nextMaintenanceDate: new Date().toISOString(),
      status: 'scheduled',
    }
  );

  const handleSave = () => {
    if (!formData.technician || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const maintenanceData: MaintenanceRecord = {
      id: maintenanceRecord?.id || Date.now().toString(),
      equipmentId,
      date: formData.date || new Date().toISOString(),
      technician: formData.technician!,
      description: formData.description!,
      cost: formData.cost || 0,
      nextMaintenanceDate: formData.nextMaintenanceDate || new Date().toISOString(),
      status: formData.status || 'scheduled',
    };

    if (maintenanceRecord) {
      updateMaintenanceRecord(maintenanceRecord.id, maintenanceData);
    } else {
      addMaintenanceRecord(maintenanceData);
    }

    onSave();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Technician *</Text>
        <TextInput
          style={styles.input}
          value={formData.technician}
          onChangeText={(text) => setFormData({ ...formData, technician: text })}
          placeholder="Technician name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Maintenance description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Cost</Text>
        <TextInput
          style={styles.input}
          value={formData.cost?.toString()}
          onChangeText={(text) => {
            const cost = parseFloat(text) || 0;
            setFormData({ ...formData, cost });
          }}
          placeholder="Maintenance cost"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Status *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
            style={styles.picker}
          >
            <Picker.Item label="Scheduled" value="scheduled" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Cancelled" value="cancelled" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Maintenance Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.date}
          onChangeText={(text) => setFormData({ ...formData, date: text })}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Next Maintenance Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.nextMaintenanceDate}
          onChangeText={(text) => setFormData({ ...formData, nextMaintenanceDate: text })}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={[styles.buttonText, styles.saveButtonText]}>
            {maintenanceRecord ? 'Update' : 'Add'} Maintenance Record
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  saveButtonText: {
    color: '#fff',
  },
}); 