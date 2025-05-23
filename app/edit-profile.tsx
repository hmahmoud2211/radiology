import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/store/authStore';
import { Picker } from '@react-native-picker/picker';

const GENDERS = ['Male', 'Female'];
const ROLES = ['Radiologist', 'MRI Tech', 'Admin'];
const DEPARTMENTS = ['Radiology', 'MRI', 'CT', 'Ultrasound', 'Admin'];
const SPECIALIZATIONS = ['Chest CT', 'Pediatric MRI', 'Neuro', 'Musculoskeletal', 'Abdominal', 'Cardiac'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY'];
const TIME_FORMATS = ['12-hour', '24-hour'];
const NOTIF_PREFS = ['Email', 'Push', 'SMS'];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  // Personal
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  // Professional
  const [role, setRole] = useState(user?.role || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [facility, setFacility] = useState(user?.facility || '');
  const [license, setLicense] = useState(user?.license || '');
  const [yearsExp, setYearsExp] = useState(user?.yearsExp ? String(user.yearsExp) : '');
  const [specializations, setSpecializations] = useState(user?.specializations || []);
  const [npi, setNpi] = useState(user?.npi || '');
  // Preferences
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('24-hour');
  const [notifPref, setNotifPref] = useState('Email');
  // Security
  const [username, setUsername] = useState(user?.username || '');
  const [secondaryEmail, setSecondaryEmail] = useState(user?.secondaryEmail || '');
  const [twoFA, setTwoFA] = useState(user?.twoFA || false);

  // Validation helpers
  const isNameValid = fullName === user?.fullName || /^[A-Za-z ]+$/.test(fullName);
  const isPhoneValid = phone === user?.phone || /^\+?\d{10,15}$/.test(phone);
  const isEmailValid = email === user?.email || /^[^@]+@[^@]+\.[^@]+$/.test(email);
  const isLicenseValid = license === user?.license || license === '' || /^[A-Za-z0-9-]+$/.test(license);
  const isYearsExpValid = yearsExp === user?.yearsExp?.toString() || yearsExp === '' || (/^\d+$/.test(yearsExp) && Number(yearsExp) >= 0 && Number(yearsExp) <= 50);

  // Image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setProfilePic(result.assets[0].uri);
  };

  // Date picker
  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  // Multi-select for specializations
  const toggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  // Save handler
  const handleSave = () => {
    // Only validate and update changed fields
    const updates: Partial<User> = {};
    if (fullName !== user?.fullName) {
      if (!isNameValid) return Alert.alert('Invalid name', 'Name must only contain letters and spaces.');
      updates.fullName = fullName;
    }
    if (profilePic !== user?.profilePic) updates.profilePic = profilePic;
    if ((dob ? dob.toISOString() : null) !== user?.dob) updates.dob = dob ? dob.toISOString() : null;
    if (gender !== user?.gender) updates.gender = gender;
    if (phone !== user?.phone) {
      if (!isPhoneValid) return Alert.alert('Invalid phone', 'Enter a valid phone number.');
      updates.phone = phone;
    }
    if (email !== user?.email) {
      if (!isEmailValid) return Alert.alert('Invalid email', 'Enter a valid email address.');
      updates.email = email;
    }
    if (address !== user?.address) updates.address = address;
    if (department !== user?.department) updates.department = department;
    if (facility !== user?.facility) updates.facility = facility;
    if (license !== user?.license) {
      if (!isLicenseValid) return Alert.alert('Invalid license', 'License must be alphanumeric.');
      updates.license = license;
    }
    if (yearsExp !== (user?.yearsExp ? String(user.yearsExp) : '')) {
      if (!isYearsExpValid) return Alert.alert('Invalid experience', 'Enter a valid number of years.');
      updates.yearsExp = yearsExp ? Number(yearsExp) : undefined;
    }
    if (JSON.stringify(specializations) !== JSON.stringify(user?.specializations)) updates.specializations = specializations;
    if (npi !== user?.npi) updates.npi = npi;
    if (secondaryEmail !== user?.secondaryEmail) updates.secondaryEmail = secondaryEmail;
    if (twoFA !== user?.twoFA) updates.twoFA = twoFA;
    if (role !== user?.role) updates.role = role;
    if (Object.keys(updates).length === 0) {
      Alert.alert('No changes', 'No fields were changed.');
      return;
    }
    updateUser(updates);
    Alert.alert('Profile updated!', 'Your changes have been saved.');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f5f5f5' }}>
      {/* Personal Information */}
      <View style={[styles.sectionCard, { marginBottom: 24 }]}>
        <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 16 }}>Personal Information</Text>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={profilePic ? { uri: profilePic } : { uri: 'https://ui-avatars.com/api/?name=User' }}
            style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' }}
          />
        </View>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.readOnlyField}>{fullName}</Text>
        <Text style={styles.label}>Date of Birth</Text>
        <Text style={styles.readOnlyField}>{dob ? dob.toLocaleDateString() : ''}</Text>
        <Text style={styles.label}>Gender</Text>
        <Text style={styles.readOnlyField}>{gender}</Text>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={[styles.input, { color: '#000' }]}
          keyboardType="phone-pad"
          accessibilityLabel="Phone Number"
          maxLength={18}
          placeholder="Phone Number"
          placeholderTextColor="#888"
        />
        {!isPhoneValid && phone.length > 0 && <Text style={styles.error}>Enter a valid phone number.</Text>}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          value={email}
          onChangeText={(val) => {
            if (val !== user?.email) {
              // TODO: Trigger OTP confirmation modal here
            }
            setEmail(val);
          }}
          style={styles.input}
          keyboardType="email-address"
          accessibilityLabel="Email Address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Email Address"
        />
        {!isEmailValid && email.length > 0 && <Text style={styles.error}>Enter a valid email address.</Text>}
        <Text style={styles.label}>Address (Optional)</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          accessibilityLabel="Street Address"
          placeholder="Street Address"
        />
      </View>

      {/* Professional Information */}
      <View style={[styles.sectionCard, { marginBottom: 24 }]}>
        <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 16 }}>Professional Information</Text>
        <Text style={styles.label}>Job Title/Role</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={role}
            onValueChange={setRole}
            style={{ color: '#000' }}
          >
            {ROLES.map((r) => (
              <Picker.Item key={r} label={r} value={r} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Department</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={department}
            onValueChange={setDepartment}
            style={{ color: '#000' }}
          >
            {DEPARTMENTS.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Medical License Number</Text>
        <Text style={styles.readOnlyField}>{license}</Text>
        <Text style={styles.label}>Years of Experience</Text>
        <Text style={styles.readOnlyField}>{yearsExp}</Text>
        <Text style={styles.label}>NPI or Registration ID</Text>
        <Text style={styles.readOnlyField}>{npi}</Text>
      </View>

      {/* App Preferences */}
      <View style={[styles.sectionCard, { marginBottom: 24 }]}>
        <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 16 }}>App Preferences</Text>
        <Text style={styles.label}>Preferred Language</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={language}
            onValueChange={setLanguage}
            style={{ color: '#000' }}
          >
            {LANGUAGES.map((l) => (
              <Picker.Item key={l} label={l} value={l} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Preferred Date Format</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={dateFormat}
            onValueChange={setDateFormat}
            style={{ color: '#000' }}
          >
            {DATE_FORMATS.map((f) => (
              <Picker.Item key={f} label={f} value={f} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Time Format</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={timeFormat}
            onValueChange={setTimeFormat}
            style={{ color: '#000' }}
          >
            {TIME_FORMATS.map((f) => (
              <Picker.Item key={f} label={f} value={f} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>Notification Preference</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={notifPref}
            onValueChange={setNotifPref}
            style={{ color: '#000' }}
          >
            {NOTIF_PREFS.map((n) => (
              <Picker.Item key={n} label={n} value={n} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Security & Credentials */}
      <View style={[styles.sectionCard, { marginBottom: 24 }]}>
        <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 16 }}>Security & Credentials</Text>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          accessibilityLabel="Username"
        />
        <TextInput
          placeholder="Secondary Email (Optional)"
          value={secondaryEmail}
          onChangeText={setSecondaryEmail}
          style={styles.input}
          keyboardType="email-address"
          accessibilityLabel="Secondary Email"
        />
        <View style={styles.row}>
          <Text style={styles.label}>Two-Factor Authentication (2FA)</Text>
          <TouchableOpacity onPress={() => setTwoFA((v) => !v)} style={[styles.chip, twoFA && styles.chipSelected]}>
            <Text style={twoFA ? styles.chipTextSelected : styles.chipText}>{twoFA ? 'Enabled' : 'Disabled'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save/Cancel */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => { /* navigation.goBack() */ }}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles: { [key: string]: any } = {
  sectionTitle: { fontWeight: '700' as const, fontSize: 18, marginTop: 24, marginBottom: 8 },
  avatarRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 16, gap: 16 },
  input: { marginBottom: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10 },
  label: { fontWeight: '600' as const, marginTop: 8, marginBottom: 4 },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const, flexWrap: 'wrap' as const, gap: 8, marginBottom: 8 },
  rowWrap: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: '#1976D2', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: '#1976D2' },
  chipText: { color: '#1976D2', fontWeight: '500' as const },
  chipTextSelected: { color: '#fff', fontWeight: '600' as const },
  error: { color: '#D32F2F', marginBottom: 8 },
  link: { color: '#1976D2', fontWeight: '600' as const, marginLeft: 12 },
  buttonRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginTop: 24, gap: 16 },
  saveBtn: { backgroundColor: '#1976D2', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32 },
  saveBtnText: { color: '#fff', fontWeight: '700' as const, fontSize: 16 },
  cancelBtn: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32, borderWidth: 1, borderColor: '#1976D2' },
  cancelBtnText: { color: '#1976D2', fontWeight: '700' as const, fontSize: 16 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  readOnlyField: { backgroundColor: '#f0f0f0', color: '#888', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
}; 