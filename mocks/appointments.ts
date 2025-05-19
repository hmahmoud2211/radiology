import { Appointment } from '@/types';

// Get current date and format it as YYYY-MM-DD
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

// Generate dates for the current week
const getWeekDates = () => {
  const dates: string[] = [];
  const currentDay = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - currentDay);
  
  for (let i = 0; i < 7; i++) {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + i);
    dates.push(formatDate(newDate));
  }
  
  return dates;
};

const weekDates = getWeekDates();

export const appointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    testId: '2',
    testName: 'CT Scan of Chest without Contrast',
    date: weekDates[1], // Tuesday
    time: '09:00 AM',
    status: 'Scheduled',
    notes: 'Follow-up for previous findings',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sarah Johnson',
    testId: '7',
    testName: 'X-Ray Right Knee',
    date: weekDates[3], // Thursday
    time: '10:30 AM',
    status: 'Scheduled',
    notes: 'Patient reports pain after fall',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Robert Chen',
    testId: '1',
    testName: 'Chest X-Ray (PA and Lateral)',
    date: weekDates[5], // Saturday
    time: '02:00 PM',
    status: 'Scheduled',
    notes: 'Annual follow-up for CHF',
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Emily Rodriguez',
    testId: '6',
    testName: 'Abdominal Ultrasound',
    date: weekDates[0], // Sunday
    time: '11:15 AM',
    status: 'Scheduled',
    notes: 'Evaluate for gallstones',
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Michael Williams',
    testId: '8',
    testName: 'CT Scan of Abdomen and Pelvis with Contrast',
    date: weekDates[2], // Wednesday
    time: '01:30 PM',
    status: 'Scheduled',
    notes: 'Follow-up for kidney stone',
  },
  {
    id: '6',
    patientId: '1',
    patientName: 'John Smith',
    testId: '9',
    testName: 'MRI of Lumbar Spine',
    date: weekDates[4], // Friday
    time: '08:45 AM',
    status: 'Scheduled',
    notes: 'Patient reports lower back pain',
  },
];