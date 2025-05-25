import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TOKEN_KEY } from './config';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            // Initialize headers if they don't exist
            config.headers = config.headers || {};
            
            // Get token asynchronously
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            console.error('Error getting token:', error);
            return config;
        }
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                await AsyncStorage.removeItem(TOKEN_KEY);
                // You might want to use navigation here instead of window.location
                // navigation.navigate('Login');
            } catch (storageError) {
                console.error('Error removing token:', storageError);
            }
        }
        return Promise.reject(error);
    }
);

export default api; 