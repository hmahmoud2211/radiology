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
  
  export type StudyStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Reported' | 'Verified' | 'Cancelled' | 'No Show';
  
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
    priority?: 'STAT' | 'Routine';
    reportStatus: 'Pending' | 'Preliminary' | 'Final';
    radiologist?: string;
    technologist?: string;
    reportDate?: string;
    images?: string[];
    findings?: string;
    impression?: string;
    room?: string;
    estimatedDuration?: number; // in minutes
    actualDuration?: number; // in minutes
    startTime?: string;
    endTime?: string;
    delayReason?: string;
    specialInstructions?: string;
    contrastRequired?: boolean;
    sedationRequired?: boolean;
    assignedTo?: string;
    actualArrivalTime?: string;
    lastUpdated?: string;
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
    chartData?: {
      labels: string[];
      datasets: {
        data: number[];
      }[];
    };
    backgroundColor?: string;
  };
  
  export type ChecklistItemStatus = 'pending' | 'completed' | 'flagged' | 'not_applicable';
  
  export type ChecklistItemType = 
    | 'consent'
    | 'renal_function'
    | 'metal_screening'
    | 'npo_status'
    | 'pregnancy_status'
    | 'pre_medication'
    | 'allergies'
    | 'medical_history'
    | 'lab_results'
    | 'custom';
  
  export type ChecklistItem = {
    id: string;
    type: ChecklistItemType;
    title: string;
    description: string;
    status: ChecklistItemStatus;
    value?: string | number;
    threshold?: number;
    unit?: string;
    notes?: string;
    attachments?: string[];
    verifiedBy?: string;
    verifiedAt?: string;
    isRequired: boolean;
    customValidation?: (value: any) => boolean;
  };
  
  export type PatientChecklist = {
    id: string;
    patientId: string;
    studyId: string;
    items: ChecklistItem[];
    status: 'pending' | 'in_progress' | 'completed' | 'flagged';
    startedAt: string;
    completedAt?: string;
    startedBy: string;
    completedBy?: string;
  };
  
  export type Gender = 'Male' | 'Female' | 'Other';
  
  export type ScanType = 'MRI' | 'CT' | 'X-ray' | 'Ultrasound';
  
  export type BodyRegion = 'Brain' | 'Abdomen' | 'Chest' | 'Spine' | 'Extremities' | 'Other';
  
  export type ClinicalIndication = 
    | 'Trauma'
    | 'Pain'
    | 'Screening'
    | 'Follow-up'
    | 'Pre-surgical'
    | 'Post-surgical'
    | 'Other';
  
  export type MedicalCondition = 
    | 'Diabetes'
    | 'Hypertension'
    | 'Kidney Disease'
    | 'Cancer'
    | 'Heart Disease'
    | 'None';
  
  export type Allergy = 
    | 'Contrast Dye'
    | 'Penicillin'
    | 'Latex'
    | 'Iodine'
    | 'Other';
  
  export type SafetyFlag = 
    | 'Pregnancy'
    | 'Metal Implants'
    | 'Pacemaker'
    | 'Claustrophobia'
    | 'Requires Sedation'
    | 'Previous Adverse Reactions';
  
  export type InsuranceProvider = 
    | 'Medicare'
    | 'Medicaid'
    | 'Blue Cross'
    | 'Aetna'
    | 'United Healthcare'
    | 'Other';
  
  export type RequiredDocument = 
    | 'Referral Form'
    | 'Previous Reports'
    | 'Consent Forms'
    | 'Lab Results';
  
  export interface NewPatientFormData {
    // Basic Information
    fullName: string;
    gender: Gender;
    dateOfBirth: string;
    nationalId: string;
    phoneNumber: string;
    email?: string;
  
    // Clinical Details
    scanType: ScanType;
    bodyRegion: BodyRegion;
    clinicalIndication: ClinicalIndication;
    referringPhysician: string;
    otherClinicalIndication?: string;
  
    // Medical History
    medicalConditions: MedicalCondition[];
    allergies: Allergy[];
    otherAllergies?: string;
  
    // Safety Flags
    safetyFlags: SafetyFlag[];
    pregnancyStatus?: 'Yes' | 'No' | 'Unknown';
  
    // Insurance & Documents
    insuranceProvider: InsuranceProvider;
    otherInsuranceProvider?: string;
    submittedDocuments: RequiredDocument[];

    // Additional Information
    notes?: string;
  }