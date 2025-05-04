import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Phone, Clock, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Patient } from '@/types';

type PatientCardProps = {
  patient: Patient;
  onPress: (patient: Patient) => void;
};

const PatientCard: React.FC<PatientCardProps> = ({ patient, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(patient)}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{patient.name}</Text>
          <View style={styles.idContainer}>
            <Text style={styles.id}>{patient.patientId}</Text>
          </View>
        </View>
        <View style={styles.demographicsContainer}>
          <Text style={styles.demographics}>
            {patient.age} yrs • {patient.gender}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>DOB: {patient.dob}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{patient.contactNumber}</Text>
        </View>
        {patient.lastVisit && (
          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>Last visit: {patient.lastVisit}</Text>
          </View>
        )}
      </View>

      {patient.upcomingAppointment && (
        <View style={styles.appointmentContainer}>
          <Text style={styles.appointmentLabel}>Upcoming Appointment</Text>
          <Text style={styles.appointmentDate}>{patient.upcomingAppointment}</Text>
        </View>
      )}

      {patient.allergies && patient.allergies.length > 0 && (
        <View style={styles.allergiesContainer}>
          <Text style={styles.allergiesLabel}>Allergies:</Text>
          <Text style={styles.allergies}>{patient.allergies.join(', ')}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  id: {
    fontSize: 14,
    color: Colors.subtext,
  },
  demographicsContainer: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  demographics: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  infoContainer: {
    marginBottom: 16,
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
  appointmentContainer: {
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  appointmentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  allergiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  allergiesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginRight: 4,
  },
  allergies: {
    fontSize: 14,
    color: Colors.error,
  },
});

export default PatientCard;