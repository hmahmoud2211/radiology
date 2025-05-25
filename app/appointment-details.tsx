import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { Calendar, Clock, User, FileText, CheckCircle2 } from 'lucide-react-native';
import Colors from '../constants/colors';
import { usePatientStore } from '../store/patientStore';
import { useChecklistStore } from '../store/checklistStore';
import { useAuthStore } from '../store/authStore';
import Button from '../components/shared/Button';
import ChecklistItem from '../components/checklist/ChecklistItem';
import { Appointment } from '../types';

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams();
  const { appointments, updateAppointment, fetchAppointments } = usePatientStore();
  const { currentUser } = useAuthStore();
  const {
    currentChecklist,
    startChecklist,
    updateChecklistItem,
    completeChecklist,
    validateChecklist,
  } = useChecklistStore();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch appointments when the screen loads
    fetchAppointments();
  }, []);

  useEffect(() => {
    console.log('Appointment ID:', appointmentId);
    console.log('Available appointments:', appointments);
    
    if (appointmentId) {
      const foundAppointment = appointments.find((a: Appointment) => a.id === appointmentId);
      console.log('Found appointment:', foundAppointment);
      
      if (foundAppointment) {
        setAppointment(foundAppointment);
        // Start checklist if not already started
        if (!currentChecklist) {
          startChecklist(foundAppointment.patientId, foundAppointment.testId ?? '', currentUser?.id || '');
        }
      }
    }
  }, [appointmentId, appointments, currentChecklist]);

  const handleCheckIn = () => {
    if (!appointment) return;
    setIsLoading(true);
    try {
      updateAppointment(appointment.id, { status: 'Checked In' });
      setAppointment({ ...appointment, status: 'Checked In' });
    } catch (error) {
      Alert.alert('Error', 'Failed to check in patient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStudy = () => {
    if (!appointment) return;
    setIsLoading(true);
    try {
      updateAppointment(appointment.id, { status: 'In Progress' });
      setAppointment({ ...appointment, status: 'In Progress' });
    } catch (error) {
      Alert.alert('Error', 'Failed to start study');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteStudy = () => {
    if (!appointment || !currentChecklist) return;

    const validationResult = validateChecklist(currentChecklist);
    if (!validationResult.isValid) {
      Alert.alert(
        'Cannot Complete Study',
        `Please address the following issues:\n${validationResult.errors.join('\n')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Complete Study',
      'Are you sure you want to complete this study? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setIsLoading(true);
            try {
              await completeChecklist(currentChecklist.id, currentUser?.id || '');
              updateAppointment(appointment.id, { status: 'Completed' });
              setAppointment({ ...appointment, status: 'Completed' });
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to complete study');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    if (!appointment) return;
    router.push({ pathname: '/schedule-appointment', params: { appointmentId: appointment.id } });
  };

  const handleCancel = () => {
    if (!appointment) return;
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await updateAppointment(appointment.id, { status: 'Cancelled' });
              setAppointment({ ...appointment, status: 'Cancelled' });
              Alert.alert('Cancelled', 'Appointment has been cancelled.');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewHistory = () => {
    if (!appointment) return;
    router.push({ pathname: '/patient-documents', params: { patientId: appointment.patientId } });
  };

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Appointment not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Appointment Details" }} />
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.testName}>{appointment.testName ?? ''}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
              <Text style={styles.statusText}>{appointment.status}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={Colors.darkGray} />
              <Text style={styles.infoText}>{appointment.patientName ?? ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={20} color={Colors.darkGray} />
              <Text style={styles.infoText}>{appointment.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={20} color={Colors.darkGray} />
              <Text style={styles.infoText}>{appointment.time}</Text>
            </View>
            {appointment.notes && (
              <View style={styles.infoRow}>
                <FileText size={20} color={Colors.darkGray} />
                <Text style={styles.infoText}>{appointment.notes}</Text>
              </View>
            )}
          </View>

          {appointment.status !== 'Completed' && currentChecklist && (
            <View style={styles.checklistSection}>
              <Text style={styles.sectionTitle}>Pre-Study Checklist</Text>
              <Text style={styles.sectionDescription}>
                Complete all required items before starting the study
              </Text>
              
              {currentChecklist.items.map((item: any) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  onUpdate={(updates) =>
                    updateChecklistItem(currentChecklist.id, item.id, updates)
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {appointment.status === 'Scheduled' && (
            <Button
              title="Check In Patient"
              onPress={handleCheckIn}
              loading={isLoading}
              fullWidth
            />
          )}
          {appointment.status === 'Checked In' && (
            <Button
              title="Start Study"
              onPress={handleStartStudy}
              loading={isLoading}
              fullWidth
            />
          )}
          {appointment.status === 'In Progress' && (
            <Button
              title="Complete Study"
              onPress={handleCompleteStudy}
              loading={isLoading}
              variant="primary"
              icon={<CheckCircle2 size={20} color="white" />}
              fullWidth
            />
          )}
          <View style={{ marginBottom: 8 }}>
            <Button
              title="Reschedule"
              onPress={handleReschedule}
              variant="primary"
              fullWidth
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Button
              title="Cancel Appointment"
              onPress={handleCancel}
              variant="danger"
              fullWidth
            />
          </View>
          <Button
            title="View History"
            onPress={handleViewHistory}
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </>
  );
}

const getStatusColor = (status: Appointment['status']) => {
  switch (status) {
    case 'Completed':
      return Colors.success;
    case 'In Progress':
      return Colors.warning;
    case 'Scheduled':
      return Colors.info;
    case 'Checked In':
      return Colors.primary;
    case 'Cancelled':
      return Colors.error;
    case 'No Show':
      return Colors.error;
    default:
      return Colors.darkGray;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  testName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  checklistSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
}); 