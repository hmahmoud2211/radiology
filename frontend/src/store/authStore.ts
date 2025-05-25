import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { TOKEN_KEY, USER_KEY } from '../config/config';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  preferences: UserPreferences;
  profilePic?: string | null;
  dob?: string | null;
  gender?: string;
  phone?: string;
  address?: string;
  department?: string;
  facility?: string;
  license?: string;
  yearsExp?: number;
  specializations?: string[];
  npi?: string;
  secondaryEmail?: string;
  twoFA?: boolean;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultStartupScreen: string;
  dataDisplayPreferences: {
    showNotifications: boolean;
    showAlerts: boolean;
    showHistory: boolean;
  };
  notificationSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    alertTypes: string[];
  };
  biometricEnabled: boolean;
  sessionTimeout: number;
}

interface AuthState {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricAvailable: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updateUser: (updates: Partial<User>) => void;
  toggleBiometric: () => Promise<void>;
  checkBiometricAvailability: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      biometricAvailable: false,

      login: async (email: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              username: email,
              password: password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
          }

          const data = await response.json();
          
          if (data.access_token) {
            const user: User = {
              id: data.user.id.toString(),
              email: data.user.email,
              username: data.user.name,
              fullName: data.user.name,
              role: data.user.role,
              preferences: {
                theme: 'system',
                language: 'en',
                defaultStartupScreen: 'home',
                dataDisplayPreferences: {
                  showNotifications: true,
                  showAlerts: true,
                  showHistory: true,
                },
                notificationSettings: {
                  pushEnabled: true,
                  emailEnabled: true,
                  alertTypes: ['critical', 'warning', 'info'],
                },
                biometricEnabled: false,
                sessionTimeout: 30,
              },
            };

            set({
              user,
              currentUser: user,
              isAuthenticated: true,
              isLoading: false,
            });

            if (rememberMe) {
              await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
            }
          }
        } catch (error: any) {
          set({
            error: error.message || 'Invalid credentials',
            isLoading: false,
          });
        }
      },

      logout: async () => {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
        set({
          user: null,
          currentUser: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUserPreferences: (preferences: Partial<UserPreferences>) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                preferences: {
                  ...state.user.preferences,
                  ...preferences,
                },
              }
            : null,
        }));
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updates,
              }
            : null,
        }));
      },

      toggleBiometric: async () => {
        const { user } = get();
        if (!user) return;

        const newBiometricEnabled = !user.preferences.biometricEnabled;
        
        if (newBiometricEnabled) {
          const { success } = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to enable biometric login',
          });
          
          if (!success) return;
        }

        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                preferences: {
                  ...state.user.preferences,
                  biometricEnabled: newBiometricEnabled,
                },
              }
            : null,
        }));
      },

      checkBiometricAvailability: async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        set({ biometricAvailable: compatible && enrolled });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 