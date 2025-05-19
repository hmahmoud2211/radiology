import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEquipmentStore } from '@/store/equipmentStore';
import { Alert as AlertType } from '@/types/equipment';
import { useTheme } from '@/theme';

interface AlertListProps {
  onAlertPress?: (alert: AlertType) => void;
}

export const AlertList: React.FC<AlertListProps> = ({ onAlertPress }) => {
  const theme = useTheme();
  const { alerts, updateAlertStatus, deleteAlert, getEquipmentById, getConsumableById } = useEquipmentStore();

  const importantAlerts = Object.values(alerts).filter(a => a.priority === 'high' && a.status === 'active');

  const getRelatedInfo = (alert: AlertType) => {
    const equipment = getEquipmentById(alert.relatedId);
    if (equipment) return { type: 'Equipment', name: equipment.name };
    const consumable = getConsumableById(alert.relatedId);
    if (consumable) return { type: 'Consumable', name: consumable.name };
    return { type: 'Unknown', name: '' };
  };

  const handleAlertAction = (alert: AlertType) => {
    Alert.alert(
      'Alert Action',
      'What would you like to do with this alert?',
      [
        {
          text: 'Mark as Acknowledged',
          onPress: () => updateAlertStatus(alert.id, 'acknowledged'),
        },
        {
          text: 'Mark as Resolved',
          onPress: () => updateAlertStatus(alert.id, 'resolved'),
        },
        {
          text: 'Delete',
          onPress: () => deleteAlert(alert.id),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'warning';
      case 'expiring':
        return 'event';
      case 'maintenance_due':
        return 'build';
      default:
        return 'info';
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.info;
      default:
        return theme.colors.gray;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'Low Stock';
      case 'expiring':
        return 'Expired Equipment';
      case 'maintenance_due':
        return 'Maintenance Due';
      default:
        return 'Alert';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'low_stock':
        return theme.colors.error;
      case 'expiring':
        return theme.colors.warning;
      case 'maintenance_due':
        return theme.colors.info;
      default:
        return theme.colors.gray;
    }
  };

  const renderAlert = ({ item: alert }: { item: AlertType }) => {
    const related = getRelatedInfo(alert);
    return (
      <TouchableOpacity
        style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.priority) }]}
        onPress={() => {
          if (onAlertPress) {
            onAlertPress(alert);
          } else {
            handleAlertAction(alert);
          }
        }}
      >
        <View style={styles.alertHeader}>
          <MaterialIcons
            name={getAlertIcon(alert.type)}
            size={24}
            color={getAlertColor(alert.priority)}
          />
          <View style={styles.alertContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{
                backgroundColor: getAlertTypeColor(alert.type),
                color: '#fff',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                fontSize: 12,
                fontWeight: 'bold',
                marginRight: 8,
              }}>{getAlertTypeLabel(alert.type)}</Text>
              <Text style={{
                backgroundColor: related.type === 'Equipment' ? theme.colors.info : theme.colors.secondary,
                color: '#fff',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                fontSize: 12,
                fontWeight: 'bold',
                marginRight: 8,
              }}>{related.type}</Text>
              {related.name ? (
                <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 12 }}>{related.name}</Text>
              ) : null}
            </View>
            <Text style={styles.alertTitle}>{alert.message}</Text>
            <Text style={styles.alertDate}>
              {new Date(alert.createdAt).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getAlertColor(alert.priority) }]}>
            <Text style={styles.statusText}>{alert.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={importantAlerts}
      renderItem={renderAlert}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialIcons name="notifications-off" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No alerts to display</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  alertDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 