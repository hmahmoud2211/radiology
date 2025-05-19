import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Calendar, Clock, User, FileText, Activity, Eye } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStudiesStore } from '@/store/studiesStore';
import { usePatientStore } from '@/store/patientStore';
import Button from '@/components/shared/Button';

export default function StudyDetailsScreen() {
  const router = useRouter();
  const { selectedStudy } = useStudiesStore();

  if (!selectedStudy) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Study not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const getStatusColor = () => {
    switch (selectedStudy.status) {
      case 'Completed':
        return Colors.success;
      case 'In Progress':
        return Colors.warning;
      case 'Scheduled':
        return Colors.info;
      case 'Cancelled':
        return Colors.error;
      default:
        return Colors.darkGray;
    }
  };

  const getPriorityColor = () => {
    switch (selectedStudy.priority) {
      case 'STAT':
        return Colors.error;
      case 'Routine':
        return Colors.info;
      default:
        return Colors.darkGray;
    }
  };

  const getReportStatusColor = () => {
    switch (selectedStudy.reportStatus) {
      case 'Final':
        return Colors.success;
      case 'Preliminary':
        return Colors.warning;
      case 'Pending':
        return Colors.info;
      default:
        return Colors.darkGray;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.modalityContainer}>
            <Text style={styles.modality}>{selectedStudy.modality}</Text>
            <Text style={styles.bodyPart}>{selectedStudy.bodyPart}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{selectedStudy.status}</Text>
          </View>
        </View>
        <Text style={styles.accessionNumber}>Accession #: {selectedStudy.accessionNumber}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.infoRow}>
          <User size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{selectedStudy.patientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>Study Date: {selectedStudy.studyDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <User size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>Referring Physician: {selectedStudy.referringPhysician}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Details</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Priority</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
              <Text style={styles.priorityText}>{selectedStudy.priority}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Report Status</Text>
            <View style={[styles.reportStatusBadge, { backgroundColor: getReportStatusColor() }]}>
              <Text style={styles.reportStatusText}>{selectedStudy.reportStatus}</Text>
            </View>
          </View>
        </View>
        {selectedStudy.radiologist && (
          <View style={styles.infoRow}>
            <User size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>Radiologist: {selectedStudy.radiologist}</Text>
          </View>
        )}
        {selectedStudy.technologist && (
          <View style={styles.infoRow}>
            <User size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>Technologist: {selectedStudy.technologist}</Text>
          </View>
        )}
        {selectedStudy.reportDate && (
          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>Report Date: {selectedStudy.reportDate}</Text>
          </View>
        )}
      </View>

      {selectedStudy.images && selectedStudy.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <Text style={styles.imageCount}>{selectedStudy.images.length} image(s)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {selectedStudy.images.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => router.push('/viewer')}>
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnail}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            title="View in PACS Viewer"
            onPress={() => router.push('/viewer')}
            icon={<Eye size={18} color="white" />}
            fullWidth
          />
        </View>
      )}

      {(selectedStudy.findings || selectedStudy.impression) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report</Text>
          {selectedStudy.findings && (
            <View style={styles.reportSection}>
              <Text style={styles.reportSectionTitle}>Findings</Text>
              <Text style={styles.reportText}>{selectedStudy.findings}</Text>
            </View>
          )}
          {selectedStudy.impression && (
            <View style={styles.reportSection}>
              <Text style={styles.reportSectionTitle}>Impression</Text>
              <Text style={styles.reportText}>{selectedStudy.impression}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actionsContainer}>
        <Button
          title="Generate Report"
          onPress={() => router.push({
            pathname: '/radiology-report',
            params: { patientId: selectedStudy.patientId, studyId: selectedStudy.id }
          })}
          icon={<FileText size={18} color={Colors.primary} />}
          fullWidth
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="View Patient Record"
          onPress={() => router.push('/patient-details')}
          variant="secondary"
          icon={<User size={18} color="white" />}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modality: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 8,
  },
  bodyPart: {
    fontSize: 16,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  accessionNumber: {
    fontSize: 14,
    color: Colors.subtext,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  reportStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  reportStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageCount: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 8,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  reportSection: {
    marginBottom: 16,
  },
  reportSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  reportText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: 8,
  },
  buttonSpacer: {
    height: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
});