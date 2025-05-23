import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert, Share, KeyboardAvoidingView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, ChevronDown, ChevronUp, Printer, Download, Eye, Save, Upload } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { useStudiesStore } from '@/store/studiesStore';
import Button from '@/components/shared/Button';
import { Patient, Study } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import ICD11AutocompleteInput from '@/components/shared/ICD11AutocompleteInput';
import PatientInfoSection from '../components/shared/PatientInfoSection';
import ExaminationDetailsSection from '../components/shared/ExaminationDetailsSection';
import TechniqueSection from '../components/shared/TechniqueSection';
import FindingsSection from '../components/shared/FindingsSection';
import ImpressionSection from '../components/shared/ImpressionSection';
import RecommendationsSection from '../components/shared/RecommendationsSection';
import RadiologistInfoSection from '../components/shared/RadiologistInfoSection';

// Simulate DICOM/media upload (replace with real logic as needed)
type DicomUploaderProps = {
  images: string[];
  onUpload: () => void;
  onView: (uri: string) => void;
};
function DicomUploader({ images, onUpload, onView }: DicomUploaderProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>DICOM/Media Attachments</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
        {images && images.map((img: string, idx: number) => (
          <TouchableOpacity key={idx} style={styles.thumbnailWrapper} onPress={() => onView(img)}>
            <Eye size={18} color={Colors.primary} />
            <Text style={styles.thumbnailText}>View</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.uploadButton} onPress={onUpload}>
          <Upload size={24} color={Colors.primary} />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function RadiologyReportPage() {
  const router = useRouter();
  const { patientId, studyId } = useLocalSearchParams();
  const { patients } = usePatientStore();
  const { studies, updateStudy } = useStudiesStore();
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [showFindings, setShowFindings] = useState(true);
  const [showImpression, setShowImpression] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [error, setError] = useState('');
  const autosaveTimer = useRef<number | undefined>(undefined);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [downloadImgLoading, setDownloadImgLoading] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerUri, setImageViewerUri] = useState<string | null>(null);
  const [signatureUri, setSignatureUri] = useState<string | null>(null);

  // Find patient and study
  const patient: Patient | undefined = useMemo(() => patients.find(p => p.id === patientId), [patients, patientId]);
  const study: Study | undefined = useMemo(() => studies.find(s => s.id === studyId), [studies, studyId]);

  // Editable form state
  const [form, setForm] = useState({
    clinicalIndication: study?.specialInstructions || '',
    modality: study?.modality || '',
    contrast: study?.contrastRequired ? 'Yes' : 'No',
    bodyRegion: study?.bodyPart || '',
    protocol: study?.specialInstructions || '',
    findings: study?.findings || '',
    impression: study?.impression || '',
    radiologist: study?.radiologist || '',
    reportDate: study?.reportDate || '',
    signature: '',
    images: study?.images || [],
    recommendations: '',
  });

  // Autosave draft on form change
  useEffect(() => {
    if (!study) return;
    setIsDraft(true);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      handleSaveDraft();
    }, 1500);
    return () => clearTimeout(autosaveTimer.current);
  }, [form]);

  const handleInput = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    if (!study) return;
    setIsSaving(true);
    await updateStudy(study.id, {
      ...study,
      findings: form.findings,
      impression: form.impression,
      radiologist: form.radiologist,
      reportDate: form.reportDate,
      images: form.images,
    });
    setIsSaving(false);
    setIsDraft(false);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.findings.trim() || !form.impression.trim()) {
      setError('Findings and Impression are required.');
      return;
    }
    if (!study) return;
    setIsSaving(true);
    await updateStudy(study.id, {
      ...study,
      findings: form.findings,
      impression: form.impression,
      radiologist: form.radiologist,
      reportDate: new Date().toISOString().split('T')[0],
      reportStatus: 'Final',
      images: form.images,
    });
    setIsSaving(false);
    setIsDraft(false);
    Alert.alert('Success', 'Report submitted successfully.');
  };

  const handlePrint = () => {
    Alert.alert('Print', 'Print functionality will be implemented');
  };
  const handleDownload = () => {
    Alert.alert('Download', 'Download functionality will be implemented');
  };
  const handleDicomUpload = () => {
    Alert.alert('Upload', 'DICOM/media upload functionality will be implemented');
  };

  // Helper: Only show medical images (DICOM, PNG, JPG, JPEG)
  const isMedicalImage = (uri: string) => {
    return uri.match(/\.(dcm|dicom|png|jpg|jpeg)$/i);
  };

  const handleAIGenerate = async () => {
    setAiError('');
    const medicalImages = form.images.filter(isMedicalImage);
    if (!medicalImages || medicalImages.length === 0) {
      Alert.alert('No image', 'Attach a medical image (DICOM, PNG, JPG) to use AI impression.');
      return;
    }
    const uri = medicalImages[0];
    let base64 = '';
    try {
      if (uri.startsWith('data:')) {
        base64 = uri.split(',')[1];
      } else {
        base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      }
      setAiLoading(true);
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `image_base64=${encodeURIComponent(base64)}`,
      });
      const data = await res.json();
      if (data.caption) {
        setForm(prev => ({ ...prev, impression: data.caption }));
      } else {
        setAiError(data.error || 'No caption returned');
        Alert.alert('AI Error', data.error || 'No caption returned');
      }
    } catch (e: any) {
      setAiError(e.message);
      Alert.alert('AI Error', e.message);
    }
    setAiLoading(false);
  };

  const generateReportHtml = () => {
    return `
      <html><body style="font-family: Arial, sans-serif;">
        <h2>Radiology Report</h2>
        <h3>${patient?.name || '-'}</h3>
        <p><b>ID/MRN:</b> ${patient?.patientId || '-'}<br/>
        <b>Referring Physician:</b> ${study?.referringPhysician || '-'}<br/>
        <b>Age:</b> ${patient?.age || '-'}<br/>
        <b>Gender:</b> ${patient?.gender || '-'}<br/>
        <b>Scan Type:</b> ${(study?.modality || '-') + ' ' + (study?.bodyPart || '-') }<br/>
        <b>Date of Scan:</b> ${study?.studyDate || '-'}<br/>
        <b>Machine/Room:</b> ${study?.room || 'N/A'}</p>
        <h4>Clinical Indication</h4>
        <p>${form.clinicalIndication || '-'}</p>
        <h4>Examination Details</h4>
        <p><b>Modality:</b> ${form.modality}<br/>
        <b>Contrast:</b> ${form.contrast}<br/>
        <b>Body Region:</b> ${form.bodyRegion}<br/>
        <b>Protocol:</b> ${form.protocol}</p>
        <h4>Findings</h4>
        <p>${form.findings || '-'}</p>
        <h4>Impression</h4>
        <p>${form.impression || '-'}</p>
        <h4>Radiologist Info</h4>
        <p><b>Name:</b> ${form.radiologist}<br/>
        <b>Date:</b> ${form.reportDate}</p>
      </body></html>
    `;
  };

  const handleGenerateReport = async () => {
    setPdfLoading(true);
    try {
      const html = generateReportHtml();
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setPdfLoading(false);
  };

  const handlePrintReport = async () => {
    setPrintLoading(true);
    try {
      const html = generateReportHtml();
      await Print.printAsync({ html });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setPrintLoading(false);
  };

  const handleDownloadImage = async () => {
    setDownloadImgLoading(true);
    try {
      const medicalImages = form.images.filter(isMedicalImage);
      if (!medicalImages || medicalImages.length === 0) {
        Alert.alert('No image', 'No medical image to download.');
        setDownloadImgLoading(false);
        return;
      }
      const uri = medicalImages[0];
      let assetUri = uri;
      if (uri.startsWith('http')) {
        // Download remote image
        const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
        const fileUri = docDir + uri.split('/').pop();
        const downloadRes = await FileSystem.downloadAsync(uri, fileUri);
        assetUri = downloadRes.uri;
      }
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Cannot save image without permission.');
        setDownloadImgLoading(false);
        return;
      }
      await MediaLibrary.saveToLibraryAsync(assetUri);
      Alert.alert('Success', 'Image saved to gallery.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setDownloadImgLoading(false);
  };

  // Image upload handler
  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Cannot access media library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setForm(prev => ({ ...prev, images: [...(prev.images || []), uri] }));
    }
  };

  // Image viewer handler
  const handleViewImage = (uri: string) => {
    setImageViewerUri(uri);
    setImageViewerVisible(true);
  };
  const handleCloseImageViewer = () => {
    setImageViewerVisible(false);
    setImageViewerUri(null);
  };

  const handleUploadSignature = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Cannot access media library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSignatureUri(result.assets[0].uri);
    }
  };

  if (!patient && !study) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholderTitle}>No report available</Text>
        <Text style={styles.placeholderText}>The radiology report for this patient/study is not yet available.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  // Always show the formatted report if either patient or study exists
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 320 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={styles.headerActions}>
            <Button title="Download PDF" icon={<Download size={18} color="white" />} onPress={handleGenerateReport} loading={pdfLoading} size="small" />
            <Button title="Save/Submit" icon={<Save size={18} color="white" />} onPress={handleSubmit} loading={isSaving} size="small" />
            <Button title="AI Generate First Impression" icon={<FileText size={18} color="white" />} onPress={handleAIGenerate} loading={aiLoading} size="small" />
            <Button title="Generate Report" icon={<FileText size={18} color="white" />} onPress={handleGenerateReport} loading={pdfLoading} size="small" />
            <Button title="Print Report" icon={<Printer size={18} color="white" />} onPress={handlePrintReport} loading={printLoading} size="small" />
          </View>
        </ScrollView>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {isDraft && <Text style={styles.draftText}>Draft saved...</Text>}
        {aiError ? <Text style={styles.errorText}>{aiError}</Text> : null}
        {/* Patient & Scan Info */}
        <PatientInfoSection patient={patient || { id: '', name: '-', age: 0, gender: 'Other', dob: '-', patientId: '-', contactNumber: '-', email: '', address: '', insuranceInfo: '', medicalHistory: '', allergies: [], lastVisit: '', upcomingAppointment: '' }} />
        <ExaminationDetailsSection study={study || { id: '', patientId: '', patientName: '-', studyDate: '-', modality: 'X-Ray', bodyPart: '-', accessionNumber: '-', referringPhysician: '-', status: 'Scheduled', reportStatus: 'Pending' }} />
        <TechniqueSection
          modality={form.modality}
          value={form.protocol}
          onChange={v => handleInput('protocol', v)}
        />
        <FindingsSection
          scanType={form.modality}
          value={form.findings}
          onSelect={(entry: any) => {
            if (typeof entry === 'string') handleInput('findings', entry);
            else handleInput('findings', `${entry.code} - ${entry.name}: ${entry.description}`);
          }}
        />
        <ImpressionSection
          value={form.impression}
          onSelect={(entry: any) => {
            if (typeof entry === 'string') handleInput('impression', entry);
            else handleInput('impression', `${entry.code} - ${entry.name}: ${entry.description}`);
          }}
        />
        <RecommendationsSection
          value={form.recommendations}
          onChange={(v: string) => handleInput('recommendations', v)}
        />
        <RadiologistInfoSection
          radiologist={form.radiologist}
          date={form.reportDate}
          signatureUri={signatureUri}
          onRadiologistChange={(v: string) => handleInput('radiologist', v)}
          onDateChange={(v: string) => handleInput('reportDate', v)}
          onUploadSignature={handleUploadSignature}
        />
        {/* DICOM/Media Attachments */}
        <DicomUploader images={form.images.filter(isMedicalImage)} onUpload={handleImageUpload} onView={handleViewImage} />
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <TouchableOpacity onPress={handleDownloadImage} disabled={downloadImgLoading} style={{ padding: 16 }}>
            <Download size={32} color={downloadImgLoading ? Colors.mediumGray : Colors.primary} />
            <Text style={{ color: Colors.primary, marginTop: 4 }}>Download Image</Text>
          </TouchableOpacity>
        </View>
        {/* Image Viewer Modal */}
        {imageViewerVisible && imageViewerUri && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 101 }} onPress={handleCloseImageViewer}>
              <Text style={{ color: 'white', fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: imageViewerUri }}
              style={{ width: '90%', height: '70%', resizeMode: 'contain' }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: 16 },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  patientName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  infoStack: {
    marginTop: 8,
  },
  infoRowStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabelStack: {
    fontWeight: '700',
    color: Colors.text,
    width: 140,
    fontSize: 16,
  },
  infoValueStack: {
    color: Colors.text,
    fontSize: 16,
    flex: 1,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  findingsText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  impressionSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  collapseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 0,
  },
  collapseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.subtext,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 18,
    textAlign: 'center',
  },
  draftText: {
    fontSize: 14,
    color: Colors.warning,
    marginBottom: 8,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  thumbnailWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnailText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  uploadButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  uploadText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  signatureText: {
    marginLeft: 8,
    color: Colors.primary,
    fontWeight: '600',
  },
}); 