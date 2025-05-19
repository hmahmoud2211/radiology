import { MetricData } from '@/types';

const hoursOfDay = [
  '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'
];

const daysOfWeek = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];

export const dashboardMetrics: MetricData[] = [
  {
    id: '1',
    title: 'Total Studies Today',
    value: '24',
    trend: 'up',
    chartData: {
      labels: hoursOfDay,
      datasets: [{
        data: [15, 18, 22, 19, 25, 28, 22, 20]
      }]
    },
    backgroundColor: '#1976D2'
  },
  {
    id: '2',
    title: 'Pending Reports',
    value: '12',
    trend: 'down',
    chartData: {
      labels: hoursOfDay,
      datasets: [{
        data: [8, 12, 15, 10, 8, 6, 5, 4]
      }]
    },
    backgroundColor: '#FFA000'
  },
  {
    id: '3',
    title: 'Average Report Time',
    value: '4.2 hrs',
    trend: 'neutral',
    chartData: {
      labels: daysOfWeek,
      datasets: [{
        data: [4.5, 4.2, 3.8, 4.1, 4.4, 3.9, 4.2]
      }]
    },
    backgroundColor: '#388E3C'
  },
  {
    id: '4',
    title: 'Scheduled Appointments',
    value: '18',
    trend: 'up',
    chartData: {
      labels: daysOfWeek,
      datasets: [{
        data: [15, 18, 20, 16, 22, 12, 10]
      }]
    },
    backgroundColor: '#E64A19'
  }
];