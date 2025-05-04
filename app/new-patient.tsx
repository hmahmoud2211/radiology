import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Calendar, Phone, Mail, MapPin, Shield, FileText, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import Button from '@/components/shared/Button';

export default function NewPatientScreen() {
  const router = useRouter();
  const { addPatient } = usePatientStore();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('');
  const [patientId, setPatientId] = useState(`P${Math.floor(10000 + Math.random() * 90000)}`);
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [insuranceInfo, setInsuranceInfo] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Patient name is required');
      return false;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert('Error', 'Valid age is required');
      return false;
    }
    if (!dob.trim()) {
      Alert.alert('Error', 'Date of birth is required');
      return false;
    }
    if (!contactNumber.trim()) {
      Alert.alert('Error', 'Contact number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const newPatient = {
        name,
        age: Number(age),
        gender,
        dob,
        patientId,
        contactNumber,
        email: email || undefined,
        address: address || undefined,
        insuranceInfo: insuranceInfo || undefined,
        medicalHistory: medicalHistory || undefined,
        allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
      };
      
      await addPatient(newPatient);
      Alert.alert('Success', 'Patient added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Patient</Text>
        <Text style={styles.subtitle}>Enter patient information</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputContainer}>
          <User size={20} color={Colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Calendar size={20} color={Colors.darkGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.inputContainer, { flex: 2 }]}>
            <Calendar size={20} color={Colors.darkGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (YYYY-MM-DD)"
              value={dob}
              onChangeText={setDob}
            />
          </View>
        </View>
        
        <View style={styles.genderSelector}>
          <Text style={styles.genderLabel}>Gender:</Text>
          <TouchableOpacity
            style={[styles.genderOption, gender === 'Male' && styles.selectedGender]}
            onPress={() => setGender('Male')}
          >
            <Text style={[styles.genderText, gender === 'Male' && styles.selectedGenderText]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderOption, gender === 'Female' && styles.selectedGender]}
            onPress={() => setGender('Female')}
          >
            <Text style={[styles.genderText, gender === 'Female' && styles.selectedGenderText]}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderOption, gender === 'Other' && styles.selectedGender]}
            onPress={() => setGender('Other')}
          >
            <Text style={[styles.genderText, gender === 'Other' && styles.selectedGenderText]}>Other</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <User size={20} color={Colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Patient ID"
            value={patientId}
            onChangeText={setPatientId}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.inputContainer}>
          <Phone size={20} color={Colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Mail size={20} color={Colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <MapPin size={20} color={Colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Medical Information</Text>
        
        <View style={styles.inputContainer}>
          <Shield size={20} color={Colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Insurance Information"
            value={insuranceInfo}
            onChangeText={setInsuranceInfo}
          />
        </View>
        
        <View style={styles.textAreaContainer}>
          <FileText size={20} color={Colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.textArea}
            placeholder="Medical History"
            value={medicalHistory}
            onChangeText={setMedicalHistory}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.textAreaContainer}>
          <AlertCircle size={20} color={Colors.darkGray} style={styles.inputIcon} />
          <TextInput
            style={styles.textArea}
            placeholder="Allergies (comma separated)"
            value={allergies}
            onChangeText={setAllergies}
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          fullWidth
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Save Patient"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.subtext,
  },
  formSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: Colors.text,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  genderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    color: Colors.text,
    marginRight: 12,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  selectedGender: {
    backgroundColor: Colors.primary,
  },
  genderText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedGenderText: {
    color: 'white',
    fontWeight: '500',
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  textArea: {
    flex: 1,
    minHeight: 80,
    color: Colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 8,
  },
  buttonSpacer: {
    height: 12,
  },
});