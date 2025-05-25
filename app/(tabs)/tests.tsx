import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '../../constants/colors';
import { radiologyTests as tests } from '../../mocks/tests';
import Button from '../../components/shared/Button';

const INSURANCES = [
  { name: 'None', discount: 0 },
  { name: 'Aetna', discount: 0.1 },
  { name: 'Blue Cross', discount: 0.15 },
  { name: 'Cigna', discount: 0.12 },
  { name: 'UnitedHealthcare', discount: 0.2 },
  { name: 'Medicare', discount: 0.25 },
];
const MODALITY_COLORS: Record<string, string> = {
  'X-Ray': '#3B82F6',
  'CT': '#8B5CF6',
  'MRI': '#10B981',
  'Ultrasound': '#F59E0B',
  'PET': '#EF4444',
  'Mammography': '#EC4899',
  'Fluoroscopy': '#6366F1',
  'Other': '#FFD166',
};

export default function TestsScreen() {
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [selectedInsurance, setSelectedInsurance] = useState(INSURANCES[0]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Radiology Tests</Text>
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {tests.map((test: any) => (
          <TouchableOpacity
            key={test.id}
            style={[styles.testBox, { backgroundColor: MODALITY_COLORS[test.modality] || MODALITY_COLORS['Other'] }]}
            onPress={() => { setSelectedTest(test); setShowPriceModal(true); setSelectedInsurance(INSURANCES[0]); }}
            activeOpacity={0.85}
          >
            <Text style={styles.testBoxTitle}>{test.name}</Text>
            <Text style={styles.testBoxModality}>{test.modality}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Price/Insurance Modal */}
      {showPriceModal && selectedTest && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedTest.name}</Text>
            <Text style={styles.modalSubtitle}>{selectedTest.modality} - {selectedTest.bodyPart}</Text>
            <Text style={styles.modalLabel}>Select Insurance:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {INSURANCES.map((ins) => (
                <TouchableOpacity
                  key={ins.name}
                  style={[styles.insuranceChip, selectedInsurance.name === ins.name && styles.insuranceChipSelected]}
                  onPress={() => setSelectedInsurance(ins)}
                >
                  <Text style={{ color: selectedInsurance.name === ins.name ? 'white' : Colors.primary }}>{ins.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.modalLabel}>Base Price: ${selectedTest.price ?? 'N/A'}</Text>
            <Text style={styles.modalLabel}>Insurance Discount: {selectedInsurance.discount * 100}%</Text>
            <Text style={styles.modalLabel}>Final Price: ${selectedTest.price ? Math.round(selectedTest.price * (1 - selectedInsurance.discount)) : 'N/A'}</Text>
            <View style={{ marginTop: 16 }}>
              <Button title="Close" onPress={() => setShowPriceModal(false)} fullWidth />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, margin: 16 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', padding: 8 },
  testBox: { width: 160, height: 90, borderRadius: 12, margin: 8, padding: 12, justifyContent: 'center', alignItems: 'flex-start', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2 },
  testBoxTitle: { color: 'white', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  testBoxModality: { color: 'white', fontWeight: '500', fontSize: 13, opacity: 0.8 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalContent: { backgroundColor: Colors.card, borderRadius: 16, padding: 24, width: 320, maxWidth: '90%' },
  modalTitle: { fontWeight: '700', fontSize: 18, color: Colors.text, marginBottom: 4 },
  modalSubtitle: { color: Colors.subtext, fontSize: 14, marginBottom: 12 },
  modalLabel: { color: Colors.text, fontSize: 15, marginTop: 8 },
  insuranceChip: { backgroundColor: Colors.background, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: Colors.primary },
  insuranceChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
});