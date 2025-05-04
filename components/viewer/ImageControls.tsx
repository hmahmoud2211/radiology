import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ZoomIn, ZoomOut, Sun, Moon, Contrast, Undo, Layout, Pencil, Ruler } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useViewerStore } from '@/store/viewerStore';

const ImageControls: React.FC = () => {
  const {
    zoom,
    brightness,
    contrast,
    isInverted,
    isAnnotationMode,
    isMeasurementMode,
    layout,
    setZoom,
    setBrightness,
    setContrast,
    toggleInvert,
    toggleAnnotationMode,
    toggleMeasurementMode,
    setLayout,
    resetViewerSettings,
  } = useViewerStore();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5));
  };

  const handleBrightnessUp = () => {
    setBrightness(Math.min(brightness + 0.1, 1));
  };

  const handleBrightnessDown = () => {
    setBrightness(Math.max(brightness - 0.1, -1));
  };

  const handleContrastUp = () => {
    setContrast(Math.min(contrast + 0.1, 1));
  };

  const handleContrastDown = () => {
    setContrast(Math.max(contrast - 0.1, -1));
  };

  const handleLayoutChange = () => {
    if (layout === '1x1') {
      setLayout('1x2');
    } else if (layout === '1x2') {
      setLayout('2x2');
    } else {
      setLayout('1x1');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlGroup}>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
          <ZoomIn size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.controlValue}>{zoom.toFixed(1)}x</Text>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
          <ZoomOut size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.controlGroup}>
        <TouchableOpacity style={styles.controlButton} onPress={handleBrightnessUp}>
          <Sun size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.controlValue}>{(brightness * 100).toFixed(0)}%</Text>
        <TouchableOpacity style={styles.controlButton} onPress={handleBrightnessDown}>
          <Moon size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.controlGroup}>
        <TouchableOpacity style={styles.controlButton} onPress={handleContrastUp}>
          <Contrast size={20} color={Colors.text} />
          <Text style={styles.smallText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.controlValue}>{(contrast * 100).toFixed(0)}%</Text>
        <TouchableOpacity style={styles.controlButton} onPress={handleContrastDown}>
          <Contrast size={20} color={Colors.text} />
          <Text style={styles.smallText}>-</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.toolButton, isInverted && styles.activeToolButton]} 
          onPress={toggleInvert}
        >
          <Moon size={20} color={isInverted ? 'white' : Colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isAnnotationMode && styles.activeToolButton]} 
          onPress={toggleAnnotationMode}
        >
          <Pencil size={20} color={isAnnotationMode ? 'white' : Colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isMeasurementMode && styles.activeToolButton]} 
          onPress={toggleMeasurementMode}
        >
          <Ruler size={20} color={isMeasurementMode ? 'white' : Colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={handleLayoutChange}>
          <Layout size={20} color={Colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={resetViewerSettings}>
          <Undo size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  controlButton: {
    padding: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  controlValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    width: 50,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toolButton: {
    padding: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeToolButton: {
    backgroundColor: Colors.primary,
  },
  smallText: {
    fontSize: 10,
    position: 'absolute',
    bottom: 4,
    right: 4,
    color: Colors.text,
  },
});

export default ImageControls;