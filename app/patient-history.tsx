import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { useStudiesStore } from '@/store/studiesStore';
import { Patient, Study, Appointment } from '@/types';

export default function PatientHistoryScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const { patients, getPatientAppointments } = usePatientStore();
  const { studies, selectStudy } = useStudiesStore();

  const patient: Patient | undefined = useMemo(() => patients.find(p => p.id === patientId), [patients, patientId]);
  const patientAppointments: Appointment[] = useMemo(() => patient ? getPatientAppointments(patient.id) : [], [patient, getPatientAppointments]);
  const patientStudies: Study[] = useMemo(() => patient ? studies.filter(s => s.patientId === patient.id) : [], [patient, studies]);

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Patient not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Patient History</Text>
      {/* Demographics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demographics</Text>
        <Text style={styles.infoText}><Text style={styles.label}>Name:</Text> {patient.name}</Text>
        <Text style={styles.infoText}><Text style={styles.label}>ID:</Text> {patient.patientId}</Text>
        <Text style={styles.infoText}><Text style={styles.label}>DOB:</Text> {patient.dob}</Text>
        <Text style={styles.infoText}><Text style={styles.label}>Gender:</Text> {patient.gender}</Text>
        {patient.contactNumber && <Text style={styles.infoText}><Text style={styles.label}>Contact:</Text> {patient.contactNumber}</Text>}
        {patient.email && <Text style={styles.infoText}><Text style={styles.label}>Email:</Text> {patient.email}</Text>}
        {patient.address && <Text style={styles.infoText}><Text style={styles.label}>Address:</Text> {patient.address}</Text>}
      </View>
      {/* Allergies & Adverse Reactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allergies & Adverse Reactions</Text>
        {patient.allergies && patient.allergies.length > 0 ? (
          <Text style={[styles.infoText, styles.allergyText]}>{patient.allergies.join(', ')}</Text>
        ) : (
          <Text style={styles.infoText}>No known allergies</Text>
        )}
      </View>
      {/* Medical History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical History</Text>
        {patient.medicalHistory ? (
          <Text style={styles.infoText}>{patient.medicalHistory}</Text>
        ) : (
          <Text style={styles.infoText}>No significant medical history</Text>
        )}
        {/* Add more fields for diagnoses, procedures, immunizations, etc. if available */}
      </View>
      {/* Past Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past Appointments</Text>
        {patientAppointments.length > 0 ? (
          patientAppointments.map((appt) => (
            <View key={appt.id} style={styles.appointmentCard}>
              <Text style={styles.appointmentDate}>{appt.date} {appt.time}</Text>
              <Text style={styles.infoText}>{appt.testName}</Text>
              {appt.notes && <Text style={styles.infoText}>Notes: {appt.notes}</Text>}
              <Text style={styles.infoText}>Status: {appt.status}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.infoText}>No past appointments found</Text>
        )}
      </View>
      {/* Diagnostic Studies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostic Studies</Text>
        {patientStudies.length > 0 ? (
          patientStudies.map((study) => (
            <TouchableOpacity
              key={study.id}
              style={styles.studyCard}
              onPress={() => {
                selectStudy(study.id);
                router.push('/radiology-report');
              }}
            >
              <Text style={styles.studyTitle}>{study.modality} - {study.bodyPart}</Text>
              <Text style={styles.studyDate}>{study.studyDate}</Text>
              <Text style={styles.infoText}>Status: {study.status}</Text>
              <Text style={styles.linkText}>View Report</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.infoText}>No diagnostic studies found</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginBottom: 16, textAlign: 'center' },
  section: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  infoText: { fontSize: 14, color: Colors.text, marginBottom: 4 },
  label: { fontWeight: '600', color: Colors.subtext },
  allergyText: { color: Colors.error },
  appointmentCard: { backgroundColor: Colors.lightGray, borderRadius: 8, padding: 10, marginBottom: 8 },
  appointmentDate: { fontWeight: '600', color: Colors.primary, marginBottom: 2 },
  studyCard: { backgroundColor: Colors.lightGray, borderRadius: 8, padding: 10, marginBottom: 8 },
  studyTitle: { fontWeight: '600', color: Colors.primary },
  studyDate: { color: Colors.subtext, marginBottom: 2 },
  linkText: { color: Colors.primary, fontWeight: '600', marginTop: 4 },
  backButton: { marginTop: 16, alignSelf: 'center', padding: 12, backgroundColor: Colors.primary, borderRadius: 8 },
  backButtonText: { color: 'white', fontWeight: '600' },
}); 