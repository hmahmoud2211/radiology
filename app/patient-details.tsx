import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Phone, Mail, MapPin, FileText, Plus, Edit, AlertTriangle, Activity, Clock, User, Syringe, Baby, Moon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { useStudiesStore } from '@/store/studiesStore';
import StudyCard from '@/components/shared/StudyCard';
import AppointmentCard from '@/components/shared/AppointmentCard';
import Button from '@/components/shared/Button';
import { Study, Appointment } from '@/types';

export default function PatientDetailsScreen() {
  const router = useRouter();
  const { selectedPatient, getPatientAppointments } = usePatientStore();
  const { studies, getPatientStudies, selectStudy } = useStudiesStore();
  
  const [patientStudies, setPatientStudies] = useState<Study[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (selectedPatient) {
      const fetchedStudies = getPatientStudies(selectedPatient.id);
      setPatientStudies(fetchedStudies);
      
      const fetchedAppointments = getPatientAppointments(selectedPatient.id);
      setPatientAppointments(fetchedAppointments);
    }
  }, [selectedPatient, studies]);

  if (!selectedPatient) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Patient not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleStudyPress = (study: Study) => {
    selectStudy(study.id);
    router.push('/study-details');
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push({
      pathname: '/appointment-details',
      params: { appointmentId: appointment.id }
    });
  };

  const upcomingStudies = patientStudies.filter(study => 
    new Date(study.studyDate) >= new Date() || study.status === 'In Progress'
  );

  const pastStudies = patientStudies.filter(study => 
    new Date(study.studyDate) < new Date() && study.status !== 'In Progress'
  );

  const hasContrastAllergy = selectedPatient.allergies?.some(allergy => 
    allergy.toLowerCase().includes('contrast') || 
    allergy.toLowerCase().includes('iodine')
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Patient Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.patientName}>{selectedPatient.name}</Text>
            <Text style={styles.patientId}>{selectedPatient.patientId}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push({
            pathname: '/new-patient',
            params: { patientId: selectedPatient.id }
          })}>
            <Edit size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.demographicsContainer}>
          <Text style={styles.demographics}>
            {selectedPatient.age} years • {selectedPatient.gender} • DOB: {selectedPatient.dob}
          </Text>
        </View>
      </View>

      {/* Critical Information Banner */}
      {(hasContrastAllergy || selectedPatient.age < 18) && (
        <View style={styles.criticalInfoBanner}>
          {hasContrastAllergy && (
            <View style={styles.criticalInfoItem}>
              <AlertTriangle size={16} color={Colors.error} />
              <Text style={styles.criticalInfoText}>Contrast Allergy</Text>
            </View>
          )}
          {selectedPatient.age < 18 && (
            <View style={styles.criticalInfoItem}>
              <Baby size={16} color={Colors.warning} />
              <Text style={styles.criticalInfoText}>Pediatric Patient</Text>
            </View>
          )}
        </View>
      )}

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Phone size={16} color={Colors.darkGray} />
          <Text style={styles.infoText}>{selectedPatient.contactNumber}</Text>
        </View>
        {selectedPatient.email && (
          <View style={styles.infoRow}>
            <Mail size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>{selectedPatient.email}</Text>
          </View>
        )}
        {selectedPatient.address && (
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.darkGray} />
            <Text style={styles.infoText}>{selectedPatient.address}</Text>
          </View>
        )}
      </View>

      {/* Medical Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Information</Text>
        {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
          <View style={styles.medicalInfoRow}>
            <Text style={styles.medicalInfoLabel}>Allergies:</Text>
            <Text style={[styles.medicalInfoText, styles.allergiesText]}>
              {selectedPatient.allergies.join(', ')}
            </Text>
          </View>
        )}
        {selectedPatient.medicalHistory && (
          <View style={styles.medicalInfoRow}>
            <Text style={styles.medicalInfoLabel}>Medical History:</Text>
            <Text style={styles.medicalInfoText}>{selectedPatient.medicalHistory}</Text>
          </View>
        )}
        {selectedPatient.insuranceInfo && (
          <View style={styles.medicalInfoRow}>
            <Text style={styles.medicalInfoLabel}>Insurance:</Text>
            <Text style={styles.medicalInfoText}>{selectedPatient.insuranceInfo}</Text>
          </View>
        )}
      </View>

      {/* Imaging Studies Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Imaging Studies</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push({
            pathname: '/all-studies',
            params: { patientId: selectedPatient.id }
          })}>
            <Plus size={16} color={Colors.primary} />
            <Text style={styles.addButtonText}>All Studies</Text>
          </TouchableOpacity>
        </View>

        {/* Study Type Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming/Current
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              Past Studies
            </Text>
          </TouchableOpacity>
        </View>

        {/* Studies List */}
        {activeTab === 'upcoming' ? (
          upcomingStudies.length > 0 ? (
            upcomingStudies.map((study) => (
              <StudyCard key={study.id} study={study} onPress={handleStudyPress} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming studies</Text>
            </View>
          )
        ) : (
          pastStudies.length > 0 ? (
            pastStudies.map((study) => (
              <StudyCard key={study.id} study={study} onPress={handleStudyPress} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No past studies</Text>
            </View>
          )
        )}
      </View>

      {/* Appointments Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Radiology Appointments</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/schedule-appointment')}>
            <Plus size={16} color={Colors.primary} />
            <Text style={styles.addButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {patientAppointments.length > 0 ? (
          patientAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} onPress={handleAppointmentPress} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No appointments scheduled</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <View style={styles.buttonSpacer} />
        <Button
          title="Schedule New Appointment"
          onPress={() => router.push('/schedule-appointment')}
          icon={<Calendar size={18} color="white" />}
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: Colors.subtext,
  },
  editButton: {
    padding: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  demographicsContainer: {
    backgroundColor: Colors.lightGray,
    padding: 8,
    borderRadius: 4,
  },
  demographics: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  criticalInfoBanner: {
    backgroundColor: Colors.warningLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  criticalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criticalInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.warning,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  medicalInfoRow: {
    marginBottom: 8,
  },
  medicalInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  medicalInfoText: {
    fontSize: 14,
    color: Colors.text,
  },
  allergiesText: {
    color: Colors.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  emptyState: {
    backgroundColor: Colors.lightGray,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
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