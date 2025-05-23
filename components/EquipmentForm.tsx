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
import { Equipment, EquipmentType, EquipmentStatus } from '@/types/equipment';
import { useTheme } from '@/theme';

interface EquipmentFormProps {
  equipment?: Equipment;
  onSave: () => void;
  onCancel: () => void;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  equipment,
  onSave,
  onCancel,
}) => {
  const theme = useTheme();
  const { addEquipment, updateEquipment } = useEquipmentStore();
  const [formData, setFormData] = useState<Partial<Equipment>>(
    equipment || {
      name: '',
      type: 'machine',
      serialNumber: '',
      location: '',
      status: 'active',
      manufacturer: '',
      model: '',
      notes: '',
    }
  );

  const handleSave = () => {
    if (!formData.name || !formData.serialNumber || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const equipmentData: Equipment = {
      id: equipment?.id || Date.now().toString(),
      name: formData.name!,
      type: formData.type as EquipmentType,
      serialNumber: formData.serialNumber!,
      location: formData.location!,
      status: formData.status as EquipmentStatus,
      purchaseDate: formData.purchaseDate || new Date().toISOString(),
      lastMaintenanceDate: formData.lastMaintenanceDate || new Date().toISOString(),
      nextMaintenanceDate: formData.nextMaintenanceDate || new Date().toISOString(),
      manufacturer: formData.manufacturer || '',
      model: formData.model || '',
      notes: formData.notes,
    };

    if (equipment) {
      updateEquipment(equipment.id, equipmentData);
    } else {
      addEquipment(equipmentData);
    }

    onSave();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Equipment name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
            style={styles.picker}
          >
            <Picker.Item label="Machine" value="machine" />
            <Picker.Item label="Tool" value="tool" />
            <Picker.Item label="Device" value="device" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Serial Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.serialNumber}
          onChangeText={(text) => setFormData({ ...formData, serialNumber: text })}
          placeholder="Serial number"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholder="Equipment location"
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
            <Picker.Item label="Active" value="active" />
            <Picker.Item label="Maintenance" value="maintenance" />
            <Picker.Item label="Inactive" value="inactive" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Manufacturer</Text>
        <TextInput
          style={styles.input}
          value={formData.manufacturer}
          onChangeText={(text) => setFormData({ ...formData, manufacturer: text })}
          placeholder="Manufacturer name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          value={formData.model}
          onChangeText={(text) => setFormData({ ...formData, model: text })}
          placeholder="Model number"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Additional notes"
          multiline
          numberOfLines={4}
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
            {equipment ? 'Update' : 'Add'} Equipment
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