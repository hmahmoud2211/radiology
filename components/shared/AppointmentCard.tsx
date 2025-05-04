import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, User, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Appointment } from '@/types';

type AppointmentCardProps = {
  appointment: Appointment;
  onPress: (appointment: Appointment) => void;
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onPress }) => {
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'Completed':
        return Colors.success;
      case 'In Progress':
        return Colors.warning;
      case 'Scheduled':
        return Colors.info;
      case 'Checked In':
        return Colors.primary;
      case 'Cancelled':
        return Colors.error;
      case 'No Show':
        return Colors.error;
      default:
        return Colors.darkGray;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(appointment)}>
      <View style={styles.header}>
        <Text style={styles.testName}>{appointment.testName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <User size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{appointment.patientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{appointment.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{appointment.time}</Text>
        </View>
        {appointment.notes && (
          <View style={styles.infoRow}>
            <FileText size={16} color={Colors.darkGray} />
            <Text style={styles.infoText} numberOfLines={2}>
              {appointment.notes}
            </Text>
          </View>
        )}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  testName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
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
  infoContainer: {
    marginBottom: 8,
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
});

export default AppointmentCard;