import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ICD11Entry } from '../../types';
import ICD11AutocompleteInput from './ICD11AutocompleteInput';

interface SearchModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  dataset: ICD11Entry[];
  onSelect: (entry: ICD11Entry) => void;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ visible, title, placeholder, dataset, onSelect, onClose }) => {
  const [inputValue, setInputValue] = useState('');

  // Reset input when modal opens
  React.useEffect(() => {
    if (visible) setInputValue('');
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 22, color: '#888' }}>×</Text>
            </TouchableOpacity>
          </View>
          <ICD11AutocompleteInput
            value={inputValue}
            onSelect={entry => {
              if (entry && typeof entry === 'object') {
                onSelect(entry);
                onClose();
              } else if (typeof entry === 'string') {
                setInputValue(entry);
              }
            }}
            placeholder={placeholder || 'Search...'}
            dataset={dataset}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modal: {
    width: '92%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
    marginTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});

export default SearchModal; 