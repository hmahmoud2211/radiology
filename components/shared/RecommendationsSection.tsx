import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FileText } from 'lucide-react-native';

export function RecommendationsSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <FileText color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.headerText}>Recommendations (optional)</Text>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Follow-up Actions</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="Enter any follow-up or further actions (optional)"
          multiline
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default RecommendationsSection; 