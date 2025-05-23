import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText } from 'lucide-react-native';
import SearchModal from './SearchModal';
import { ICD11Entry } from '../../types';
const icd11Data: ICD11Entry[] = require('../../mocks/icd11.json');

export function ImpressionSection({ value, onSelect }: { value: string; onSelect: (v: any) => void }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <FileText color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.headerText}>Impression</Text>
      </View>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <TextInput
          style={styles.input}
          value={value}
          placeholder="Enter impression/diagnosis (ICD-11)..."
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>
      <SearchModal
        visible={modalVisible}
        title="Impression Search"
        placeholder="Search ICD-11 diagnosis..."
        dataset={icd11Data}
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

export default ImpressionSection; 