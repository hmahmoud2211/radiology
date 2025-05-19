import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
// import { Picker } from '@react-native-picker/picker'; // Remove this for web compatibility
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useStudiesStore } from '@/store/studiesStore';
import StudyCard from '@/components/shared/StudyCard';
import SearchBar from '@/components/shared/SearchBar';
import { Study, Modality, StudyStatus } from '@/types';

export default function AllStudiesScreen() {
  const router = useRouter();
  const { studies, fetchStudies, selectStudy } = useStudiesStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [selectedModality, setSelectedModality] = useState<Modality | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<StudyStatus | 'All'>('All');
  
  const modalities: (Modality | 'All')[] = [
    'All',
    'X-Ray',
    'CT',
    'MRI',
    'Ultrasound',
    'PET',
    'Mammography',
    'Fluoroscopy',
  ];

  const statuses: (StudyStatus | 'All')[] = [
    'All',
    'Scheduled',
    'In Progress',
    'Completed',
    'Reported',
    'Verified',
    'Cancelled',
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStudies();
  }, [studies, searchQuery, selectedModality, selectedStatus]);

  const loadData = async () => {
    await fetchStudies();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterStudies = () => {
    let filtered = [...studies];
    
    // Apply modality filter
    if (selectedModality !== 'All') {
      filtered = filtered.filter(study => study.modality === selectedModality);
    }
    
    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(study => study.status === selectedStatus);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        study =>
          study.patientName.toLowerCase().includes(query) ||
          study.accessionNumber.toLowerCase().includes(query) ||
          study.bodyPart.toLowerCase().includes(query) ||
          (study.referringPhysician && study.referringPhysician.toLowerCase().includes(query))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime());
    
    setFilteredStudies(filtered);
  };

  const handleStudyPress = (study: Study) => {
    selectStudy(study.id);
    router.push('/study-details');
  };

  // Cross-platform dropdown component
  const Dropdown = ({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.dropdownWrapper}>
          <label style={{ fontWeight: '500', fontSize: 14, color: Colors.text, marginBottom: 4 }}>{label}</label>
          <select
            style={{ width: '100%', height: 44, borderRadius: 8, background: Colors.card, fontSize: 16, paddingLeft: 8 }}
            value={value}
            onChange={e => onChange(e.target.value)}
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </View>
      );
    } else {
      const { Picker } = require('@react-native-picker/picker');
      return (
        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>{label}</Text>
          <Picker
            selectedValue={value}
            onValueChange={onChange}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            mode="dropdown"
          >
            {options.map(opt => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "All Studies" }} />
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by patient, accession #, body part..."
        />

        {/* Dropdown Filters */}
        <View style={styles.dropdownRow}>
          <Dropdown
            label="Modality"
            value={selectedModality}
            onChange={v => setSelectedModality(v as Modality | 'All')}
            options={modalities}
          />
          <Dropdown
            label="Status"
            value={selectedStatus}
            onChange={v => setSelectedStatus(v as StudyStatus | 'All')}
            options={statuses}
          />
        </View>

        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.resultsCount}>{filteredStudies.length} studies found</Text>
          {filteredStudies.length > 0 ? (
            filteredStudies.map((study) => (
              <StudyCard key={study.id} study={study} onPress={handleStudyPress} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedModality !== 'All' || selectedStatus !== 'All'
                  ? 'No studies match your search criteria'
                  : 'No studies available'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  picker: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        height: 44,
      },
      android: {
        height: 44,
      },
    }),
  },
  pickerItem: {
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 12,
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
});