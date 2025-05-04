import { create } from 'zustand';
import { Platform } from 'react-native';

interface ViewerState {
  currentImageIndex: number;
  zoom: number;
  brightness: number;
  contrast: number;
  isInverted: boolean;
  isAnnotationMode: boolean;
  isMeasurementMode: boolean;
  currentAnnotationType: 'Arrow' | 'Circle' | 'Rectangle' | 'Text' | 'Freehand';
  currentMeasurementType: 'Distance' | 'Area' | 'Angle' | 'HU' | 'SUV';
  isComparisonMode: boolean;
  comparisonStudyId: string | null;
  layout: '1x1' | '1x2' | '2x2';
  
  // Actions
  setCurrentImageIndex: (index: number) => void;
  setZoom: (zoom: number) => void;
  setBrightness: (brightness: number) => void;
  setContrast: (contrast: number) => void;
  toggleInvert: () => void;
  toggleAnnotationMode: () => void;
  toggleMeasurementMode: () => void;
  setAnnotationType: (type: 'Arrow' | 'Circle' | 'Rectangle' | 'Text' | 'Freehand') => void;
  setMeasurementType: (type: 'Distance' | 'Area' | 'Angle' | 'HU' | 'SUV') => void;
  toggleComparisonMode: () => void;
  setComparisonStudyId: (id: string | null) => void;
  setLayout: (layout: '1x1' | '1x2' | '2x2') => void;
  resetViewerSettings: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  currentImageIndex: 0,
  zoom: 1,
  brightness: 0,
  contrast: 0,
  isInverted: false,
  isAnnotationMode: false,
  isMeasurementMode: false,
  currentAnnotationType: 'Arrow',
  currentMeasurementType: 'Distance',
  isComparisonMode: false,
  comparisonStudyId: null,
  layout: '1x1',
  
  setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
  setZoom: (zoom) => set({ zoom }),
  setBrightness: (brightness) => set({ brightness }),
  setContrast: (contrast) => set({ contrast }),
  toggleInvert: () => set((state) => ({ isInverted: !state.isInverted })),
  toggleAnnotationMode: () => set((state) => ({ 
    isAnnotationMode: !state.isAnnotationMode,
    isMeasurementMode: false, // Turn off measurement mode when annotation mode is toggled on
  })),
  toggleMeasurementMode: () => set((state) => ({ 
    isMeasurementMode: !state.isMeasurementMode,
    isAnnotationMode: false, // Turn off annotation mode when measurement mode is toggled on
  })),
  setAnnotationType: (type) => set({ currentAnnotationType: type }),
  setMeasurementType: (type) => set({ currentMeasurementType: type }),
  toggleComparisonMode: () => set((state) => ({ 
    isComparisonMode: !state.isComparisonMode,
    // Reset comparison study if turning off comparison mode
    comparisonStudyId: state.isComparisonMode ? null : state.comparisonStudyId,
  })),
  setComparisonStudyId: (id) => set({ comparisonStudyId: id }),
  setLayout: (layout) => set({ layout }),
  resetViewerSettings: () => set({
    zoom: 1,
    brightness: 0,
    contrast: 0,
    isInverted: false,
    isAnnotationMode: false,
    isMeasurementMode: false,
    currentAnnotationType: 'Arrow',
    currentMeasurementType: 'Distance',
    isComparisonMode: false,
    comparisonStudyId: null,
    layout: '1x1',
  }),
}));