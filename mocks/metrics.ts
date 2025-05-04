import { DashboardMetric } from '@/types';

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: '1',
    title: 'Total Studies Today',
    value: 24,
    change: 4,
    trend: 'up',
    icon: 'activity',
  },
  {
    id: '2',
    title: 'Pending Reports',
    value: 12,
    change: -2,
    trend: 'down',
    icon: 'clipboard',
  },
  {
    id: '3',
    title: 'Average Report Time',
    value: '4.2 hrs',
    change: -0.5,
    trend: 'down',
    icon: 'clock',
  },
  {
    id: '4',
    title: 'Scheduled Appointments',
    value: 18,
    change: 2,
    trend: 'up',
    icon: 'calendar',
  },
];