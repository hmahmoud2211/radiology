import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import AppointmentCard from '@/components/shared/AppointmentCard';
import SearchBar from '@/components/shared/SearchBar';
import FilterChip from '@/components/shared/FilterChip';
import Button from '@/components/shared/Button';
import { Appointment } from '@/types';

export default function AllAppointmentsScreen() {
  const router = useRouter();
  const { appointments, fetchAppointments } = usePatientStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Appointment['status'] | 'All'>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'All' | 'Today' | 'Tomorrow' | 'This Week' | 'Next Week'>('All');
  
  const statuses: (Appointment['status'] | 'All')[] = [
    'All',
    'Scheduled',
    'Checked In',
    'In Progress',
    'Completed',
    'Cancelled',
    'No Show',
  ];

  const dateFilters: ('All' | 'Today' | 'Tomorrow' | 'This Week' | 'Next Week')[] = [
    'All',
    'Today',
    'Tomorrow',
    'This Week',
    'Next Week',
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, selectedStatus, selectedDateFilter]);

  const loadData = async () => {
    await fetchAppointments();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    
    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(appointment => appointment.status === selectedStatus);
    }
    
    // Apply date filter
    if (selectedDateFilter !== 'All') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + 7);
      
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 7);
      
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        
        switch (selectedDateFilter) {
          case 'Today':
            return appointmentDate.getTime() === today.getTime();
          case 'Tomorrow':
            return appointmentDate.getTime() === tomorrow.getTime();
          case 'This Week':
            const daysDiff = Math.floor((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff >= 0 && daysDiff < 7;
          case 'Next Week':
            return appointmentDate >= nextWeekStart && appointmentDate < nextWeekEnd;
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        appointment =>
          appointment.patientName.toLowerCase().includes(query) ||
          appointment.testName.toLowerCase().includes(query) ||
          (appointment.notes && appointment.notes.toLowerCase().includes(query))
      );
    }
    
    // Sort by date (soonest first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return dateA - dateB;
    });
    
    setFilteredAppointments(filtered);
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push('/appointment-details');
  };

  const handleStatusFilter = (status: Appointment['status'] | 'All') => {
    setSelectedStatus(status);
  };

  const handleDateFilter = (filter: 'All' | 'Today' | 'Tomorrow' | 'This Week' | 'Next Week') => {
    setSelectedDateFilter(filter);
  };

  const handleScheduleAppointment = () => {
    router.push('/schedule-appointment');
  };

  return (
    <>
      <Stack.Screen options={{ title: "All Appointments" }} />
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by patient, test..."
        />
        
        <Text style={styles.filterLabel}>Filter by Date:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {dateFilters.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              isSelected={selectedDateFilter === filter}
              onPress={() => handleDateFilter(filter)}
            />
          ))}
        </ScrollView>
        
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {statuses.map((status) => (
            <FilterChip
              key={status}
              label={status}
              isSelected={selectedStatus === status}
              onPress={() => handleStatusFilter(status)}
            />
          ))}
        </ScrollView>
        
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.headerRow}>
            <Text style={styles.resultsCount}>{filteredAppointments.length} appointments found</Text>
            <Button
              title="Schedule New"
              onPress={handleScheduleAppointment}
              variant="primary"
              size="small"
              icon={<Calendar size={16} color="white" />}
            />
          </View>
          
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} onPress={handleAppointmentPress} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedStatus !== 'All' || selectedDateFilter !== 'All'
                  ? 'No appointments match your search criteria'
                  : 'No appointments available'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.subtext,
  },
  emptyState: {
    backgroundColor: Colors.lightGray,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
  },
});