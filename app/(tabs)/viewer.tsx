import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image as RNImage } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/colors';
import { useStudiesStore } from '../../store/studiesStore';
import { useViewerStore } from '../../store/viewerStore';
import ImageViewer from '../../components/viewer/ImageViewer';
import StudyCard from '../../components/shared/StudyCard';
import SearchBar from '../../components/shared/SearchBar';
import { Study } from '../../types';
import Slider from '@react-native-community/slider';

export default function ViewerScreen() {
  const router = useRouter();
  const { studies, fetchStudies, selectedStudy, selectStudy } = useStudiesStore();
  const viewerStore = useViewerStore();
  const {
    isComparisonMode,
    setComparisonMode,
    comparisonStudyId,
    setComparisonStudyId,
    comparisonImageIndex,
    setComparisonImageIndex,
    overlayMode,
    setOverlayMode,
    overlayOpacity,
    setOverlayOpacity,
    syncZoom,
    setSyncZoom,
    syncPan,
    setSyncPan,
    syncWindowLevel,
    setSyncWindowLevel,
    resetViewerSettings,
  } = viewerStore;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [firstStudy, setFirstStudy] = useState<Study | null>(null);
  const [secondStudy, setSecondStudy] = useState<Study | null>(null);
  const [selectingForComparison, setSelectingForComparison] = useState<'first' | 'second' | null>(null);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [imagePickerImages, setImagePickerImages] = useState<string[]>([]);
  const [onImagePicked, setOnImagePicked] = useState<((img: string) => void) | null>(null);
  const [firstImage, setFirstImage] = useState<string | null>(null);
  const [secondImage, setSecondImage] = useState<string | null>(null);
  const [firstImageIndex, setFirstImageIndex] = useState(0);
  const [secondImageIndex, setSecondImageIndex] = useState(0);

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
        (study: Study) => study.status === 'Completed' && study.images && study.images.length > 0
      );
      setFilteredStudies(completedStudies);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = studies.filter(
      (study: Study) =>
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

  // Handler to start comparison selection
  const handleStartComparison = () => {
    setSelectingForComparison('first');
    setComparisonMode(false);
    setFirstStudy(null);
    setSecondStudy(null);
  };

  // Handler to select a study for comparison (now triggers image picker)
  const handleSelectForComparison = (study: Study) => {
    if (selectingForComparison === 'first') {
      setImagePickerImages(study.images || []);
      setImagePickerVisible(true);
      setOnImagePicked(() => (img: string) => {
        setFirstStudy(study);
        setFirstImage(img);
        setSelectingForComparison('second');
        setImagePickerVisible(false);
      });
    } else if (selectingForComparison === 'second') {
      setImagePickerImages(study.images || []);
      setImagePickerVisible(true);
      setOnImagePicked(() => (img: string) => {
        setSecondStudy(study);
        setSecondImage(img);
        setComparisonMode(true);
        setComparisonStudyId(study.id);
        setComparisonImageIndex(0);
        setSelectingForComparison(null);
        setImagePickerVisible(false);
      });
    }
  };

  // Handler to exit comparison mode (reset images too)
  const handleExitComparison = () => {
    setComparisonMode(false);
    setFirstStudy(null);
    setSecondStudy(null);
    setFirstImage(null);
    setSecondImage(null);
    setComparisonStudyId(null);
    setComparisonImageIndex(0);
    setOverlayMode(false);
    setOverlayOpacity(0.5);
  };

  // Get images for comparison
  const firstImages = firstStudy?.images || [];
  const secondImages = secondStudy?.images || [];

  return (
    <View style={styles.container}>
      {/* Image Picker Modal */}
      <Modal visible={imagePickerVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, maxWidth: 320 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Select Image</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {imagePickerImages.map((img, idx) => (
                <TouchableOpacity key={idx} onPress={() => { onImagePicked && onImagePicked(img); }} style={{ marginRight: 12 }}>
                  <RNImage source={{ uri: img }} style={{ width: 100, height: 100, borderRadius: 8, borderWidth: 2, borderColor: '#eee' }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setImagePickerVisible(false)} style={{ marginTop: 16, alignSelf: 'flex-end' }}>
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Compare Images Button */}
      {!isComparisonMode && (
        <TouchableOpacity style={[styles.compareButton, { margin: 16 }]} onPress={handleStartComparison}>
          <Text style={styles.compareButtonText}>Compare Images</Text>
        </TouchableOpacity>
      )}
      {/* Comparison Selection UI */}
      {selectingForComparison && (
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          <Text style={styles.compareSelectText}>
            {selectingForComparison === 'first' ? 'Select the first image/study to compare:' : 'Select the second image/study to compare:'}
          </Text>
          {filteredStudies.map((study) => (
            <StudyCard key={study.id} study={study} onPress={handleSelectForComparison} />
          ))}
        </ScrollView>
      )}
      {/* Comparison Mode UI */}
      {isComparisonMode && firstStudy && secondStudy && firstImage && secondImage && (
        <View style={styles.comparisonPanel}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonTitle}>Image Comparison</Text>
            <TouchableOpacity onPress={handleExitComparison} style={styles.exitCompareButton}>
              <Text style={styles.exitCompareButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
          {/* Overlay/Blend Toggle */}
          <View style={styles.overlayControls}>
            <TouchableOpacity onPress={() => setOverlayMode(false)} style={[styles.overlayToggle, !overlayMode && styles.overlayToggleActive]}>
              <Text style={styles.overlayToggleText}>Side-by-Side</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOverlayMode(true)} style={[styles.overlayToggle, overlayMode && styles.overlayToggleActive]}>
              <Text style={styles.overlayToggleText}>Overlay/Blend</Text>
            </TouchableOpacity>
            {overlayMode && (
              <View style={styles.opacitySliderRow}>
                <Text style={styles.opacityLabel}>Opacity</Text>
                <Slider
                  style={{ width: 120, height: 40 }}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  value={overlayOpacity}
                  onValueChange={setOverlayOpacity}
                />
                <Text style={styles.opacityValue}>{Math.round(overlayOpacity * 100)}%</Text>
              </View>
            )}
          </View>
          {/* Comparison Images */}
          {!overlayMode ? (
            <View style={styles.sideBySideImages}>
              <ImageViewer images={[firstImage]} studyInfo={{
                patientName: firstStudy.patientName ?? '',
                modality: firstStudy.modality ?? '',
                bodyPart: firstStudy.bodyPart ?? '',
                studyDate: firstStudy.studyDate ?? '',
              }} currentImageIndex={firstImageIndex} setCurrentImageIndex={setFirstImageIndex} />
              <ImageViewer images={[secondImage]} studyInfo={{
                patientName: secondStudy.patientName ?? '',
                modality: secondStudy.modality ?? '',
                bodyPart: secondStudy.bodyPart ?? '',
                studyDate: secondStudy.studyDate ?? '',
              }} currentImageIndex={secondImageIndex} setCurrentImageIndex={setSecondImageIndex} />
            </View>
          ) : (
            <View style={styles.overlayImages}>
              <View style={styles.overlayImageContainer}>
                {firstImage && (
                  <ImageViewer images={[firstImage]} studyInfo={undefined} currentImageIndex={firstImageIndex} setCurrentImageIndex={setFirstImageIndex} />
                )}
                {secondImage && (
                  <View style={[styles.overlayAbsolute, { opacity: overlayOpacity }]}> 
                    <ImageViewer images={[secondImage]} studyInfo={undefined} currentImageIndex={secondImageIndex} setCurrentImageIndex={setSecondImageIndex} />
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}
      {/* Default Viewer UI if not in comparison mode or selection */}
      {!isComparisonMode && !selectingForComparison && (
        selectedStudy && selectedStudy.images && selectedStudy.images.length > 0 ? (
          <View style={styles.viewerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => selectStudy('')}
            >
              <Text style={styles.backButtonText}>Back to Studies</Text>
            </TouchableOpacity>
            <ImageViewer 
              images={selectedStudy.images}
              studyInfo={{
                patientName: selectedStudy.patientName ?? '',
                modality: selectedStudy.modality ?? '',
                bodyPart: selectedStudy.bodyPart ?? '',
                studyDate: selectedStudy.studyDate ?? '',
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
                filteredStudies.map((study: Study) => (
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
        )
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
  compareButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  compareButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '500',
  },
  comparisonPanel: {
    flex: 1,
    padding: 16,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  exitCompareButton: {
    padding: 8,
    borderRadius: 8,
  },
  exitCompareButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  overlayControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overlayToggle: {
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  overlayToggleActive: {
    backgroundColor: Colors.primary,
  },
  overlayToggleText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  opacitySliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  opacityLabel: {
    marginRight: 8,
    color: Colors.text,
  },
  opacityValue: {
    color: Colors.text,
  },
  sideBySideImages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlayImages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayImageContainer: {
    position: 'relative',
  },
  overlayAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  compareSelectText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 16,
  },
});