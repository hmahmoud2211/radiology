import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, DollarSign, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { RadiologyTest } from '@/types';

type TestCardProps = {
  test: RadiologyTest;
  onPress: (test: RadiologyTest) => void;
};

const TestCard: React.FC<TestCardProps> = ({ test, onPress }) => {
  const getModalityColor = () => {
    switch (test.modality) {
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
    <TouchableOpacity style={styles.card} onPress={() => onPress(test)}>
      <View style={styles.header}>
        <View style={[styles.modalityBadge, { backgroundColor: getModalityColor() }]}>
          <Text style={styles.modalityText}>{test.modality}</Text>
        </View>
        <Text style={styles.bodyPart}>{test.bodyPart}</Text>
      </View>

      <Text style={styles.name}>{test.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {test.description}
      </Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Clock size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{test.duration} min</Text>
        </View>
        {test.price && (
          <View style={styles.infoRow}>
            <DollarSign size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>${test.price}</Text>
          </View>
        )}
        {test.contraindications && test.contraindications.length > 0 && (
          <View style={styles.infoRow}>
            <AlertCircle size={16} color={Colors.warning} />
            <Text style={styles.infoText}>
              {test.contraindications.length} contraindication(s)
            </Text>
          </View>
        )}
      </View>

      {test.cptCode && (
        <View style={styles.footer}>
          <Text style={styles.cptCode}>CPT: {test.cptCode}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 12,
  },
  infoContainer: {
    marginTop: 8,
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
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cptCode: {
    fontSize: 12,
    color: Colors.subtext,
  },
});

export default TestCard;