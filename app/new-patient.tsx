import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ChevronDown, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import Button from '@/components/shared/Button';
import {
  NewPatientFormData,
  Gender,
  ScanType,
  BodyRegion,
  ClinicalIndication,
  MedicalCondition,
  Allergy,
  SafetyFlag,
  InsuranceProvider,
  RequiredDocument,
  Patient,
} from '@/types';

const GENDERS: Gender[] = ['Male', 'Female', 'Other'];
const SCAN_TYPES: ScanType[] = ['MRI', 'CT', 'X-ray', 'Ultrasound'];
const BODY_REGIONS: BodyRegion[] = ['Brain', 'Abdomen', 'Chest', 'Spine', 'Extremities', 'Other'];
const CLINICAL_INDICATIONS: ClinicalIndication[] = [
  'Trauma',
  'Pain',
  'Screening',
  'Follow-up',
  'Pre-surgical',
  'Post-surgical',
  'Other',
];
const MEDICAL_CONDITIONS: MedicalCondition[] = [
  'Diabetes',
  'Hypertension',
  'Kidney Disease',
  'Cancer',
  'Heart Disease',
  'None',
];
const ALLERGIES: Allergy[] = ['Contrast Dye', 'Penicillin', 'Latex', 'Iodine', 'Other'];
const SAFETY_FLAGS: SafetyFlag[] = [
  'Pregnancy',
  'Metal Implants',
  'Pacemaker',
  'Claustrophobia',
  'Requires Sedation',
  'Previous Adverse Reactions',
];
const INSURANCE_PROVIDERS: InsuranceProvider[] = [
  'Medicare',
  'Medicaid',
  'Blue Cross',
  'Aetna',
  'United Healthcare',
  'Other',
];
const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  'Referral Form',
  'Previous Reports',
  'Consent Forms',
  'Lab Results',
];

