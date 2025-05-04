import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import { useStudiesStore } from '@/store/studiesStore';
import StudyCard from '@/components/shared/StudyCard';
import SearchBar from '@/components/shared/SearchBar';
import FilterChip from '@/components/shared/FilterChip';
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

  const handleModalityFilter = (modality: Modality | 'All') => {
    setSelectedModality(modality);
  };

  const handleStatusFilter = (status: StudyStatus | 'All') => {
    setSelectedStatus(status);
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
        
        <Text style={styles.filterLabel}>Filter by Modality:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {modalities.map((modality) => (
            <FilterChip
              key={modality}
              label={modality}
              isSelected={selectedModality === modality}
              onPress={() => handleModalityFilter(modality)}
            />
          ))}
        </ScrollView>
        
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {statuses.map((status) => (
            <FilterChip
              key={status}
              label={status}
              isSelected={selectedStatus === status}
              onPress={() => handleStatusFilter(status)}
            />
          ))}
        </ScrollView>
        
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
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 16,
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