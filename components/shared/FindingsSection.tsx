import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText } from 'lucide-react-native';
import SearchModal from './SearchModal';

// Placeholder findings dataset by scan type
const findingsData: Record<string, { code: string; name: string; description: string }[]> = {
  CT: [
    { code: 'CT01', name: 'No acute intracranial abnormality', description: 'No evidence of acute bleed or infarct.' },
    { code: 'CT02', name: 'Chronic infarct', description: 'Old infarct seen in left MCA territory.' },
  ],
  MRI: [
    { code: 'MRI01', name: 'White matter hyperintensities', description: 'Scattered T2/FLAIR hyperintensities.' },
    { code: 'MRI02', name: 'No mass lesion', description: 'No evidence of mass or midline shift.' },
  ],
  Ultrasound: [
    { code: 'US01', name: 'Normal liver echotexture', description: 'Liver appears normal.' },
    { code: 'US02', name: 'Gallstones', description: 'Multiple echogenic foci with shadowing in gallbladder.' },
  ],
  'X-Ray': [
    { code: 'XR01', name: 'No acute fracture', description: 'No evidence of acute bone injury.' },
    { code: 'XR02', name: 'Pulmonary infiltrate', description: 'Patchy opacity in right lower lobe.' },
  ],
};

export function FindingsSection({ scanType, value, onSelect }: { scanType: string; value: string; onSelect: (v: any) => void }) {
  const dataset = findingsData[scanType] || [];
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <FileText color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.headerText}>Findings</Text>
      </View>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <TextInput
          style={styles.input}
          value={value}
          placeholder={`Enter findings or select from ${scanType} suggestions...`}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>
      <SearchModal
        visible={modalVisible}
        title="Findings Search"
        placeholder={`Search findings for ${scanType}`}
        dataset={dataset}
        onSelect={entry => onSelect(`${entry.code} - ${entry.name}: ${entry.description}`)}
        onClose={() => setModalVisible(false)}
      />
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
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  input: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minHeight: 60,
  },
});

export default FindingsSection; 