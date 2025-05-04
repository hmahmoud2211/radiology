import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Calendar, Clock, Activity, FileText, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { useStudiesStore } from '@/store/studiesStore';
import MetricCard from '@/components/shared/MetricCard';
import StudyCard from '@/components/shared/StudyCard';
import AppointmentCard from '@/components/shared/AppointmentCard';
import { dashboardMetrics } from '@/mocks/metrics';
import { Study, Appointment } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { fetchPatients } = usePatientStore();
  const { studies, fetchStudies, selectStudy } = useStudiesStore();
  const { appointments, fetchAppointments } = usePatientStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [recentStudies, setRecentStudies] = useState<Study[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (studies.length > 0) {
      // Sort studies by date (newest first) and take the first 5
      const sorted = [...studies]
        .sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime())
        .slice(0, 5);
      setRecentStudies(sorted);
    }
  }, [studies]);

  useEffect(() => {
    if (appointments.length > 0) {
      // Sort appointments by date (soonest first) and take the first 3
      const sorted = [...appointments]
        .filter(a => a.status === 'Scheduled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setUpcomingAppointments(sorted);
    }
  }, [appointments]);

  const loadData = async () => {
    await Promise.all([
      fetchPatients(),
      fetchStudies(),
      fetchAppointments(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStudyPress = (study: Study) => {
    selectStudy(study.id);
    router.push('/study-details');
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push('/appointment-details');
  };

  const handleScheduleAppointment = () => {
    router.push('/schedule-appointment');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Radiology Dashboard</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      <View style={styles.metricsContainer}>
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            icon={
              metric.icon === 'activity' ? <Activity size={20} color={Colors.primary} /> :
              metric.icon === 'clipboard' ? <FileText size={20} color={Colors.primary} /> :
              metric.icon === 'clock' ? <Clock size={20} color={Colors.primary} /> :
              metric.icon === 'calendar' ? <Calendar size={20} color={Colors.primary} /> :
              <Activity size={20} color={Colors.primary} />
            }
          />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Studies</Text>
        <TouchableOpacity onPress={() => router.push('/all-studies')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentStudies.length > 0 ? (
        recentStudies.map((study) => (
          <StudyCard key={study.id} study={study} onPress={handleStudyPress} />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recent studies</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <TouchableOpacity onPress={() => router.push('/all-appointments')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {upcomingAppointments.length > 0 ? (
        upcomingAppointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} onPress={handleAppointmentPress} />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No upcoming appointments</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.scheduleButton} 
        onPress={handleScheduleAppointment}
      >
        <Calendar size={20} color="white" />
        <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/new-study')}>
        <Plus size={24} color="white" />
      </TouchableOpacity>
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
    paddingBottom: 80,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.subtext,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: Colors.lightGray,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.subtext,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});