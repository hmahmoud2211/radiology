import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface NotificationBannerProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
  onClose: () => void;
}

const typeColors = {
  info: '#007AFF',
  warning: '#FF9500',
  error: '#FF3B30',
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, type = 'info', onClose }) => {
  return (
    <View style={[styles.banner, { backgroundColor: typeColors[type] }]}> 
      <MaterialIcons name={type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'} size={24} color="#fff" style={{ marginRight: 8 }} />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <MaterialIcons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  message: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    fontWeight: '600',
  },
  closeBtn: {
    marginLeft: 8,
    padding: 4,
  },
}); 