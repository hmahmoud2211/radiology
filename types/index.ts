export type Patient = {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    dob: string;
    patientId: string;
    contactNumber: string;
    email?: string;
    address?: string;
    insuranceInfo?: string;
    medicalHistory?: string;
    allergies?: string[];
    lastVisit?: string;
    upcomingAppointment?: string;
  };
  
  export type Modality = 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'PET' | 'Mammography' | 'Fluoroscopy';
  
  export type StudyStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Reported' | 'Verified' | 'Cancelled';
  
  export type Study = {
    id: string;
    patientId: string;
    patientName: string;
    studyDate: string;
    modality: Modality;
    bodyPart: string;
    accessionNumber: string;
    referringPhysician: string;
    status: StudyStatus;
    priority: 'Routine' | 'Urgent' | 'STAT';
    reportStatus: 'Pending' | 'Preliminary' | 'Final';
    radiologist?: string;
    technologist?: string;
    reportDate?: string;
    images?: string[];
    findings?: string;
    impression?: string;
  };
  
  export type RadiologyTest = {
    id: string;
    name: string;
    modality: Modality;
    bodyPart: string;
    description: string;
    preparationInstructions?: string;
    duration: number; // in minutes
    price?: number;
    cptCode?: string;
    contraindications?: string[];
  };
  
  export type Appointment = {
    id: string;
    patientId: string;
    patientName: string;
    testId: string;
    testName: string;
    date: string;
    time: string;
    status: 'Scheduled' | 'Checked In' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
    notes?: string;
  };
  
  export type ImageAnnotation = {
    id: string;
    type: 'Arrow' | 'Circle' | 'Rectangle' | 'Text' | 'Freehand';
    coordinates: any; // Depends on the type
    text?: string;
    color: string;
    studyId: string;
    imageIndex: number;
    createdBy: string;
    createdAt: string;
  };
  
  export type Measurement = {
    id: string;
    type: 'Distance' | 'Area' | 'Angle' | 'HU' | 'SUV';
    value: number;
    unit: string;
    coordinates: any;
    studyId: string;
    imageIndex: number;
    createdBy: string;
    createdAt: string;
  };
  
  export type User = {
    id: string;
    name: string;
    role: 'Radiologist' | 'Technologist' | 'Receptionist' | 'Administrator';
    email: string;
    department?: string;
    specialization?: string;
  };
  
  export type DashboardMetric = {
    id: string;
    title: string;
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: string;
  };