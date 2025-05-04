import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity, ArrowDown, ArrowUp, Minus } from 'lucide-react-native';
import Colors from '@/constants/colors';

type MetricCardProps = {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
};

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend = 'neutral',
  icon
}) => {
  const renderTrendIcon = () => {
    if (trend === 'up') {
      return <ArrowUp size={16} color={Colors.success} />;
    } else if (trend === 'down') {
      return <ArrowDown size={16} color={Colors.error} />;
    } else {
      return <Minus size={16} color={Colors.darkGray} />;
    }
  };

  const getTrendColor = () => {
    if (trend === 'up') {
      return Colors.success;
    } else if (trend === 'down') {
      return Colors.error;
    } else {
      return Colors.darkGray;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon || <Activity size={20} color={Colors.primary} />}
      </View>
      <Text style={styles.value}>{value}</Text>
      {change !== undefined && (
        <View style={styles.trendContainer}>
          {renderTrendIcon()}
          <Text style={[styles.change, { color: getTrendColor() }]}>
            {change > 0 ? `+${change}` : change}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minWidth: '45%',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: Colors.subtext,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default MetricCard;