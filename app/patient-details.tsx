import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Phone, Mail, MapPin, FileText, Plus, Edit } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { useStudiesStore } from '@/store/studiesStore';
import StudyCard from '@/components/shared/StudyCard';
import AppointmentCard from '@/components/shared/AppointmentCard';
import Button from '@/components/shared/Button';
import { Study, Appointment } from '@/types';

export default function PatientDetailsScreen() {
  const router = useRouter();
  const { selectedPatient, getPatientAppointments } = usePatientStore();
  const { studies, getPatientStudies, selectStudy } = useStudiesStore();
  
  const [patientStudies, setPatientStudies] = useState<Study[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (selectedPatient) {
      const fetchedStudies = getPatientStudies(selectedPatient.id);
      setPatientStudies(fetchedStudies);
      
      const fetchedAppointments = getPatientAppointments(selectedPatient.id);
      setPatientAppointments(fetchedAppointments);
    }
  }, [selectedPatient, studies]);

  if (!selectedPatient) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Patient not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleStudyPress = (study: Study) => {
    selectStudy(study.id);
    router.push('/study-details');
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push('/appointment-details');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.patientName}>{selectedPatient.name}</Text>
            <Text style={styles.patientId}>{selectedPatient.patientId}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-patient')}>
            <Edit size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.demographicsContainer}>
          <Text style={styles.demographics}>
            {selectedPatient.age} years • {selectedPatient.gender} • DOB: {selectedPatient.dob}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Phone size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{selectedPatient.contactNumber}</Text>
        </View>
        {selectedPatient.email && (
          <View style={styles.infoRow}>
            <Mail size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>{selectedPatient.email}</Text>
          </View>
        )}
        {selectedPatient.address && (
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>{selectedPatient.address}</Text>
          </View>
        )}
      </View>

      {selectedPatient.medicalHistory || selectedPatient.allergies?.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          {selectedPatient.medicalHistory && (
            <View style={styles.medicalInfoRow}>
              <Text style={styles.medicalInfoLabel}>Medical History:</Text>
              <Text style={styles.medicalInfoText}>{selectedPatient.medicalHistory}</Text>
            </View>
          )}
          {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
            <View style={styles.medicalInfoRow}>
              <Text style={styles.medicalInfoLabel}>Allergies:</Text>
              <Text style={[styles.medicalInfoText, styles.allergiesText]}>
                {selectedPatient.allergies.join(', ')}
              </Text>
            </View>
          )}
          {selectedPatient.insuranceInfo && (
            <View style={styles.medicalInfoRow}>
              <Text style={styles.medicalInfoLabel}>Insurance:</Text>
              <Text style={styles.medicalInfoText}>{selectedPatient.insuranceInfo}</Text>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Imaging Studies</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/new-study')}>
          <Plus size={16} color={Colors.primary} />
          <Text style={styles.addButtonText}>New Study</Text>
        </TouchableOpacity>
      </View>

      {patientStudies.length > 0 ? (
        patientStudies.map((study) => (
          <StudyCard key={study.id} study={study} onPress={handleStudyPress} />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No studies available</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Appointments</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/schedule-appointment')}>
          <Plus size={16} color={Colors.primary} />
          <Text style={styles.addButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {patientAppointments.length > 0 ? (
        patientAppointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} onPress={handleAppointmentPress} />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No appointments scheduled</Text>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <Button
          title="View Patient History"
          onPress={() => router.push('/patient-history')}
          variant="outline"
          icon={<FileText size={18} color={Colors.primary} />}
          fullWidth
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Schedule New Appointment"
          onPress={() => router.push('/schedule-appointment')}
          icon={<Calendar size={18} color="white" />}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: Colors.subtext,
  },
  editButton: {
    padding: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  demographicsContainer: {
    backgroundColor: Colors.lightGray,
    padding: 8,
    borderRadius: 4,
  },
  demographics: {
    fontSize: 14,
    color: Colors.darkGray,
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
  medicalInfoRow: {
    marginBottom: 8,
  },
  medicalInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  medicalInfoText: {
    fontSize: 14,
    color: Colors.text,
  },
  allergiesText: {
    color: Colors.error,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: Colors.lightGray,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.subtext,
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