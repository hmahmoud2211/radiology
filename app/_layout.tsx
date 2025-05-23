import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';

import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { darkTheme, lightTheme } from '../constants/theme';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme, setTheme]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ErrorBoundary>
            <ThemeProvider value={theme === 'dark' ? darkTheme : lightTheme}>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: theme === 'dark' ? darkTheme.colors.card : lightTheme.colors.card,
                  },
                  headerTintColor: theme === 'dark' ? darkTheme.colors.text : lightTheme.colors.text,
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: "modal" }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
              </Stack>
            </ThemeProvider>
          </ErrorBoundary>
        </GestureHandlerRootView>
      </View>
    </PaperProvider>
  );
}

function RedirectToDashboard() {
  const router = require('expo-router').useRouter();
  React.useEffect(() => {
    router.replace('/(tabs)/dashboard');
  }, []);
  return null;
}

function RootLayoutNav() {
  const router = require('expo-router').useRouter();
  const { isAuthenticated } = useAuthStore();
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
