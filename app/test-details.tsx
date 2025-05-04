import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, DollarSign, AlertCircle, FileText, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTestsStore } from '@/store/testsStore';
import Button from '@/components/shared/Button';

export default function TestDetailsScreen() {
  const router = useRouter();
  const { selectedTest } = useTestsStore();

  if (!selectedTest) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Test not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const getModalityColor = () => {
    switch (selectedTest.modality) {
      case 'X-Ray':
        return '#3B82F6'; // Blue
      case 'CT':
        return '#8B5CF6'; // Purple
      case 'MRI':
        return '#10B981'; // Green
      case 'Ultrasound':
        return '#F59E0B'; // Amber
      case 'PET':
        return '#EF4444'; // Red
      case 'Mammography':
        return '#EC4899'; // Pink
      case 'Fluoroscopy':
        return '#6366F1'; // Indigo
      default:
        return Colors.primary;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.modalityBadge, { backgroundColor: getModalityColor() }]}>
            <Text style={styles.modalityText}>{selectedTest.modality}</Text>
          </View>
          <Text style={styles.bodyPart}>{selectedTest.bodyPart}</Text>
        </View>
        <Text style={styles.testName}>{selectedTest.name}</Text>
        {selectedTest.cptCode && (
          <Text style={styles.cptCode}>CPT Code: {selectedTest.cptCode}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{selectedTest.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Details</Text>
        <View style={styles.infoRow}>
          <Clock size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>Duration: {selectedTest.duration} minutes</Text>
        </View>
        {selectedTest.price && (
          <View style={styles.infoRow}>
            <DollarSign size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>Price: ${selectedTest.price}</Text>
          </View>
        )}
      </View>

      {selectedTest.preparationInstructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparation Instructions</Text>
          <Text style={styles.instructions}>{selectedTest.preparationInstructions}</Text>
        </View>
      )}

      {selectedTest.contraindications && selectedTest.contraindications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contraindications</Text>
          {selectedTest.contraindications.map((contraindication, index) => (
            <View key={index} style={styles.contraindicationRow}>
              <AlertCircle size={16} color={Colors.error} />
              <Text style={styles.contraindicationText}>{contraindication}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionsContainer}>
        <Button
          title="Schedule Test"
          onPress={() => router.push('/schedule-test')}
          icon={<Calendar size={18} color="white" />}
          fullWidth
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="View Test Protocol"
          onPress={() => router.push('/test-protocol')}
          variant="outline"
          icon={<FileText size={18} color={Colors.primary} />}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  modalityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  bodyPart: {
    fontSize: 14,
    color: Colors.text,
  },
  testName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cptCode: {
    fontSize: 14,
    color: Colors.subtext,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  instructions: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  contraindicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contraindicationText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.error,
  },
  actionsContainer: {
    marginTop: 8,
  },
  buttonSpacer: {
    height: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
});