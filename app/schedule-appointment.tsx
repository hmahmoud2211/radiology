import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { Calendar, Clock, User, FileText, Search, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { useTestsStore } from '@/store/testsStore';
import Button from '@/components/shared/Button';
import { Patient, RadiologyTest, Appointment } from '@/types';

// Steps in the appointment scheduling process
enum SchedulingStep {
  SelectPatientType,
  FindExistingPatient,
  EnterNewPatient,
  SelectTest,
  SelectDateTime,
  Confirmation
}

export default function ScheduleAppointmentScreen() {
  const router = useRouter();
  const { patients, fetchPatients, addPatient, addAppointment } = usePatientStore();
  const { tests, fetchTests } = useTestsStore();
  const { patientId: preselectedPatientId } = useLocalSearchParams();

  // Current step in the scheduling process
  const [currentStep, setCurrentStep] = useState<SchedulingStep>(SchedulingStep.SelectPatientType);
  
  // Patient information
  const [isExistingPatient, setIsExistingPatient] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // New patient information
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientInsurance, setNewPatientInsurance] = useState('');
  
  // Test selection
  const [availableTests, setAvailableTests] = useState<RadiologyTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<RadiologyTest | null>(null);
  const [testSearchQuery, setTestSearchQuery] = useState('');
  
  // Date and time selection
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load patients and tests data
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPatients(), fetchTests()]);
      setIsLoading(false);
    };
    
    loadData();
    
    // Generate mock available dates (next 14 days)
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setAvailableDates(dates);
    
    // Set available tests
    setAvailableTests(tests);
  }, []);

  // Search for patients when query changes
  useEffect(() => {
    if (searchQuery.length > 2) {
      const query = searchQuery.toLowerCase();
      const results = patients.filter(
        patient =>
          patient.name.toLowerCase().includes(query) ||
          patient.patientId.toLowerCase().includes(query) ||
          (patient.contactNumber && patient.contactNumber.includes(query))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, patients]);

  // Filter tests when search query changes
  useEffect(() => {
    if (testSearchQuery) {
      const query = testSearchQuery.toLowerCase();
      const filtered = tests.filter(
        test =>
          test.name.toLowerCase().includes(query) ||
          test.modality.toLowerCase().includes(query) ||
          test.bodyPart.toLowerCase().includes(query)
      );
      setAvailableTests(filtered);
    } else {
      setAvailableTests(tests);
    }
  }, [testSearchQuery, tests]);

  // Generate available times when date is selected
  useEffect(() => {
    if (selectedDate) {
      // Mock time slots from 8 AM to 4 PM, every 30 minutes
      const times = [];
      for (let hour = 8; hour < 16; hour++) {
        times.push(`${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`);
        times.push(`${hour}:30 ${hour < 12 ? 'AM' : 'PM'}`);
      }
      setAvailableTimes(times);
    }
  }, [selectedDate]);

  // Preselect patient if patientId param is present
  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      const found = patients.find(p => p.id === preselectedPatientId);
      if (found) {
        setSelectedPatient(found);
        setCurrentStep(SchedulingStep.SelectTest);
      }
    }
  }, [preselectedPatientId, patients]);

  const handleSelectPatientType = (isExisting: boolean) => {
    setIsExistingPatient(isExisting);
    if (isExisting) {
      setCurrentStep(SchedulingStep.FindExistingPatient);
    } else {
      // Navigate to new-patient page, pass returnTo param
      router.push({ pathname: '/new-patient', params: { returnTo: '/schedule-appointment' } });
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep(SchedulingStep.SelectTest);
  };

  const validateNewPatient = () => {
    if (!newPatientName.trim()) {
      Alert.alert('Error', 'Please enter patient name');
      return false;
    }
    if (!newPatientDob.trim()) {
      Alert.alert('Error', 'Please enter date of birth');
      return false;
    }
    if (!newPatientPhone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    return true;
  };

  const handleCreateNewPatient = () => {
    if (!validateNewPatient()) return;
    
    // Calculate age from DOB
    const dob = new Date(newPatientDob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    // Create new patient object
    const newPatient: Omit<Patient, 'id'> = {
      name: newPatientName,
      dob: newPatientDob,
      age: age,
      gender: 'Other', // Default, would be better to collect this
      patientId: `P${Math.floor(10000 + Math.random() * 90000)}`,
      contactNumber: newPatientPhone,
      email: newPatientEmail || undefined,
      insuranceInfo: newPatientInsurance || undefined,
      allergies: [],
    };
    
    // Add patient to store and proceed
    addPatient(newPatient).then(() => {
      // Find the newly created patient (it will have an ID now)
      const createdPatient = patients.find(p => p.patientId === newPatient.patientId);
      if (createdPatient) {
        setSelectedPatient(createdPatient);
        setCurrentStep(SchedulingStep.SelectTest);
      } else {
        Alert.alert('Error', 'Failed to create patient record');
      }
    });
  };

  const handleSelectTest = (test: RadiologyTest) => {
    setSelectedTest(test);
    setCurrentStep(SchedulingStep.SelectDateTime);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(SchedulingStep.Confirmation);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedPatient || !selectedTest || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Missing appointment information');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create appointment object
      const newAppointment: Appointment = {
        id: Date.now().toString(), // Temporary ID generation
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        testId: selectedTest.id,
        testName: selectedTest.name,
        date: selectedDate,
        time: selectedTime,
        status: 'Scheduled',
        notes: specialInstructions || undefined,
        type: selectedTest.modality || 'Imaging',
      };
      
      // Add appointment to store
      await addAppointment(newAppointment);
      
      // Show success message and navigate back
      Alert.alert(
        'Appointment Scheduled',
        `Your appointment for ${selectedTest.name} has been scheduled for ${selectedDate} at ${selectedTime}.`,
        [{ text: 'OK', onPress: () => router.push('/(tabs)/weekly-schedule') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (currentStep === SchedulingStep.SelectPatientType) {
      router.back();
    } else if (currentStep === SchedulingStep.FindExistingPatient || currentStep === SchedulingStep.EnterNewPatient) {
      setCurrentStep(SchedulingStep.SelectPatientType);
      setIsExistingPatient(null);
    } else if (currentStep === SchedulingStep.SelectTest) {
      setCurrentStep(isExistingPatient ? SchedulingStep.FindExistingPatient : SchedulingStep.EnterNewPatient);
      setSelectedPatient(null);
    } else if (currentStep === SchedulingStep.SelectDateTime) {
      setCurrentStep(SchedulingStep.SelectTest);
      setSelectedTest(null);
      setSelectedDate('');
      setSelectedTime('');
    } else if (currentStep === SchedulingStep.Confirmation) {
      setCurrentStep(SchedulingStep.SelectDateTime);
      setSelectedTime('');
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, currentStep >= SchedulingStep.SelectPatientType ? styles.activeStepDot : {}]}>
          <Text style={styles.stepNumber}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, currentStep >= SchedulingStep.SelectTest ? styles.activeStepDot : {}]}>
          <Text style={styles.stepNumber}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, currentStep >= SchedulingStep.SelectDateTime ? styles.activeStepDot : {}]}>
          <Text style={styles.stepNumber}>3</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, currentStep >= SchedulingStep.Confirmation ? styles.activeStepDot : {}]}>
          <Text style={styles.stepNumber}>4</Text>
        </View>
      </View>
    );
  };

  const renderSelectPatientType = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Patient Type</Text>
        <Text style={styles.stepDescription}>Are you scheduling for an existing patient or a new patient?</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => handleSelectPatientType(true)}
          >
            <User size={40} color={Colors.primary} />
            <Text style={styles.optionTitle}>Existing Patient</Text>
            <Text style={styles.optionDescription}>Search for a patient already in our system</Text>
            <ChevronRight size={24} color={Colors.primary} style={styles.optionIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => handleSelectPatientType(false)}
          >
            <User size={40} color={Colors.secondary} />
            <Text style={styles.optionTitle}>New Patient</Text>
            <Text style={styles.optionDescription}>Enter information for a new patient</Text>
            <ChevronRight size={24} color={Colors.secondary} style={styles.optionIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFindExistingPatient = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Find Patient</Text>
        <Text style={styles.stepDescription}>Search by patient name, ID, or phone number</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.darkGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
        
        <ScrollView style={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            searchResults.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={styles.patientCard}
                onPress={() => handleSelectPatient(patient)}
              >
                <View>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientDetails}>
                    ID: {patient.patientId} • DOB: {patient.dob}
                  </Text>
                  <Text style={styles.patientDetails}>
                    {patient.contactNumber}
                  </Text>
                </View>
                <ChevronRight size={20} color={Colors.darkGray} />
              </TouchableOpacity>
            ))
          ) : searchQuery.length > 2 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No patients found</Text>
              <Button
                title="Create New Patient"
                onPress={() => handleSelectPatientType(false)}
                variant="outline"
              />
            </View>
          ) : (
            <Text style={styles.searchPrompt}>
              Enter at least 3 characters to search
            </Text>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderEnterNewPatient = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>New Patient Information</Text>
        <Text style={styles.stepDescription}>Enter the patient's details</Text>
        
        <ScrollView style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter patient's full name"
              value={newPatientName}
              onChangeText={setNewPatientName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newPatientDob}
              onChangeText={setNewPatientDob}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={newPatientPhone}
              onChangeText={setNewPatientPhone}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              value={newPatientEmail}
              onChangeText={setNewPatientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Insurance Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter insurance details"
              value={newPatientInsurance}
              onChangeText={setNewPatientInsurance}
            />
          </View>
          
          <Text style={styles.requiredFieldsNote}>* Required fields</Text>
          
          <View style={styles.continueButton}>
            <Button
              title="Continue"
              onPress={handleCreateNewPatient}
              fullWidth
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderSelectTest = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Test/Procedure</Text>
        <Text style={styles.stepDescription}>
          {selectedPatient ? `Scheduling for: ${selectedPatient.name}` : 'Choose the test or procedure'}
        </Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.darkGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tests..."
            value={testSearchQuery}
            onChangeText={setTestSearchQuery}
          />
        </View>
        
        <ScrollView style={styles.resultsContainer}>
          {availableTests.length > 0 ? (
            availableTests.map((test) => (
              <TouchableOpacity
                key={test.id}
                style={styles.testCard}
                onPress={() => handleSelectTest(test)}
              >
                <View style={styles.testHeader}>
                  <View style={[styles.modalityBadge, { backgroundColor: getModalityColor(test.modality) }]}>
                    <Text style={styles.modalityText}>{test.modality}</Text>
                  </View>
                  <Text style={styles.bodyPart}>{test.bodyPart}</Text>
                </View>
                <Text style={styles.testName}>{test.name}</Text>
                <View style={styles.testDetails}>
                  <View style={styles.testDetail}>
                    <Clock size={16} color={Colors.darkGray} />
                    <Text style={styles.testDetailText}>{test.duration} min</Text>
                  </View>
                  {test.price && (
                    <View style={styles.testDetail}>
                      <Text style={styles.testDetailText}>${test.price}</Text>
                    </View>
                  )}
                </View>
                <ChevronRight size={20} color={Colors.darkGray} style={styles.testChevron} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tests found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderSelectDateTime = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Date & Time</Text>
        <Text style={styles.stepDescription}>
          {selectedTest ? `Scheduling: ${selectedTest.name}` : 'Choose appointment date and time'}
        </Text>
        
        <View style={styles.dateTimeContainer}>
          <Text style={styles.sectionSubtitle}>Available Dates</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.datesContainer}
          >
            {availableDates.map((date) => {
              const dateObj = new Date(date);
              const isSelected = date === selectedDate;
              
              return (
                <TouchableOpacity
                  key={date}
                  style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                  onPress={() => handleSelectDate(date)}
                >
                  <Text style={[styles.dateDay, isSelected && styles.selectedDateText]}>
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.selectedDateText]}>
                    {dateObj.getDate()}
                  </Text>
                  <Text style={[styles.dateMonth, isSelected && styles.selectedDateText]}>
                    {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          {selectedDate && (
            <>
              <Text style={styles.sectionSubtitle}>Available Times</Text>
              <View style={styles.timesContainer}>
                {availableTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={styles.timeCard}
                    onPress={() => handleSelectTime(time)}
                  >
                    <Clock size={16} color={Colors.primary} />
                    <Text style={styles.timeText}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderConfirmation = () => {
    if (!selectedPatient || !selectedTest || !selectedDate || !selectedTime) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.errorText}>Missing appointment information</Text>
          <Button title="Go Back" onPress={handleGoBack} variant="outline" />
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Confirm Appointment</Text>
        <Text style={styles.stepDescription}>Review and confirm appointment details</Text>
        
        <View style={styles.confirmationCard}>
          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>Patient</Text>
            <Text style={styles.confirmationValue}>{selectedPatient.name}</Text>
            <Text style={styles.confirmationDetail}>ID: {selectedPatient.patientId}</Text>
          </View>
          
          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>Test/Procedure</Text>
            <Text style={styles.confirmationValue}>{selectedTest.name}</Text>
            <Text style={styles.confirmationDetail}>{selectedTest.modality} • {selectedTest.bodyPart}</Text>
          </View>
          
          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>Date & Time</Text>
            <Text style={styles.confirmationValue}>{selectedDate} at {selectedTime}</Text>
            <Text style={styles.confirmationDetail}>Duration: {selectedTest.duration} minutes</Text>
          </View>
          
          {selectedTest.preparationInstructions && (
            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationLabel}>Preparation Instructions</Text>
              <Text style={styles.confirmationDetail}>{selectedTest.preparationInstructions}</Text>
            </View>
          )}
          
          <View style={styles.specialInstructionsContainer}>
            <Text style={styles.confirmationLabel}>Special Instructions (Optional)</Text>
            <TextInput
              style={styles.specialInstructionsInput}
              placeholder="Add any special instructions or notes..."
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
            />
          </View>
        </View>
        
        <View style={styles.reminderContainer}>
          <AlertCircle size={20} color={Colors.primary} />
          <Text style={styles.reminderText}>
            Please review all details carefully before confirming the appointment.
          </Text>
        </View>
        
        <View style={styles.confirmButton}>
          <Button
            title="Confirm Appointment"
            onPress={handleConfirmAppointment}
            loading={isLoading}
            fullWidth
          />
        </View>
      </ScrollView>
    );
  };

  // Helper function to get color based on modality
  const getModalityColor = (modality: string) => {
    switch (modality) {
      case 'X-Ray':
        return '#3B82F6'; // Blue
      case 'CT':
        return '#8B5CF6'; // Purple
      case 'MRI':
        return '#10B981'; // Green
      case 'Ultrasound':
        return '#F59E0B'; // Amber
      case 'PET':
        return '#EF4444'; // Red
      case 'Mammography':
        return '#EC4899'; // Pink
      case 'Fluoroscopy':
        return '#6366F1'; // Indigo
      default:
        return Colors.primary;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Schedule Appointment" }} />
      <View style={styles.container}>
        {renderStepIndicator()}
        
        <View style={styles.contentContainer}>
          {currentStep === SchedulingStep.SelectPatientType && renderSelectPatientType()}
          {currentStep === SchedulingStep.FindExistingPatient && renderFindExistingPatient()}
          {currentStep === SchedulingStep.EnterNewPatient && renderEnterNewPatient()}
          {currentStep === SchedulingStep.SelectTest && renderSelectTest()}
          {currentStep === SchedulingStep.SelectDateTime && renderSelectDateTime()}
          {currentStep === SchedulingStep.Confirmation && renderConfirmation()}
        </View>
        
        {currentStep !== SchedulingStep.SelectPatientType && (
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ChevronLeft size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepDot: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 24,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  optionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
  },
  optionIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: Colors.text,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: Colors.subtext,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 16,
  },
  searchPrompt: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    marginTop: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 16,
  },
  continueButton: {
    marginTop: 16,
  },
  testCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  modalityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  bodyPart: {
    fontSize: 14,
    color: Colors.text,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  testDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  testDetailText: {
    fontSize: 14,
    color: Colors.subtext,
    marginLeft: 4,
  },
  testChevron: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  dateTimeContainer: {
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  datesContainer: {
    marginBottom: 24,
  },
  dateCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  selectedDateCard: {
    backgroundColor: Colors.primary,
  },
  dateDay: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  dateMonth: {
    fontSize: 12,
    color: Colors.subtext,
  },
  selectedDateText: {
    color: 'white',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  confirmationCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmationSection: {
    marginBottom: 16,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.subtext,
    marginBottom: 4,
  },
  confirmationValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  confirmationDetail: {
    fontSize: 14,
    color: Colors.text,
  },
  specialInstructionsContainer: {
    marginTop: 8,
  },
  specialInstructionsInput: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  reminderText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  confirmButton: {
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
});