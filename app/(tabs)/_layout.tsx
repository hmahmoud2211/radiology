import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, Users, Image, Calendar, FileText, Settings as SettingsIcon, Wrench } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Slot } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#90A4AE',
        tabBarStyle: {
          backgroundColor: '#0A2342',
          borderTopColor: '#0A2342',
        },
        headerStyle: {
          backgroundColor: '#0A2342',
        },
        headerTitleStyle: {
          color: '#fff',
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="radiology-report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="weekly-schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Tests',
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="viewer"
        options={{
          title: 'Viewer',
          tabBarIcon: ({ color }) => <Image size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="equipment"
        options={{
          title: 'Equipment',
          tabBarIcon: ({ color }) => <Wrench size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

export function Layout() {
  return <Slot />;
}