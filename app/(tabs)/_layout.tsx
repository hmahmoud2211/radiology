import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, Users, Image } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.darkGray,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.card,
        },
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
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
    </Tabs>
  );
}