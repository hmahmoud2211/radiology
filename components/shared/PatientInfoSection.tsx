import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { Patient } from '@/types';

export function PatientInfoSection({ patient }: { patient: Patient }) {
  if (!patient) return null;
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <User color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.headerText}>Patient Info</Text>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={patient.name}
          editable={false}
          style={styles.input}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Patient ID</Text>
        <TextInput
          value={patient.patientId}
          editable={false}
          style={styles.input}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          value={patient.dob}
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

export default PatientInfoSection; 