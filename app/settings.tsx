import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

interface SettingItemProps {
  icon: IconName;
  title: string;
  onPress: () => void;
  value?: string;
  showArrow?: boolean;
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, onPress, value, showArrow = true }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingItemLeft}>
      <Ionicons name={icon} size={24} color="#007AFF" style={styles.settingIcon} />
      <Text style={styles.settingTitle}>{title}</Text>
    </View>
    <View style={styles.settingItemRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#666" />}
    </View>
  </TouchableOpacity>
);

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUserPreferences, toggleBiometric, logout } = useAuthStore();

  const handleThemeChange = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(user?.preferences.theme || 'system');
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updateUserPreferences({ theme: nextTheme });
  };

  const handleLanguageChange = () => {
    // TODO: Implement language selection
    Alert.alert('Language', 'Language selection coming soon');
  };

  const handleNotificationToggle = (type: 'push' | 'email') => {
    if (!user?.preferences.notificationSettings) return;
    
    updateUserPreferences({
      notificationSettings: {
        ...user.preferences.notificationSettings,
        [type === 'push' ? 'pushEnabled' : 'emailEnabled']: 
          !user.preferences.notificationSettings[type === 'push' ? 'pushEnabled' : 'emailEnabled'],
      },
    });
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://example.com/terms');
  };

  return (
    <ScrollView style={styles.container}>
      <SettingSection title="Account & Security">
        <SettingItem
          icon="person-outline"
          title="Edit Profile"
          onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon')}
          value=""
        />
        <SettingItem
          icon="lock-closed-outline"
          title="Change Password"
          onPress={() => Alert.alert('Change Password', 'Password change coming soon')}
          value=""
        />
        <SettingItem
          icon="finger-print-outline"
          title="Biometric Login"
          onPress={toggleBiometric}
          value={user?.preferences.biometricEnabled ? 'Enabled' : 'Disabled'}
        />
        <SettingItem
          icon="time-outline"
          title="Session Timeout"
          value={`${user?.preferences.sessionTimeout} minutes`}
          onPress={() => Alert.alert('Session Timeout', 'Session timeout settings coming soon')}
        />
        <SettingItem
          icon="phone-portrait-outline"
          title="Device Management"
          onPress={() => Alert.alert('Device Management', 'Device management coming soon')}
          value=""
        />
      </SettingSection>

      <SettingSection title="App Preferences">
        <SettingItem
          icon="color-palette-outline"
          title="Theme"
          value={user?.preferences.theme}
          onPress={handleThemeChange}
        />
        <SettingItem
          icon="language-outline"
          title="Language"
          value="English"
          onPress={handleLanguageChange}
        />
        <SettingItem
          icon="home-outline"
          title="Default Startup Screen"
          value={user?.preferences.defaultStartupScreen}
          onPress={() => Alert.alert('Startup Screen', 'Startup screen settings coming soon')}
        />
      </SettingSection>

      <SettingSection title="Notifications">
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="notifications-outline" size={24} color="#007AFF" style={styles.settingIcon} />
            <Text style={styles.settingTitle}>Push Notifications</Text>
          </View>
          <Switch
            value={user?.preferences.notificationSettings.pushEnabled}
            onValueChange={() => handleNotificationToggle('push')}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="mail-outline" size={24} color="#007AFF" style={styles.settingIcon} />
            <Text style={styles.settingTitle}>Email Notifications</Text>
          </View>
          <Switch
            value={user?.preferences.notificationSettings.emailEnabled}
            onValueChange={() => handleNotificationToggle('email')}
          />
        </View>
      </SettingSection>

      <SettingSection title="Support & Help">
        <SettingItem
          icon="help-circle-outline"
          title="FAQs"
          onPress={() => Alert.alert('FAQs', 'FAQs coming soon')}
          value=""
        />
        <SettingItem
          icon="chatbubble-outline"
          title="Contact Support"
          onPress={handleContactSupport}
          value=""
        />
        <SettingItem
          icon="paper-plane-outline"
          title="Send Feedback"
          onPress={() => Alert.alert('Feedback', 'Feedback form coming soon')}
          value=""
        />
        <SettingItem
          icon="information-circle-outline"
          title="App Version"
          value="1.0.0"
          showArrow={false}
          onPress={() => {}}
        />
      </SettingSection>

      <SettingSection title="Legal">
        <SettingItem
          icon="shield-outline"
          title="Privacy Policy"
          onPress={handlePrivacyPolicy}
          value=""
        />
        <SettingItem
          icon="document-text-outline"
          title="Terms of Service"
          onPress={handleTermsOfService}
          value=""
        />
      </SettingSection>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#000',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 