import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { User, FileText } from 'lucide-react-native';

export function RadiologistInfoSection({
  radiologist,
  date,
  signatureUri,
  onRadiologistChange,
  onDateChange,
  onUploadSignature,
}: {
  radiologist: string;
  date: string;
  signatureUri?: string | null;
  onRadiologistChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onUploadSignature: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <User color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.headerText}>Radiologist Info</Text>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Radiologist Name</Text>
        <TextInput
          style={styles.input}
          value={radiologist}
          onChangeText={onRadiologistChange}
          placeholder="Enter radiologist name"
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={onDateChange}
          placeholder="YYYY-MM-DD"
        />
      </View>
      <TouchableOpacity style={styles.signatureButton} onPress={onUploadSignature}>
        <FileText size={20} color="#2563eb" />
        <Text style={styles.signatureText}>Upload E-signature</Text>
      </TouchableOpacity>
      {signatureUri && (
        <Image
          source={{ uri: signatureUri }}
          style={styles.signatureImage}
        />
      )}
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
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  signatureText: {
    marginLeft: 8,
    color: '#2563eb',
    fontWeight: '600',
  },
  signatureImage: {
    width: 120,
    height: 40,
    marginTop: 8,
    resizeMode: 'contain',
  },
});

export default RadiologistInfoSection; 