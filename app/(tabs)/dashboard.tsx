import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import {
  Clock,
  AlertTriangle,
  Baby,
  Moon,
  Activity,
  CheckCircle2,
  XCircle,
  Timer,
  Syringe,
  Plus,
  Calendar,
  MapPin,
  FileText,
  Users,
  BarChart2,
  Bell,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { useStudiesStore } from '@/store/studiesStore';
import { Study, StudyStatus, Modality, User } from '@/types';
import { MetricCard } from '@/components/shared/MetricCard';
import { dashboardMetrics } from '@/mocks/metrics';
import { NotificationBanner } from '@/components/NotificationBanner';
import { useEquipmentStore } from '@/store/equipmentStore';

type PatientQueue = {
  waiting: Study[];
  inProgress: Study[];
  completed: Study[];
  delayed: Study[];
  noShow: Study[];
};

const STATUS_COLORS = {
  waiting: Colors.warning,
  inProgress: Colors.primary,
  completed: Colors.success,
  delayed: Colors.error,
  noShow: Colors.darkGray,
};

const MODALITY_COLORS = {
  'X-Ray': '#4A90E2', // Blue
  'CT': '#F5A623', // Yellow
  'MRI': '#D0021B', // Red
  'Ultrasound': '#7ED321', // Green
  'PET': '#9013FE', // Purple
  'Mammography': '#F8E71C', // Light Yellow
  'Fluoroscopy': '#50E3C2', // Teal
};

const STATUS_LABELS = {
  waiting: 'In Waiting',
  inProgress: 'In Progress',
  completed: 'Completed',
  delayed: 'Delayed',
  noShow: 'No Show',
};

type StaffLoad = {
  [key: string]: {
    assigned: number;
    completed: number;
    inProgress: number;
  };
};

type Analytics = {
  totalScanned: number;
  averageWaitTime: number;
  noShowRate: number;
  peakHours: string[];
};

type AlertType = {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  message: string;
  timestamp: Date;
  studyId?: string;
  patientId?: string;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { studies, fetchStudies } = useStudiesStore();
  const { patients, selectPatient } = usePatientStore();
  const { consumables } = useEquipmentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [queue, setQueue] = useState<PatientQueue>({
    waiting: [],
    inProgress: [],
    completed: [],
    delayed: [],
    noShow: [],
  });
  const [staffLoad, setStaffLoad] = useState<StaffLoad>({});
  const [analytics, setAnalytics] = useState<Analytics>({
    totalScanned: 0,
    averageWaitTime: 0,
    noShowRate: 0,
    peakHours: [],
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const { width } = useWindowDimensions();
  const isLarge = width > 600;

  // Notification banner state
  const [banner, setBanner] = useState<{ message: string; type: 'info' | 'warning' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Banner logic: check for upcoming appointments and expiring/low consumables
  useEffect(() => {
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcoming = studies.find(study => {
      const studyDate = new Date(study.studyDate);
      return studyDate > now && studyDate <= soon;
    });
    if (upcoming) {
      setBanner({
        message: `Upcoming appointment for ${upcoming.patientName || 'a patient'} at ${new Date(upcoming.studyDate).toLocaleString()}`,
        type: 'info',
      });
      return;
    }
    // Check for low/expiring consumables
    const expiring = Object.values(consumables).find(c => {
      const expDate = new Date(c.expirationDate);
      const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return expDate <= soon || c.quantity <= c.minimumQuantity;
    });
    if (expiring) {
      setBanner({
        message: `Consumable "${expiring.name}" is low or expiring soon!`,
        type: 'warning',
      });
      return;
    }
    setBanner(null);
  }, [studies, consumables]);

  const loadData = async () => {
    setRefreshing(true);
    await fetchStudies();
    setRefreshing(false);
  };

  useEffect(() => {
    if (studies.length > 0) {
      const now = new Date();
      const sortedStudies = [...studies].sort((a, b) => 
        new Date(a.studyDate).getTime() - new Date(b.studyDate).getTime()
      );

      const newQueue: PatientQueue = {
        waiting: [],
        inProgress: [],
        completed: [],
        delayed: [],
        noShow: [],
      };

      sortedStudies.forEach(study => {
        const studyDate = new Date(study.studyDate);
        const timeDiff = now.getTime() - studyDate.getTime();
        const isDelayed = timeDiff > 30 * 60 * 1000; // 30 minutes

        switch (study.status) {
          case 'Scheduled':
            newQueue.waiting.push(study);
            break;
          case 'In Progress':
            newQueue.inProgress.push(study);
            break;
          case 'Completed':
            newQueue.completed.push(study);
            break;
          case 'Cancelled':
            if (isDelayed) {
              newQueue.delayed.push(study);
            } else {
              newQueue.noShow.push(study);
            }
            break;
        }
      });

      setQueue(newQueue);
      calculateStaffLoad();
      calculateAnalytics();
      generateAlerts();
    }
  }, [studies]);

  const calculateStaffLoad = () => {
    const load: StaffLoad = {};
    studies.forEach(study => {
      if (study.technologist) {
        if (!load[study.technologist]) {
          load[study.technologist] = { assigned: 0, completed: 0, inProgress: 0 };
        }
        load[study.technologist].assigned++;
        if (study.status === 'Completed') {
          load[study.technologist].completed++;
        } else if (study.status === 'In Progress') {
          load[study.technologist].inProgress++;
        }
      }
    });
    setStaffLoad(load);
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const completedStudies = studies.filter(s => s.status === 'Completed');
    const noShows = studies.filter(s => s.status === 'No Show');
    
    // Calculate average wait time
    const totalWaitTime = completedStudies.reduce((acc, study) => {
      const start = new Date(study.studyDate);
      const end = study.endTime ? new Date(study.endTime) : now;
      return acc + (end.getTime() - start.getTime());
    }, 0);
    
    const avgWaitTime = completedStudies.length > 0 
      ? totalWaitTime / completedStudies.length / 60000 // Convert to minutes
      : 0;

    // Calculate peak hours
    const hourCounts = new Array(24).fill(0);
    studies.forEach(study => {
      const hour = new Date(study.studyDate).getHours();
      hourCounts[hour]++;
    });
    
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ hour }) => `${hour}:00`);

    setAnalytics({
      totalScanned: completedStudies.length,
      averageWaitTime: Math.round(avgWaitTime),
      noShowRate: studies.length > 0 ? (noShows.length / studies.length) * 100 : 0,
      peakHours,
    });
  };

  const generateAlerts = () => {
    const newAlerts: AlertType[] = [];
    const now = new Date();

    studies.forEach(study => {
      const patient = getPatientInfo(study.patientId);
      const studyDate = new Date(study.studyDate);
      const waitingTime = (now.getTime() - studyDate.getTime()) / 60000; // in minutes

      // Check for prolonged waiting time
      if (study.status === 'Scheduled' && waitingTime > 30) {
        newAlerts.push({
          id: `wait-${study.id}`,
          type: 'warning',
          message: `${patient?.name || 'Patient'} has been waiting for ${Math.round(waitingTime)} minutes`,
          timestamp: now,
          studyId: study.id,
          patientId: study.patientId,
        });
      }

      // Check for missing prep steps
      if (study.status === 'Scheduled' && study.modality === 'MRI') {
        const hasMetalScreening = study.specialInstructions?.toLowerCase().includes('metal screening completed');
        if (!hasMetalScreening) {
          newAlerts.push({
            id: `prep-${study.id}`,
            type: 'error',
            message: `Metal screening required for ${patient?.name || 'Patient'}'s MRI`,
            timestamp: now,
            studyId: study.id,
            patientId: study.patientId,
          });
        }
      }

      // Check for contrast allergies
      if (study.contrastRequired && patient?.allergies?.some(a => 
        a.toLowerCase().includes('contrast') || 
        a.toLowerCase().includes('iodine')
      )) {
        newAlerts.push({
          id: `allergy-${study.id}`,
          type: 'error',
          message: `Contrast allergy alert for ${patient?.name || 'Patient'}`,
          timestamp: now,
          studyId: study.id,
          patientId: study.patientId,
        });
      }

      // Check for pediatric sedation
      if (study.modality === 'MRI' && patient?.age && patient.age < 12 && !study.sedationRequired) {
        newAlerts.push({
          id: `sedation-${study.id}`,
          type: 'warning',
          message: `Sedation may be required for ${patient?.name || 'Patient'}'s MRI`,
          timestamp: now,
          studyId: study.id,
          patientId: study.patientId,
        });
      }
    });

    setAlerts(newAlerts);
  };

  const getWaitingTime = (studyDate: string) => {
    const start = new Date(studyDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  };

  const getPatientInfo = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const getArrivalStatus = (study: Study) => {
    const scheduledTime = new Date(study.studyDate);
    const actualTime = study.actualArrivalTime ? new Date(study.actualArrivalTime) : null;
    if (!actualTime) return null;
    
    const diff = actualTime.getTime() - scheduledTime.getTime();
    const minutes = Math.round(diff / 60000);
    
    if (minutes > 15) return { status: 'late', minutes };
    if (minutes < -15) return { status: 'early', minutes: Math.abs(minutes) };
    return { status: 'onTime', minutes: 0 };
  };

  const renderTimeline = (study: Study) => {
    const startTime = new Date(study.studyDate);
    const endTime = study.endTime ? new Date(study.endTime) : null;
    const currentTime = new Date();
    const estimatedDuration = study.estimatedDuration || 30; // Default 30 minutes
    const actualDuration = endTime 
      ? (endTime.getTime() - startTime.getTime()) / 60000 
      : (currentTime.getTime() - startTime.getTime()) / 60000;
    
    const progress = Math.min((actualDuration / estimatedDuration) * 100, 100);
    const isDelayed = actualDuration > estimatedDuration;

    return (
      <View style={styles.timelineContainer}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Progress</Text>
          <Text style={styles.timelineDuration}>
            {Math.round(actualDuration)}/{estimatedDuration} min
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { width: `${progress}%` },
              isDelayed && styles.progressBarDelayed
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderAlerts = () => {
    if (alerts.length === 0) return null;

    return (
      <View style={styles.alertsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
          <Bell size={20} color={Colors.primary} />
        </View>
        {alerts.map(alert => (
          <TouchableOpacity
            key={alert.id}
            style={[styles.alertItem, styles[`alert${alert.type}`]]}
            onPress={() => {
              if (alert.studyId) {
                router.push({
                  pathname: '/study-details',
                  params: { studyId: alert.studyId }
                });
              }
            }}
          >
            <AlertTriangle 
              size={16} 
              color={
                alert.type === 'error' ? Colors.error :
                alert.type === 'warning' ? Colors.warning :
                alert.type === 'success' ? Colors.success :
                Colors.info
              } 
            />
            <Text style={styles.alertText}>{alert.message}</Text>
            <Text style={styles.alertTime}>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStaffLoad = () => (
    <View style={styles.staffLoadContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Staff Load</Text>
        <Users size={20} color={Colors.primary} />
      </View>
      <View style={styles.staffTable}>
        {/* Table Header */}
        <View style={styles.staffTableHeader}>
          <Text style={[styles.staffTableCell, styles.staffTableHeaderCell, { flex: 2 }]}>Staff</Text>
          <Text style={[styles.staffTableCell, styles.staffTableHeaderCell]}>Assigned</Text>
          <Text style={[styles.staffTableCell, styles.staffTableHeaderCell]}>In Progress</Text>
          <Text style={[styles.staffTableCell, styles.staffTableHeaderCell]}>Completed</Text>
          <Text style={[styles.staffTableCell, styles.staffTableHeaderCell]}>Load</Text>
        </View>
        {/* Table Rows */}
        {Object.entries(staffLoad).map(([staff, load]) => (
          <View key={staff} style={styles.staffTableRow}>
            <Text style={[styles.staffTableCell, { flex: 2 }]}>{staff}</Text>
            <Text style={styles.staffTableCell}>{load.assigned}</Text>
            <Text style={styles.staffTableCell}>{load.inProgress}</Text>
            <Text style={styles.staffTableCell}>{load.completed}</Text>
            <View style={styles.staffTableCell}>
              <View style={styles.staffLoadProgress}>
                <View 
                  style={[
                    styles.staffLoadProgressBar,
                    { width: `${(load.completed / load.assigned) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Analytics</Text>
        <BarChart2 size={20} color={Colors.primary} />
      </View>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsValue}>{analytics.totalScanned}</Text>
          <Text style={styles.analyticsLabel}>Scanned</Text>
        </View>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsValue}>{analytics.averageWaitTime}m</Text>
          <Text style={styles.analyticsLabel}>Avg Wait</Text>
        </View>
        <View style={styles.analyticsItem}>
          <Text style={styles.analyticsValue}>{analytics.noShowRate.toFixed(1)}%</Text>
          <Text style={styles.analyticsLabel}>No Show</Text>
        </View>
      </View>
      <View style={styles.peakHoursContainer}>
        <Text style={styles.peakHoursTitle}>Peak Hours:</Text>
        <Text style={styles.peakHoursText}>{analytics.peakHours.join(', ')}</Text>
      </View>
    </View>
  );

  const renderPatientCard = (study: Study) => {
    const patient = getPatientInfo(study.patientId);
    const waitingTime = getWaitingTime(study.studyDate);
    const isUrgent = study.priority === 'STAT';
    const hasAllergies = patient?.allergies && patient.allergies.length > 0;
    const isPediatric = patient?.age && patient.age < 18;
    const requiresSedation = study.modality === 'MRI' && patient?.age && patient.age < 12;
    const requiresContrast = study.contrastRequired;
    const arrivalStatus = getArrivalStatus(study);

    return (
      <TouchableOpacity
        key={study.id}
        style={[
          styles.patientCard,
          { borderLeftColor: MODALITY_COLORS[study.modality] },
          isUrgent && styles.urgentCard,
        ]}
        onPress={() => {
          selectPatient(study.patientId);
          router.push('/patient-details');
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.patientName}>{patient?.name || 'Unknown Patient'}</Text>
            <View style={styles.flagsContainer}>
              {hasAllergies && (
                <View style={[styles.flag, styles.warningFlag]}>
                  <AlertTriangle size={16} color={Colors.error} />
                </View>
              )}
              {isPediatric && (
                <View style={[styles.flag, styles.pediatricFlag]}>
                  <Baby size={16} color={Colors.primary} />
                </View>
              )}
              {requiresSedation && (
                <View style={[styles.flag, styles.sedationFlag]}>
                  <Moon size={16} color={Colors.warning} />
                </View>
              )}
              {requiresContrast && (
                <View style={[styles.flag, styles.contrastFlag]}>
                  <Syringe size={16} color={Colors.info} />
                </View>
              )}
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[study.status.toLowerCase() as keyof typeof STATUS_COLORS] }]}>
              {study.status}
            </Text>
          </View>
        </View>

        {study.status === 'In Progress' && renderTimeline(study)}

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Clock size={16} color={Colors.darkGray} />
            <Text style={styles.detailText}>
              {new Date(study.studyDate).toLocaleTimeString()}
            </Text>
            {study.status === 'Scheduled' && (
              <View style={styles.timerContainer}>
                <Timer size={16} color={Colors.warning} />
                <Text style={[styles.detailText, styles.timerText]}>{waitingTime}</Text>
              </View>
            )}
          </View>

          <View style={styles.detailRow}>
            <Activity size={16} color={Colors.darkGray} />
            <Text style={styles.detailText}>{study.modality} - {study.bodyPart}</Text>
          </View>

          {study.room && (
            <View style={styles.detailRow}>
              <MapPin size={16} color={Colors.darkGray} />
              <Text style={styles.detailText}>Room {study.room}</Text>
            </View>
          )}

          {arrivalStatus && (
            <View style={styles.detailRow}>
              {arrivalStatus.status === 'late' ? (
                <ChevronRight size={16} color={Colors.error} />
              ) : arrivalStatus.status === 'early' ? (
                <ChevronLeft size={16} color={Colors.success} />
              ) : (
                <CheckCircle2 size={16} color={Colors.success} />
              )}
              <Text style={[
                styles.detailText,
                arrivalStatus.status === 'late' && styles.lateText,
                arrivalStatus.status === 'early' && styles.earlyText,
              ]}>
                {arrivalStatus.status === 'late' ? `Late by ${arrivalStatus.minutes}m` :
                 arrivalStatus.status === 'early' ? `Early by ${arrivalStatus.minutes}m` :
                 'On Time'}
              </Text>
            </View>
          )}

          {study.priority === 'STAT' && (
            <View style={styles.detailRow}>
              <AlertTriangle size={16} color={Colors.error} />
              <Text style={[styles.detailText, styles.urgentText]}>STAT</Text>
            </View>
          )}

          <View style={styles.documentAccess}>
            <TouchableOpacity 
              style={styles.documentButton}
              onPress={() => router.push({ pathname: '/patient-documents', params: { patientId: study.patientId } })}
            >
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.documentButtonText}>View Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.documentButton}
              onPress={() => router.push({
                pathname: '/radiology-report',
                params: { patientId: study.patientId, studyId: study.id }
              })}
            >
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.documentButtonText}>Generate Report</Text>
            </TouchableOpacity>
          </View>

          {(hasAllergies || isPediatric || requiresSedation || requiresContrast) && (
            <View style={styles.specialRequirements}>
              <Text style={styles.requirementsTitle}>Special Requirements:</Text>
              <View style={styles.requirementsList}>
                {hasAllergies && (
                  <Text style={[styles.requirementText, styles.warningText]}>
                    • Allergies: {patient?.allergies?.join(', ')}
                  </Text>
                )}
                {isPediatric && (
                  <Text style={styles.requirementText}>• Pediatric Patient</Text>
                )}
                {requiresSedation && (
                  <Text style={[styles.requirementText, styles.warningText]}>
                    • Sedation Required
                  </Text>
                )}
                {requiresContrast && (
                  <Text style={[styles.requirementText, styles.infoText]}>
                    • Contrast Required
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderQueueSection = (title: string, studies: Study[], status: keyof PatientQueue) => {
    if (studies.length === 0) return null;

    return (
      <View style={styles.queueSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.count}>{studies.length}</Text>
        </View>
        {studies.map(renderPatientCard)}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Radiology Dashboard',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => setShowAnalytics(!showAnalytics)}
                style={styles.analyticsButton}
              >
                <BarChart2 size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }
      >
        {banner && (
          <NotificationBanner
            message={banner.message}
            type={banner.type}
            onClose={() => setBanner(null)}
          />
        )}
        {/* Compact Metrics Grid */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: isLarge ? 'space-between' : 'center',
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 8,
        }}>
          {dashboardMetrics.map((metric) => (
            <View
              key={metric.id}
              style={{
                width: isLarge ? '48%' : '100%',
                marginBottom: 16,
              }}
            >
              <MetricCard
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
                chartData={metric.chartData || { labels: [], datasets: [{ data: [] }] }}
                indicatorColor={metric.backgroundColor || '#000000'}
                highlightIndex={0}
                tooltip={metric.title}
              />
            </View>
          ))}
        </View>
        {renderAlerts()}
        {showAnalytics && renderAnalytics()}
        {renderStaffLoad()}
        {renderQueueSection('In Waiting', queue.waiting, 'waiting')}
        {renderQueueSection('In Progress', queue.inProgress, 'inProgress')}
        {renderQueueSection('Completed', queue.completed, 'completed')}
        {renderQueueSection('Delayed', queue.delayed, 'delayed')}
        {renderQueueSection('No Show', queue.noShow, 'noShow')}
        <TouchableOpacity 
          onPress={() => router.push('/schedule-appointment')} 
          style={styles.newAppointmentButton}
        >
          <Plus size={24} color={Colors.background} />
          <Text style={styles.newAppointmentText}>New Appointment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/view-reports')}
          style={styles.newAppointmentButton}
        >
          <FileText size={24} color={Colors.background} />
          <Text style={styles.newAppointmentText}>View Reports</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  refreshButton: {
    marginRight: 16,
  },
  refreshText: {
    color: Colors.primary,
    fontSize: 16,
  },
  queueSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  count: {
    fontSize: 16,
    color: Colors.darkGray,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  patientCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderLeftWidth: 4,
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
  urgentCard: {
    borderWidth: 2,
    borderColor: Colors.error,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  timerText: {
    color: Colors.warning,
  },
  urgentText: {
    color: Colors.error,
  },
  flagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  warningFlag: {
    borderColor: Colors.error,
  },
  pediatricFlag: {
    borderColor: Colors.primary,
  },
  sedationFlag: {
    borderColor: Colors.warning,
  },
  contrastFlag: {
    borderColor: Colors.info,
  },
  specialRequirements: {
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  requirementsList: {
    gap: 4,
  },
  requirementText: {
    fontSize: 13,
    color: Colors.darkGray,
  },
  warningText: {
    color: Colors.error,
  },
  infoText: {
    color: Colors.info,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  analyticsButton: {
    padding: 8,
  },
  newAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  newAppointmentText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
  timelineContainer: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  timelineDuration: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressBarDelayed: {
    backgroundColor: Colors.error,
  },
  staffLoadContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  staffTable: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  staffTableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  staffTableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  staffTableCell: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  staffTableHeaderCell: {
    fontWeight: '600',
    color: Colors.darkGray,
  },
  staffLoadProgress: {
    height: 4,
    backgroundColor: Colors.background,
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  staffLoadProgressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  analyticsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
  },
  analyticsLabel: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 4,
  },
  peakHoursContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  peakHoursTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  peakHoursText: {
    fontSize: 14,
    color: Colors.darkGray,
    marginTop: 4,
  },
  documentAccess: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  documentButtonText: {
    fontSize: 14,
    color: Colors.primary,
  },
  lateText: {
    color: Colors.error,
  },
  earlyText: {
    color: Colors.success,
  },
  alertsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  alertwarning: {
    backgroundColor: Colors.warning + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alerterror: {
    backgroundColor: Colors.error + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  alertsuccess: {
    backgroundColor: Colors.success + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  alertinfo: {
    backgroundColor: Colors.info + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  alertTime: {
    fontSize: 12,
    color: Colors.darkGray,
  },
}); 