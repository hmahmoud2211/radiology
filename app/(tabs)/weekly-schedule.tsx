import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { usePatientStore } from '../../store/patientStore';
import Button from '../../components/shared/Button';
import { Appointment } from '../../types';
import { radiologyTests as tests } from '../../mocks/tests';

// Constants for time slots (8 AM to 8 PM, 30-min intervals)
export const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const min = i % 2 === 0 ? '00' : '30';
  const ampm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${min} ${ampm}`;
});

const SCAN_TYPE_COLORS: Record<string, string> = {
  'CT': '#34C759',
  'Ultrasound': '#A259F7',
  'X-Ray': '#3B82F6',
  'PET': '#FF9500',
  'Mammography': '#FF69B4',
  'MRI': '#FF6B6B',
  'Other': '#FFD166',
};

const SCAN_TYPES = ['All', 'MRI', 'CT', 'X-Ray', 'Ultrasound', 'PET', 'Mammography'];
const MACHINES = ['All', 'Machine 1', 'Machine 2'];
const ROOMS = ['All', 'Room 1', 'Room 2', 'Room 3'];
const TECHNICIANS = ['All', 'Dr. Smith', 'Dr. Lee', 'Dr. Patel'];

function getScanColor(type: string): string {
  return SCAN_TYPE_COLORS[type] || SCAN_TYPE_COLORS['Other'];
}

function getModalityByTestId(testId: string): string {
  const test = tests.find((t: any) => t.id === testId);
  return test ? test.modality : 'Other';
}

interface SimpleDropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

function SimpleDropdown({ label, value, options, onSelect }: SimpleDropdownProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginRight: 12, minWidth: 110 }}>
      <TouchableOpacity
        style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 8, backgroundColor: Colors.white }}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 13, color: Colors.subtext }}>{label}</Text>
        <Text style={{ fontWeight: '600', color: Colors.text }}>{value}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ position: 'absolute', top: 48, left: 0, right: 0, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, zIndex: 10 }}>
          {options.map(opt => (
            <TouchableOpacity key={opt} onPress={() => { setOpen(false); onSelect(opt); }} style={{ padding: 10, backgroundColor: value === opt ? Colors.primaryLight : Colors.white }}>
              <Text style={{ color: value === opt ? Colors.primary : Colors.text }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function getDurationMinutes(app: Appointment): number {
  return 30; // Default duration
}

function getSlotCount(app: Appointment): number {
  return Math.max(1, Math.round(getDurationMinutes(app) / 30));
}

export default function WeeklyScheduleScreen() {
  const router = useRouter();
  const { appointments, fetchAppointments, deleteAppointment, updateAppointment } = usePatientStore();

  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedScanType, setSelectedScanType] = useState('All');
  const [selectedMachine, setSelectedMachine] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedTechnician, setSelectedTechnician] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');

  useEffect(() => {
    const generateWeekDates = (date: Date) => {
      const weekDates: Date[] = [];
      const currentDay = date.getDay();
      const startDate = new Date(date);
      startDate.setDate(date.getDate() - currentDay);
      for (let i = 0; i < 7; i++) {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + i);
        weekDates.push(newDate);
      }
      return weekDates;
    };
    setCurrentWeek(generateWeekDates(selectedDate));
  }, [selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
    }, [])
  );

  if (!currentWeek || currentWeek.length < 7) return null;

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const formatDay = (date: Date): string =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const filteredAppointments = appointments.filter((a: Appointment) => {
    if (selectedScanType !== 'All' && !(a.testName ?? '').includes(selectedScanType)) return false;
    if (selectedMachine !== 'All' && a.notes !== selectedMachine) return false;
    if (selectedRoom !== 'All' && a.notes !== selectedRoom) return false;
    if (selectedTechnician !== 'All' && a.notes !== selectedTechnician) return false;
    return true;
  });

  const grid: (Appointment | null)[][] = Array(7).fill(null).map(() => Array(TIME_SLOTS.length).fill(null));
  filteredAppointments.forEach((app: Appointment) => {
    const dayIdx = currentWeek.findIndex(d =>
      new Date(app.date).getDate() === d.getDate() &&
      new Date(app.date).getMonth() === d.getMonth() &&
      new Date(app.date).getFullYear() === d.getFullYear()
    );
    if (dayIdx === -1) return;
    const timeIdx = TIME_SLOTS.findIndex(t => t === app.time);
    if (timeIdx === -1) return;
    grid[dayIdx][timeIdx] = app;
  });

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const dayColWidth = Math.max(120, Math.floor((screenWidth - 60) / 7));
  const timeColWidth = 60;
  const slotHeight = Math.max(48, Math.floor((screenHeight - 250) / TIME_SLOTS.length));

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, backgroundColor: Colors.background, flexWrap: 'wrap' }}>
        {Object.entries(SCAN_TYPE_COLORS).map(([type, color]) => (
          <View key={type} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14, marginBottom: 2 }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, marginRight: 5, borderWidth: 1, borderColor: Colors.border }} />
            <Text style={{ fontSize: 12, color: Colors.text }}>{type}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, zIndex: 20 }}>
        <SimpleDropdown label="Scan Type" value={selectedScanType} options={SCAN_TYPES} onSelect={setSelectedScanType} />
        <SimpleDropdown label="Room" value={selectedRoom} options={ROOMS} onSelect={setSelectedRoom} />
        <SimpleDropdown label="Machine" value={selectedMachine} options={MACHINES} onSelect={setSelectedMachine} />
        <SimpleDropdown label="Technician" value={selectedTechnician} options={TECHNICIANS} onSelect={setSelectedTechnician} />
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={handlePreviousWeek} style={styles.arrowBtn}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.weekLabel}>
            {formatDay(currentWeek[0])} - {formatDay(currentWeek[6])}
          </Text>
          <TouchableOpacity onPress={handleNextWeek} style={styles.arrowBtn}>
            <ChevronRight size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal style={{ flex: 1 }} contentContainerStyle={{ minWidth: 900 }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={[styles.gridRow, { height: slotHeight }]}>
            <View style={[styles.timeCol, { width: timeColWidth, backgroundColor: Colors.background }]} />
            {currentWeek.map((date, idx) => (
              <TouchableOpacity
                key={date.toISOString()}
                style={[styles.dayCol, { width: dayColWidth }, isToday(date) && styles.todayCol]}
                onPress={() => { setSelectedDayIdx(idx); setShowDayModal(true); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayHeader, isToday(date) && styles.todayHeader]}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                <Text style={[styles.dayDate, isToday(date) && styles.todayHeader]}>{date.getDate()}</Text>
                {isToday(date) && <Text style={styles.todayLabel}>Today</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {TIME_SLOTS.map((slot, tIdx) => (
            <View key={slot} style={[styles.gridRow, tIdx % 2 === 0 ? styles.altRow : null, { minHeight: slotHeight }]}>
              <View style={[styles.timeCol, { width: timeColWidth, minHeight: slotHeight }]}>
                <Text style={styles.timeLabel}>{slot}</Text>
              </View>
              {currentWeek.map((date, dIdx) => {
                const apps: Appointment[] = grid[dIdx][tIdx] ? [grid[dIdx][tIdx] as Appointment] : [];
                return (
                  <View
                    key={date.toISOString() + slot}
                    style={[styles.dayCol, { width: dayColWidth, minHeight: slotHeight, padding: 4, flexDirection: 'row' }, isToday(date) && styles.todayCol]}
                  >
                    {apps.map((app, i) => {
                      const slotCount = getSlotCount(app);
                      const appHeight = slotCount * slotHeight - 8;
                      const isHighlighted =
                        (selectedScanType === 'All' || (app.testName ?? '').includes(selectedScanType)) &&
                        (selectedMachine === 'All' || app.notes === selectedMachine) &&
                        (selectedRoom === 'All' || app.notes === selectedRoom) &&
                        (selectedTechnician === 'All' || app.notes === selectedTechnician);
                      return (
                        <TouchableOpacity
                          key={app.id}
                          style={[
                            styles.appointmentBlock,
                            {
                              backgroundColor: getScanColor(getModalityByTestId(app.testId ?? '')),
                              height: appHeight,
                              flex: 1,
                              marginRight: i < apps.length - 1 ? 6 : 0,
                            },
                            isHighlighted && styles.appointmentBlockHighlighted
                          ]}
                          onPress={() => {
                            setSelectedAppointment(app);
                            setShowAppointmentDetails(true);
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.appointmentName}>{app.patientName ?? ''}</Text>
                          <Text style={styles.appointmentType}>{(app.testName ?? '')}</Text>
                          <Text style={styles.appointmentTime}>{app.time}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <Modal
        visible={showDayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: 300, maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDayIdx !== null ? currentWeek[selectedDayIdx].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : ''} Appointments
              </Text>
              <TouchableOpacity onPress={() => setShowDayModal(false)}>
                <X size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 16 }}>
              {selectedDayIdx !== null &&
                filteredAppointments.filter((app: Appointment) => {
                  const d = currentWeek[selectedDayIdx];
                  const appDate = new Date(app.date);
                  return (
                    appDate.getDate() === d.getDate() &&
                    appDate.getMonth() === d.getMonth() &&
                    appDate.getFullYear() === d.getFullYear()
                  );
                }).map((app: Appointment) => (
                  <View key={app.id} style={{ backgroundColor: getScanColor(app.testName ?? ''), borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{app.patientName ?? ''}</Text>
                    <Text style={{ color: '#fff', fontSize: 14 }}>{(app.testName ?? '')}</Text>
                    <Text style={{ color: '#fff', fontSize: 13 }}>{app.time}</Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontStyle: 'italic' }}>Room: {(app.notes ?? 'N/A')}</Text>
                  </View>
                ))
              }
              {selectedDayIdx !== null && filteredAppointments.filter((app: Appointment) => {
                const d = currentWeek[selectedDayIdx];
                const appDate = new Date(app.date);
                return (
                  appDate.getDate() === d.getDate() &&
                  appDate.getMonth() === d.getMonth() &&
                  appDate.getFullYear() === d.getFullYear()
                );
              }).length === 0 && (
                <Text style={{ color: Colors.subtext, textAlign: 'center', marginTop: 24 }}>No appointments for this day.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAppointmentDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAppointmentDetails(false)}
      >
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Appointment Details</Text>
              <TouchableOpacity onPress={() => setShowAppointmentDetails(false)}>
                <X size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
            {selectedAppointment && (
              <ScrollView style={styles.drawerBody}>
                <Text style={styles.drawerLabel}>Patient Name</Text>
                <Text style={styles.drawerValue}>{selectedAppointment.patientName ?? ''}</Text>
                <Text style={styles.drawerLabel}>Scan Type</Text>
                <Text style={styles.drawerValue}>{(selectedAppointment.testName ?? '')}</Text>
                <Text style={styles.drawerLabel}>Time</Text>
                <Text style={styles.drawerValue}>{selectedAppointment.time}</Text>
                <Text style={styles.drawerLabel}>Room</Text>
                <Text style={styles.drawerValue}>{(selectedAppointment.notes ?? 'N/A')}</Text>
                <View style={{ marginTop: 16 }}>
                  <Button title="Reschedule" onPress={() => {
                    setShowAppointmentDetails(false);
                    if (selectedAppointment) {
                      setRescheduleDate(selectedAppointment.date);
                      setRescheduleTime(selectedAppointment.time);
                      setShowRescheduleModal(true);
                    }
                  }} fullWidth />
                </View>
                <View style={{ marginTop: 8 }}>
                  <Button title="Cancel Appointment" onPress={async () => {
                    if (selectedAppointment) {
                      Alert.alert(
                        'Cancel Appointment',
                        'Are you sure you want to cancel this appointment?',
                        [
                          { text: 'No', style: 'cancel' },
                          {
                            text: 'Yes', style: 'destructive', onPress: async () => {
                              await deleteAppointment(selectedAppointment.id);
                              setShowAppointmentDetails(false);
                              fetchAppointments();
                            }
                          }
                        ]
                      );
                    }
                  }} fullWidth variant="danger" />
                </View>
                <View style={{ marginTop: 8 }}>
                  <Button title="View History" onPress={() => {
                    setShowAppointmentDetails(false);
                    if (selectedAppointment) {
                      router.push({ pathname: '/patient-documents', params: { patientId: selectedAppointment.patientId } });
                    }
                  }} fullWidth variant="outline" />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: 300, maxHeight: '70%' }]}> 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Appointment</Text>
              <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
                <X size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Select New Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {currentWeek.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = rescheduleDate === dateStr;
                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={{
                      backgroundColor: isSelected ? Colors.primary : Colors.card,
                      borderRadius: 8,
                      padding: 12,
                      marginRight: 12,
                      alignItems: 'center',
                      minWidth: 70,
                    }}
                    onPress={() => setRescheduleDate(dateStr)}
                  >
                    <Text style={{ color: isSelected ? 'white' : Colors.text, fontWeight: '600' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                    <Text style={{ color: isSelected ? 'white' : Colors.text, fontSize: 18 }}>{date.getDate()}</Text>
                    <Text style={{ color: isSelected ? 'white' : Colors.text }}>{date.toLocaleDateString('en-US', { month: 'short' })}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Select New Time</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={{
                    backgroundColor: rescheduleTime === time ? Colors.primary : Colors.card,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    marginBottom: 8,
                    marginRight: 8,
                  }}
                  onPress={() => setRescheduleTime(time)}
                >
                  <Text style={{ color: rescheduleTime === time ? 'white' : Colors.text }}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="Confirm Reschedule"
              onPress={async () => {
                if (!selectedAppointment) return;
                if (!rescheduleDate || !rescheduleTime) {
                  Alert.alert('Error', 'Please select both date and time');
                  return;
                }
                await updateAppointment(selectedAppointment.id, { date: rescheduleDate, time: rescheduleTime });
                setShowRescheduleModal(false);
                fetchAppointments();
              }}
              fullWidth
            />
            <View style={{ marginTop: 8 }}>
              <Button title="Cancel" onPress={() => setShowRescheduleModal(false)} variant="outline" fullWidth />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filtersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 4 },
  weekNav: { flexDirection: 'row', alignItems: 'center' },
  arrowBtn: { padding: 6 },
  weekLabel: { fontWeight: '700', fontSize: 16, color: Colors.text, marginHorizontal: 8 },
  gridRow: { flexDirection: 'row', alignItems: 'stretch', borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white },
  altRow: { backgroundColor: Colors.background },
  timeCol: { backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: Colors.border, paddingVertical: 8 },
  dayCol: { backgroundColor: Colors.white, borderRightWidth: 1, borderRightColor: Colors.border, alignItems: 'stretch', justifyContent: 'flex-start', minHeight: 48 },
  todayCol: { backgroundColor: '#E6F7FF' },
  dayHeader: { textAlign: 'center', fontWeight: '700', fontSize: 16, color: Colors.text, marginTop: 4 },
  dayDate: { textAlign: 'center', fontSize: 14, color: Colors.subtext },
  todayHeader: { color: Colors.primary },
  todayLabel: { textAlign: 'center', color: Colors.primary, fontWeight: '700', fontSize: 13, marginTop: 2 },
  timeLabel: { color: Colors.subtext, fontSize: 15, textAlign: 'center', fontWeight: '600' },
  appointmentBlock: { borderRadius: 10, padding: 12, margin: 2, minHeight: 44, justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2 },
  appointmentBlockHighlighted: { borderWidth: 2, borderColor: Colors.primary, shadowOpacity: 0.18 },
  appointmentName: { fontWeight: '700', fontSize: 17, color: '#fff', marginBottom: 2, textAlign: 'center' },
  appointmentType: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2, textAlign: 'center' },
  appointmentTime: { color: '#fff', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, minHeight: 200 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontWeight: '700', fontSize: 18, color: Colors.text },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  drawerContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 350, maxHeight: '80%' },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: Colors.border },
  drawerTitle: { fontWeight: '700', fontSize: 18, color: Colors.text },
  drawerBody: { padding: 18 },
  drawerLabel: { color: Colors.subtext, fontSize: 13, marginTop: 10 },
  drawerValue: { color: Colors.text, fontWeight: '600', fontSize: 16, marginBottom: 2 },
}); 