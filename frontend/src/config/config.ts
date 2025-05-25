import { Platform } from 'react-native';

// API Configuration
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:8000'; // For web browser
    } else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000'; // Android emulator
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8000'; // iOS simulator
    }
  }
  return 'http://your-production-api.com'; // Production API
};

export const API_BASE_URL = getBaseUrl();

// Storage Keys
export const TOKEN_KEY = '@auth_token';
export const USER_KEY = '@user_data';

// Environment
export const ENV = {
  development: process.env.NODE_ENV === 'development',
  production: process.env.NODE_ENV === 'production',
}; 