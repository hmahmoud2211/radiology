import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useViewerStore } from '@/store/viewerStore';
import ImageControls from './ImageControls';

type ImageViewerProps = {
  images: string[];
  studyInfo?: {
    patientName: string;
    modality: string;
    bodyPart: string;
    studyDate: string;
  };
};

const ImageViewer: React.FC<ImageViewerProps> = ({ images, studyInfo }) => {
  const {
    currentImageIndex,
    zoom,
    brightness,
    contrast,
    isInverted,
    layout,
    setCurrentImageIndex,
  } = useViewerStore();

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const getImageStyle = () => {
    return {
      transform: [{ scale: zoom }],
      opacity: 1 + brightness,
      tintColor: isInverted ? 'white' : undefined,
    };
  };

  const renderSingleImage = () => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: images[currentImageIndex] }}
        style={[styles.image, getImageStyle()]}
        contentFit="contain"
        onLoad={({ source: { width, height } }) => {
          setImageSize({ width, height });
        }}
      />
      {images.length > 1 && (
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentImageIndex === 0 && styles.disabledButton]}
            onPress={handlePrevImage}
            disabled={currentImageIndex === 0}
          >
            <ChevronLeft size={24} color={currentImageIndex === 0 ? Colors.mediumGray : Colors.text} />
          </TouchableOpacity>
          <Text style={styles.imageCounter}>
            {currentImageIndex + 1} / {images.length}
          </Text>
          <TouchableOpacity
            style={[styles.navButton, currentImageIndex === images.length - 1 && styles.disabledButton]}
            onPress={handleNextImage}
            disabled={currentImageIndex === images.length - 1}
          >
            <ChevronRight size={24} color={currentImageIndex === images.length - 1 ? Colors.mediumGray : Colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSideBySide = () => (
    <View style={styles.sideBySideContainer}>
      <View style={styles.sideBySideImageContainer}>
        <Image
          source={{ uri: images[Math.max(0, currentImageIndex - 1)] }}
          style={[styles.sideBySideImage, getImageStyle()]}
          contentFit="contain"
        />
      </View>
      <View style={styles.sideBySideImageContainer}>
        <Image
          source={{ uri: images[currentImageIndex] }}
          style={[styles.sideBySideImage, getImageStyle()]}
          contentFit="contain"
        />
      </View>
    </View>
  );

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {[0, 1, 2, 3].map((index) => {
        const imageIndex = currentImageIndex + index;
        if (imageIndex < images.length) {
          return (
            <View key={index} style={styles.gridImageContainer}>
              <Image
                source={{ uri: images[imageIndex] }}
                style={[styles.gridImage, getImageStyle()]}
                contentFit="contain"
              />
            </View>
          );
        }
        return <View key={index} style={styles.gridImageContainer} />;
      })}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {studyInfo && (
        <View style={styles.studyInfoContainer}>
          <Text style={styles.patientName}>{studyInfo.patientName}</Text>
          <Text style={styles.studyDetails}>
            {studyInfo.modality} • {studyInfo.bodyPart} • {studyInfo.studyDate}
          </Text>
        </View>
      )}

      <ImageControls />

      {layout === '1x1' && renderSingleImage()}
      {layout === '1x2' && renderSideBySide()}
      {layout === '2x2' && renderGridView()}

      {imageSize.width > 0 && (
        <View style={styles.imageInfoContainer}>
          <Text style={styles.imageInfo}>
            Image Size: {imageSize.width} x {imageSize.height}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  studyInfoContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    marginBottom: 16,
    borderRadius: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  studyDetails: {
    fontSize: 14,
    color: Colors.subtext,
  },
  imageContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    height: undefined,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  navigationButtons: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  navButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  imageCounter: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginHorizontal: 8,
  },
  imageInfoContainer: {
    padding: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: 16,
  },
  imageInfo: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
  },
  sideBySideContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sideBySideImageContainer: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  sideBySideImage: {
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gridImageContainer: {
    width: '50%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});

export default ImageViewer;