export default function NewPatientScreen() {
  const router = useRouter();
  const { addPatient } = usePatientStore();
  const { returnTo } = useLocalSearchParams<{ returnTo: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<keyof NewPatientFormData | null>(null);
  const [formData, setFormData] = useState<NewPatientFormData>({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    nationalId: '',
    phoneNumber: '',
    email: '',
    scanType: 'MRI',
    bodyRegion: 'Brain',
    clinicalIndication: 'Pain',
    referringPhysician: '',
    medicalConditions: [],
    allergies: [],
    safetyFlags: [],
    insuranceProvider: 'Medicare',
    submittedDocuments: [],
    notes: '',
  });

  const handleInputChange = (field: keyof NewPatientFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: keyof NewPatientFormData, value: any) => {
    setFormData((prev) => {
      const currentValues = prev[field] as any[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleDropdownSelect = (field: keyof NewPatientFormData, value: any) => {
    handleInputChange(field, value);
    setShowDropdown(false);
    setActiveDropdown(null);
  };

  const renderDropdown = () => {
    if (!activeDropdown || !showDropdown) return null;

    let options: any[] = [];
    switch (activeDropdown) {
      case 'gender':
        options = GENDERS;
        break;
      case 'scanType':
        options = SCAN_TYPES;
        break;
      case 'bodyRegion':
        options = BODY_REGIONS;
        break;
      case 'clinicalIndication':
        options = CLINICAL_INDICATIONS;
        break;
      case 'insuranceProvider':
        options = INSURANCE_PROVIDERS;
        break;
      default:
        return null;
    }

    return (
      <Modal
        visible={showDropdown}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {activeDropdown}</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownOption}
                  onPress={() => handleDropdownSelect(activeDropdown, option)}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.nationalId || !formData.phoneNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Calculate age from date of birth
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      const newPatient = await addPatient({
        name: formData.fullName,
        dob: formData.dateOfBirth,
        age,
        gender: formData.gender,
        patientId: formData.nationalId,
        contactNumber: formData.phoneNumber,
        email: formData.email || undefined,
        insuranceInfo: formData.insuranceProvider || undefined,
        allergies: formData.allergies || [],
      });

      if (returnTo) {
        router.push({ pathname: returnTo as any, params: { patientId: newPatient.id } });
      } else {
        router.back();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add patient');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Patient' }} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Enter full name"
          />

          <Text style={styles.label}>Gender *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setActiveDropdown('gender');
              setShowDropdown(true);
            }}
          >
            <Text style={styles.dropdownText}>{formData.gender}</Text>
            <ChevronDown size={20} color={Colors.darkGray} />
          </TouchableOpacity>

          <Text style={styles.label}>Date of Birth *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.dateOfBirth || 'Select date'}
            </Text>
          </TouchableOpacity>
        
          <Text style={styles.label}>National ID/MRN *</Text>
          <TextInput
            style={styles.input}
            value={formData.nationalId}
            onChangeText={(value) => handleInputChange('nationalId', value)}
            placeholder="Enter ID number"
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Details</Text>
          
          <Text style={styles.label}>Scan Type *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setActiveDropdown('scanType');
              setShowDropdown(true);
            }}
          >
            <Text style={styles.dropdownText}>{formData.scanType}</Text>
            <ChevronDown size={20} color={Colors.darkGray} />
          </TouchableOpacity>

          <Text style={styles.label}>Body Region *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setActiveDropdown('bodyRegion');
              setShowDropdown(true);
            }}
          >
            <Text style={styles.dropdownText}>{formData.bodyRegion}</Text>
            <ChevronDown size={20} color={Colors.darkGray} />
          </TouchableOpacity>

          <Text style={styles.label}>Clinical Indication *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setActiveDropdown('clinicalIndication');
              setShowDropdown(true);
            }}
          >
            <Text style={styles.dropdownText}>{formData.clinicalIndication}</Text>
            <ChevronDown size={20} color={Colors.darkGray} />
          </TouchableOpacity>

          {formData.clinicalIndication === 'Other' && (
            <TextInput
              style={styles.input}
              value={formData.otherClinicalIndication}
              onChangeText={(value) => handleInputChange('otherClinicalIndication', value)}
              placeholder="Specify clinical indication"
            />
          )}

          <Text style={styles.label}>Referring Physician *</Text>
          <TextInput
            style={styles.input}
            value={formData.referringPhysician}
            onChangeText={(value) => handleInputChange('referringPhysician', value)}
            placeholder="Enter physician name"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          
          <Text style={styles.label}>Medical Conditions</Text>
          <View style={styles.checkboxGroup}>
            {MEDICAL_CONDITIONS.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={styles.checkbox}
                onPress={() => handleMultiSelect('medicalConditions', condition)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    formData.medicalConditions.includes(condition) &&
                      styles.checkboxBoxChecked,
                  ]}
                />
                <Text style={styles.checkboxLabel}>{condition}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Allergies</Text>
          <View style={styles.checkboxGroup}>
            {ALLERGIES.map((allergy) => (
              <TouchableOpacity
                key={allergy}
                style={styles.checkbox}
                onPress={() => handleMultiSelect('allergies', allergy)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    formData.allergies.includes(allergy) &&
                      styles.checkboxBoxChecked,
                  ]}
                />
                <Text style={styles.checkboxLabel}>{allergy}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {formData.allergies.includes('Other') && (
            <TextInput
              style={styles.input}
              value={formData.otherAllergies}
              onChangeText={(value) => handleInputChange('otherAllergies', value)}
              placeholder="Specify other allergies"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Flags</Text>
          
          <Text style={styles.label}>Pregnancy Status</Text>
          <View style={styles.radioGroup}>
            {['Yes', 'No', 'Unknown'].map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.radio}
                onPress={() => handleInputChange('pregnancyStatus', status)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    formData.pregnancyStatus === status &&
                      styles.radioCircleChecked,
                  ]}
                />
                <Text style={styles.radioLabel}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Safety Considerations</Text>
          <View style={styles.checkboxGroup}>
            {SAFETY_FLAGS.map((flag) => (
              <TouchableOpacity
                key={flag}
                style={styles.checkbox}
                onPress={() => handleMultiSelect('safetyFlags', flag)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    formData.safetyFlags.includes(flag) &&
                      styles.checkboxBoxChecked,
                  ]}
                />
                <Text style={styles.checkboxLabel}>{flag}</Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insurance & Documents</Text>
          
          <Text style={styles.label}>Insurance Provider *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setActiveDropdown('insuranceProvider');
              setShowDropdown(true);
            }}
          >
            <Text style={styles.dropdownText}>{formData.insuranceProvider}</Text>
            <ChevronDown size={20} color={Colors.darkGray} />
          </TouchableOpacity>

          {formData.insuranceProvider === 'Other' && (
          <TextInput
            style={styles.input}
              value={formData.otherInsuranceProvider}
              onChangeText={(value) => handleInputChange('otherInsuranceProvider', value)}
              placeholder="Specify insurance provider"
            />
          )}

          <Text style={styles.label}>Submitted Documents</Text>
          <View style={styles.checkboxGroup}>
            {REQUIRED_DOCUMENTS.map((doc) => (
              <TouchableOpacity
                key={doc}
                style={styles.checkbox}
                onPress={() => handleMultiSelect('submittedDocuments', doc)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    formData.submittedDocuments.includes(doc) &&
                      styles.checkboxBoxChecked,
                  ]}
                />
                <Text style={styles.checkboxLabel}>{doc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Enter any additional notes or comments"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.footer}>
          <View style={styles.footerButton}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
        />
          </View>
          <View style={styles.footerButton}>
        <Button
          title="Save Patient"
          onPress={handleSubmit}
              loading={isLoading}
        />
          </View>
      </View>
    </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            setShowDatePicker(false);
            if (date) {
              handleInputChange('dateOfBirth', date.toISOString().split('T')[0]);
            }
          }}
        />
      )}

      {renderDropdown()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  dateInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  checkboxGroup: {
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 8,
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 8,
  },
  radioCircleChecked: {
    backgroundColor: Colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});