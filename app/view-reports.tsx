import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { useStudiesStore } from '@/store/studiesStore';
import SearchBar from '@/components/shared/SearchBar';
import { Patient, Study } from '@/types';

export default function ViewReportsScreen() {
  const router = useRouter();
  const { patients } = usePatientStore();
  const { studies, selectStudy } = useStudiesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Filter patients by search
  const filteredPatients = searchQuery
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.patientId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

  // Get studies for selected patient
  const patientStudies = selectedPatient
    ? studies.filter((s) => s.patientId === selectedPatient.id)
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>View Patient Reports</Text>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by patient name or ID..."
      />
      {!selectedPatient ? (
        <ScrollView style={styles.listContainer}>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={styles.patientCard}
                onPress={() => setSelectedPatient(patient)}
              >
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientId}>{patient.patientId}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No patients found.</Text>
          )}
        </ScrollView>
      ) : (
        <View style={styles.reportsSection}>
          <TouchableOpacity onPress={() => setSelectedPatient(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Search</Text>
          </TouchableOpacity>
          <Text style={styles.selectedPatientName}>{selectedPatient.name} ({selectedPatient.patientId})</Text>
          <ScrollView style={styles.listContainer}>
            {patientStudies.length > 0 ? (
              patientStudies.map((study) => (
                <TouchableOpacity
                  key={study.id}
                  style={styles.reportCard}
                  onPress={() => {
                    selectStudy(study.id);
                    router.push('/radiology-report');
                  }}
                >
                  <Text style={styles.reportTitle}>{study.modality} - {study.bodyPart}</Text>
                  <Text style={styles.reportDate}>{study.studyDate}</Text>
                  <Text style={styles.reportStatus}>Status: {study.reportStatus || study.status}</Text>
                  <Text style={styles.reportLink}>View Report</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No reports found for this patient.</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  header: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginBottom: 16 },
  listContainer: { flex: 1 },
  patientCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  patientName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  patientId: { fontSize: 13, color: Colors.subtext },
  emptyText: { color: Colors.subtext, fontSize: 15, marginTop: 24, textAlign: 'center' },
  reportsSection: { flex: 1 },
  backButton: { marginBottom: 12 },
  backButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  selectedPatientName: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  reportCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  reportTitle: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  reportDate: { fontSize: 13, color: Colors.subtext, marginBottom: 4 },
  reportStatus: { fontSize: 13, color: Colors.info, marginBottom: 4 },
  reportLink: { color: Colors.primary, fontWeight: '600', marginTop: 4 },
}); 