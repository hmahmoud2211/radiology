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
import { Consumable, ConsumableType } from '@/types/equipment';
import { useTheme } from '@/theme';

interface ConsumableFormProps {
  consumable?: Consumable;
  onSave: () => void;
  onCancel: () => void;
}

export const ConsumableForm: React.FC<ConsumableFormProps> = ({
  consumable,
  onSave,
  onCancel,
}) => {
  const theme = useTheme();
  const { addConsumable, updateConsumable } = useEquipmentStore();
  const [formData, setFormData] = useState<Partial<Consumable>>(
    consumable || {
      name: '',
      type: 'contrast',
      quantity: 0,
      minimumQuantity: 10,
      location: '',
      supplier: '',
      lotNumber: '',
      notes: '',
    }
  );

  const handleSave = () => {
    if (!formData.name || !formData.location || !formData.supplier) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const consumableData: Consumable = {
      id: consumable?.id || Date.now().toString(),
      name: formData.name!,
      type: formData.type as ConsumableType,
      quantity: formData.quantity || 0,
      minimumQuantity: formData.minimumQuantity || 10,
      location: formData.location!,
      purchaseDate: formData.purchaseDate || new Date().toISOString(),
      expirationDate: formData.expirationDate || new Date().toISOString(),
      supplier: formData.supplier!,
      lotNumber: formData.lotNumber || '',
      notes: formData.notes,
    };

    if (consumable) {
      updateConsumable(consumable.id, consumableData);
    } else {
      addConsumable(consumableData);
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
          placeholder="Consumable name"
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
            <Picker.Item label="Contrast" value="contrast" />
            <Picker.Item label="Catheter" value="catheter" />
            <Picker.Item label="Syringe" value="syringe" />
            <Picker.Item label="Glove" value="glove" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={styles.input}
          value={formData.quantity?.toString()}
          onChangeText={(text) => {
            const quantity = parseInt(text) || 0;
            setFormData({ ...formData, quantity });
          }}
          placeholder="Current quantity"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Minimum Quantity *</Text>
        <TextInput
          style={styles.input}
          value={formData.minimumQuantity?.toString()}
          onChangeText={(text) => {
            const minimumQuantity = parseInt(text) || 0;
            setFormData({ ...formData, minimumQuantity });
          }}
          placeholder="Minimum quantity threshold"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholder="Storage location"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Supplier *</Text>
        <TextInput
          style={styles.input}
          value={formData.supplier}
          onChangeText={(text) => setFormData({ ...formData, supplier: text })}
          placeholder="Supplier name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Lot Number</Text>
        <TextInput
          style={styles.input}
          value={formData.lotNumber}
          onChangeText={(text) => setFormData({ ...formData, lotNumber: text })}
          placeholder="Lot number"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Expiration Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.expirationDate}
          onChangeText={(text) => setFormData({ ...formData, expirationDate: text })}
          placeholder="YYYY-MM-DD"
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
            {consumable ? 'Update' : 'Add'} Consumable
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