import { Patient } from '@/types';
import { appointments } from './appointments';

// Helper to get the next appointment for a patient
function getNextAppointmentDate(patientId: string): string | undefined {
  const now = new Date();
  const futureAppointments = appointments.filter(
    (a) => a.patientId === patientId && new Date(a.date) >= now
  );
  if (futureAppointments.length === 0) return undefined;
  futureAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return futureAppointments[0].date;
}

export const patients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    dob: '1979-05-12',
    patientId: 'P10045',
    contactNumber: '(555) 123-4567',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown, CA 94123',
    insuranceInfo: 'BlueCross #BC987654321',
    medicalHistory: 'Hypertension, Type 2 Diabetes',
    allergies: ['Penicillin', 'Shellfish'],
    lastVisit: '2023-11-15',
    upcomingAppointment: getNextAppointmentDate('1'),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    age: 32,
    gender: 'Female',
    dob: '1991-08-23',
    patientId: 'P10046',
    contactNumber: '(555) 234-5678',
    email: 'sarah.j@example.com',
    address: '456 Oak Ave, Somewhere, NY 10001',
    insuranceInfo: 'Aetna #AE123456789',
    medicalHistory: 'Asthma',
    allergies: ['Latex'],
    lastVisit: '2023-10-05',
    upcomingAppointment: getNextAppointmentDate('2'),
  },
  {
    id: '3',
    name: 'Robert Chen',
    age: 67,
    gender: 'Male',
    dob: '1956-03-17',
    patientId: 'P10047',
    contactNumber: '(555) 345-6789',
    email: 'robert.chen@example.com',
    address: '789 Pine St, Elsewhere, TX 75001',
    insuranceInfo: 'Medicare #MC123456789',
    medicalHistory: 'Coronary Artery Disease, Osteoarthritis',
    allergies: ['Sulfa Drugs', 'Iodine'],
    lastVisit: '2023-11-28',
    upcomingAppointment: getNextAppointmentDate('3'),
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    age: 28,
    gender: 'Female',
    dob: '1995-11-30',
    patientId: 'P10048',
    contactNumber: '(555) 456-7890',
    email: 'emily.r@example.com',
    address: '101 Maple Dr, Nowhere, FL 33101',
    insuranceInfo: 'Cigna #CI987654321',
    medicalHistory: 'Migraine',
    allergies: [],
    lastVisit: '2023-09-12',
    upcomingAppointment: getNextAppointmentDate('4'),
  },
  {
    id: '5',
    name: 'Michael Williams',
    age: 52,
    gender: 'Male',
    dob: '1971-07-08',
    patientId: 'P10049',
    contactNumber: '(555) 567-8901',
    email: 'michael.w@example.com',
    address: '202 Cedar Ln, Anyplace, WA 98001',
    insuranceInfo: 'UnitedHealth #UH123456789',
    medicalHistory: 'Hyperlipidemia, GERD',
    allergies: ['NSAIDs'],
    lastVisit: '2023-10-20',
    upcomingAppointment: getNextAppointmentDate('5'),
  },
];