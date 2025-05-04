import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { FileText, Calendar, User, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Study } from '@/types';

type StudyCardProps = {
  study: Study;
  onPress: (study: Study) => void;
};

const StudyCard: React.FC<StudyCardProps> = ({ study, onPress }) => {
  const getStatusColor = () => {
    switch (study.status) {
      case 'Completed':
        return Colors.success;
      case 'In Progress':
        return Colors.warning;
      case 'Scheduled':
        return Colors.info;
      case 'Cancelled':
        return Colors.error;
      default:
        return Colors.darkGray;
    }
  };

  const getPriorityColor = () => {
    switch (study.priority) {
      case 'STAT':
        return Colors.error;
      case 'Urgent':
        return Colors.warning;
      case 'Routine':
        return Colors.info;
      default:
        return Colors.darkGray;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(study)}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.modality}>{study.modality}</Text>
          <Text style={styles.bodyPart}>{study.bodyPart}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{study.status}</Text>
        </View>
      </View>

      {study.images && study.images.length > 0 && (
        <Image
          source={{ uri: study.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <User size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{study.patientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{study.studyDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <FileText size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>
            Report: {study.reportStatus}
          </Text>
        </View>
        {study.radiologist && (
          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>{study.radiologist}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
          <Text style={styles.priorityText}>{study.priority}</Text>
        </View>
        <Text style={styles.accessionNumber}>#{study.accessionNumber}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modality: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 8,
  },
  bodyPart: {
    fontSize: 14,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 12,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  accessionNumber: {
    fontSize: 12,
    color: Colors.subtext,
  },
});

export default StudyCard;