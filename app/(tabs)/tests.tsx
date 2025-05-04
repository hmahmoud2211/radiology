import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useTestsStore } from '@/store/testsStore';
import TestCard from '@/components/shared/TestCard';
import SearchBar from '@/components/shared/SearchBar';
import FilterChip from '@/components/shared/FilterChip';
import { RadiologyTest, Modality } from '@/types';

export default function TestsScreen() {
  const router = useRouter();
  const { tests, fetchTests, selectTest } = useTestsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTests, setFilteredTests] = useState<RadiologyTest[]>([]);
  const [selectedModality, setSelectedModality] = useState<Modality | 'All'>('All');
  
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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchQuery, selectedModality]);

  const loadData = async () => {
    await fetchTests();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterTests = () => {
    let filtered = [...tests];
    
    // Apply modality filter
    if (selectedModality !== 'All') {
      filtered = filtered.filter(test => test.modality === selectedModality);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        test =>
          test.name.toLowerCase().includes(query) ||
          test.description.toLowerCase().includes(query) ||
          test.bodyPart.toLowerCase().includes(query)
      );
    }
    
    setFilteredTests(filtered);
  };

  const handleTestPress = (test: RadiologyTest) => {
    selectTest(test.id);
    router.push('/test-details');
  };

  const handleModalityFilter = (modality: Modality | 'All') => {
    setSelectedModality(modality);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Radiology Tests</Text>
        <Text style={styles.subtitle}>Browse available tests and procedures</Text>
      </View>
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search tests by name, body part..."
      />
      
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
      
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTests.length > 0 ? (
          filteredTests.map((test) => (
            <TestCard key={test.id} test={test} onPress={handleTestPress} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedModality !== 'All'
                ? 'No tests match your search criteria'
                : 'No tests available'}
            </Text>
          </View>
        )}
      </ScrollView>
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