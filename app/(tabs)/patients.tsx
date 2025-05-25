import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { usePatientStore } from '../../store/patientStore';
import PatientCard from '../../components/shared/PatientCard';
import SearchBar from '../../components/shared/SearchBar';
import { Patient } from '../../types';

export default function PatientsScreen() {
  const router = useRouter();
  const { patients, fetchPatients, selectPatient } = usePatientStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchQuery]);

  const loadData = async () => {
    await fetchPatients();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterPatients = () => {
    if (!searchQuery) {
      setFilteredPatients(patients);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = patients.filter(
      (patient: Patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.patientId.toLowerCase().includes(query) ||
        (patient.contactNumber && patient.contactNumber.includes(query)) ||
        (patient.email && patient.email.toLowerCase().includes(query))
    );
    
    setFilteredPatients(filtered);
  };

  const handlePatientPress = (patient: Patient) => {
    selectPatient(patient.id);
    router.push('/patient-details');
  };

  const handleAddPatient = () => {
    router.push('/new-patient');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <Text style={styles.subtitle}>Manage patient records and appointments</Text>
      </View>
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, ID, or contact..."
      />
      
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient: Patient) => (
            <PatientCard key={patient.id} patient={patient} onPress={handlePatientPress} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'No patients match your search criteria'
                : 'No patients available'}
            </Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity style={styles.addButton} onPress={handleAddPatient}>
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.subtext,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyState: {
    backgroundColor: Colors.lightGray,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});