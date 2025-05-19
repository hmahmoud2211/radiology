import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePatientStore } from '@/store/patientStore';
import { useStudiesStore } from '@/store/studiesStore';
import Colors from '@/constants/colors';
import { Eye, FileText } from 'lucide-react-native';

export default function PatientDocumentsPage() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const { patients } = usePatientStore();
  const { studies } = useStudiesStore();

  const patient = useMemo(() => patients.find(p => p.id === patientId), [patients, patientId]);
  const patientStudies = useMemo(() => studies.filter(s => s.patientId === patientId), [studies, patientId]);

  // Helper: Only show medical images (DICOM, PNG, JPG, JPEG)
  const isMedicalImage = (uri: string) => {
    return uri.match(/\.(dcm|dicom|png|jpg|jpeg)$/i);
  };

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholderTitle}>Patient not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>{patient.name}'s Documents</Text>
      {patientStudies.length === 0 && (
        <Text style={styles.placeholderText}>No studies or images found for this patient.</Text>
      )}
      {patientStudies.map(study => (
        <View key={study.id} style={styles.studyCard}>
          <Text style={styles.studyTitle}>{study.modality} - {study.bodyPart} ({study.studyDate})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
            {study.images && study.images.filter(isMedicalImage).map((img: string, idx: number) => (
              <TouchableOpacity key={idx} style={styles.thumbnailWrapper} onPress={() => router.push({ pathname: '/radiology-report', params: { patientId: study.patientId, studyId: study.id } })}>
                <Image source={{ uri: img }} style={styles.thumbnailImg} />
                <Eye size={16} color={Colors.primary} style={{ position: 'absolute', top: 4, right: 4 }} />
              </TouchableOpacity>
            ))}
            {(!study.images || study.images.filter(isMedicalImage).length === 0) && (
              <Text style={styles.noImgText}>No medical images</Text>
            )}
          </ScrollView>
          {study.findings || study.impression ? (
            <View style={styles.reportBox}>
              <Text style={styles.reportTitle}>Report</Text>
              <Text style={styles.reportText}><Text style={{ fontWeight: 'bold' }}>Findings:</Text> {study.findings || '-'}</Text>
              <Text style={styles.reportText}><Text style={{ fontWeight: 'bold' }}>Impression:</Text> {study.impression || '-'}</Text>
            </View>
          ) : (
            <Text style={styles.noReportText}>No report available for this study.</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { padding: 16 },
  header: { fontSize: 22, fontWeight: '700', color: Colors.primary, marginBottom: 16 },
  studyCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2 },
  studyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  imagesRow: { flexDirection: 'row', marginBottom: 8 },
  thumbnailWrapper: { width: 80, height: 80, borderRadius: 8, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: Colors.border, position: 'relative' },
  thumbnailImg: { width: 76, height: 76, borderRadius: 6, resizeMode: 'cover' },
  noImgText: { color: Colors.subtext, fontSize: 12, marginTop: 8 },
  reportBox: { backgroundColor: '#F8F8F8', borderRadius: 8, padding: 12, marginTop: 8 },
  reportTitle: { fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  reportText: { color: Colors.text, fontSize: 14, marginBottom: 2 },
  noReportText: { color: Colors.subtext, fontSize: 13, marginTop: 8 },
  placeholderTitle: { fontSize: 20, fontWeight: '700', color: Colors.subtext, marginBottom: 8, textAlign: 'center' },
  placeholderText: { fontSize: 16, color: Colors.subtext, marginBottom: 18, textAlign: 'center' },
  backButton: { marginTop: 16, alignSelf: 'center', padding: 12, backgroundColor: Colors.primary, borderRadius: 8 },
  backButtonText: { color: 'white', fontWeight: '600' },
}); 