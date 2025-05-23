import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FileText, Activity, MapPin } from 'lucide-react-native';
import { Study } from '@/types';

export function ExaminationDetailsSection({ study }: { study: Study }) {
  if (!study) return null;
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <FileText color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.headerText}>Examination Details</Text>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Modality</Text>
        <TextInput
          value={study.modality}
          editable={false}
          style={styles.input}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Body Region</Text>
        <TextInput
          value={study.bodyPart}
          editable={false}
          style={styles.input}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Room</Text>
        <TextInput
          value={study.room || 'N/A'}
          editable={false}
          style={styles.input}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Reason</Text>
        <TextInput
          value={study.specialInstructions || '-'}
          editable={false}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#666',
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#222',
  },
});

export default ExaminationDetailsSection; 