import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useStudiesStore } from '@/store/studiesStore';
import { useViewerStore } from '@/store/viewerStore';
import ImageViewer from '@/components/viewer/ImageViewer';
import StudyCard from '@/components/shared/StudyCard';
import SearchBar from '@/components/shared/SearchBar';
import { Study } from '@/types';

export default function ViewerScreen() {
  const router = useRouter();
  const { studies, fetchStudies, selectedStudy, selectStudy } = useStudiesStore();
  const { resetViewerSettings } = useViewerStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);

  useEffect(() => {
    loadData();
    return () => {
      // Reset viewer settings when leaving the screen
      resetViewerSettings();
    };
  }, []);

  useEffect(() => {
    filterStudies();
  }, [studies, searchQuery]);

  const loadData = async () => {
    await fetchStudies();
  };

  const filterStudies = () => {
    if (!searchQuery) {
      // Only show completed studies with images
      const completedStudies = studies.filter(
        study => study.status === 'Completed' && study.images && study.images.length > 0
      );
      setFilteredStudies(completedStudies);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = studies.filter(
      study =>
        study.patientName.toLowerCase().includes(query) ||
        study.modality.toLowerCase().includes(query) ||
        study.bodyPart.toLowerCase().includes(query) ||
        study.accessionNumber.toLowerCase().includes(query)
    );
    
    setFilteredStudies(filtered);
  };

  const handleStudyPress = (study: Study) => {
    selectStudy(study.id);
    resetViewerSettings();
  };

  return (
    <View style={styles.container}>
      {selectedStudy && selectedStudy.images && selectedStudy.images.length > 0 ? (
        <View style={styles.viewerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => selectStudy(null)}
          >
            <Text style={styles.backButtonText}>Back to Studies</Text>
          </TouchableOpacity>
          
          <ImageViewer 
            images={selectedStudy.images}
            studyInfo={{
              patientName: selectedStudy.patientName,
              modality: selectedStudy.modality,
              bodyPart: selectedStudy.bodyPart,
              studyDate: selectedStudy.studyDate,
            }}
          />
        </View>
      ) : (
        <View style={styles.studiesContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Image Viewer</Text>
            <Text style={styles.subtitle}>Select a study to view images</Text>
          </View>
          
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search studies..."
          />
          
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
          >
            {filteredStudies.length > 0 ? (
              filteredStudies.map((study) => (
                <StudyCard key={study.id} study={study} onPress={handleStudyPress} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'No studies match your search criteria'
                    : 'No studies with images available'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  studiesContainer: {
    flex: 1,
    padding: 16,
  },
  viewerContainer: {
    flex: 1,
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
  backButton: {
    backgroundColor: Colors.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});