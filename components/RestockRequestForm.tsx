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
import { useEquipmentStore } from '@/store/equipmentStore';
import { RestockRequest, Consumable } from '@/types/equipment';
import { useTheme } from '@/theme';

interface RestockRequestFormProps {
  consumable: Consumable;
  onSave: () => void;
  onCancel: () => void;
}

export const RestockRequestForm: React.FC<RestockRequestFormProps> = ({
  consumable,
  onSave,
  onCancel,
}) => {
  const theme = useTheme();
  const { createRestockRequest } = useEquipmentStore();
  const [formData, setFormData] = useState<Partial<RestockRequest>>({
    consumableId: consumable.id,
    requestedQuantity: consumable.minimumQuantity * 2,
    requestDate: new Date().toISOString(),
    status: 'pending',
    notes: '',
  });

  const handleSave = () => {
    if (!formData.requestedQuantity || formData.requestedQuantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const requestData: RestockRequest = {
      id: Date.now().toString(),
      consumableId: consumable.id,
      requestedQuantity: formData.requestedQuantity!,
      requestedBy: 'current_user_id', // This should come from your auth context
      requestDate: new Date().toISOString(),
      status: 'pending',
      notes: formData.notes,
    };

    createRestockRequest(requestData);
    onSave();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Consumable Information</Text>
        <Text style={styles.infoText}>Name: {consumable.name}</Text>
        <Text style={styles.infoText}>Current Quantity: {consumable.quantity}</Text>
        <Text style={styles.infoText}>Minimum Quantity: {consumable.minimumQuantity}</Text>
        <Text style={styles.infoText}>Location: {consumable.location}</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Requested Quantity *</Text>
        <TextInput
          style={styles.input}
          value={formData.requestedQuantity?.toString()}
          onChangeText={(text) => {
            const quantity = parseInt(text) || 0;
            setFormData({ ...formData, requestedQuantity: quantity });
          }}
          placeholder="Enter quantity to restock"
          keyboardType="numeric"
        />
        <Text style={styles.helperText}>
          Recommended: {consumable.minimumQuantity * 2} units
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Additional notes for the request"
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
            Create Restock Request
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
  infoSection: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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