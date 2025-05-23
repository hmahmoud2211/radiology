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
  comparisonImageIndex: number;
  overlayMode: boolean;
  overlayOpacity: number;
  layout: '1x1' | '1x2' | '2x2';
  // Synchronized controls
  syncZoom: number;
  syncPan: { x: number; y: number };
  syncWindowLevel: { window: number; level: number };
  
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
  setComparisonMode: (enabled: boolean) => void;
  setComparisonStudyId: (id: string | null) => void;
  setComparisonImageIndex: (index: number) => void;
  setOverlayMode: (enabled: boolean) => void;
  setOverlayOpacity: (opacity: number) => void;
  setLayout: (layout: '1x1' | '1x2' | '2x2') => void;
  setSyncZoom: (zoom: number) => void;
  setSyncPan: (pan: { x: number; y: number }) => void;
  setSyncWindowLevel: (windowLevel: { window: number; level: number }) => void;
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
  comparisonImageIndex: 0,
  overlayMode: false,
  overlayOpacity: 0.5,
  layout: '1x1',
  syncZoom: 1,
  syncPan: { x: 0, y: 0 },
  syncWindowLevel: { window: 400, level: 40 },
  
  setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
  setZoom: (zoom) => set({ zoom, syncZoom: zoom }),
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
  setComparisonMode: (enabled) => set({ isComparisonMode: enabled }),
  setComparisonStudyId: (id) => set({ comparisonStudyId: id }),
  setComparisonImageIndex: (index) => set({ comparisonImageIndex: index }),
  setOverlayMode: (enabled) => set({ overlayMode: enabled }),
  setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
  setLayout: (layout) => set({ layout }),
  setSyncZoom: (zoom) => set({ syncZoom: zoom }),
  setSyncPan: (pan) => set({ syncPan: pan }),
  setSyncWindowLevel: (windowLevel) => set({ syncWindowLevel: windowLevel }),
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
    comparisonImageIndex: 0,
    overlayMode: false,
    overlayOpacity: 0.5,
    layout: '1x1',
    syncZoom: 1,
    syncPan: { x: 0, y: 0 },
    syncWindowLevel: { window: 400, level: 40 },
  }),
}));