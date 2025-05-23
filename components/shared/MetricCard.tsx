import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import type { ChartData } from 'react-native-chart-kit/dist/HelperTypes';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  chartType?: string;
  chartData: ChartData;
  indicatorColor: string;
  highlightIndex: number;
  tooltip: string;
}

const pastelColors = [
  '#90CAF9', '#B2DFDB', '#FFE082', '#FFCCBC', '#D1C4E9', '#F8BBD0', '#C8E6C9'
];

const getIndicatorIcon = (trend: 'up' | 'down' | 'neutral', color: string) => {
  if (trend === 'up') return <ArrowUp size={16} color={color || '#388E3C'} />;
  if (trend === 'down') return <ArrowDown size={16} color={color || '#D32F2F'} />;
  return <Minus size={16} color={color || '#90A4AE'} />;
};

const getTrendColor = (trend: 'up' | 'down' | 'neutral', color: string) => {
  if (trend === 'up') return color || '#388E3C';
  if (trend === 'down') return color || '#D32F2F';
  return color || '#90A4AE';
};

const getBarColors = (count: number, highlightIndex: number) =>
  Array(count).fill(0).map((_, i) =>
    i === highlightIndex ? '#1976D2' : pastelColors[i % pastelColors.length]
  );

const chartWidth = Math.min(Dimensions.get('window').width * 0.85, 340);
const chartHeight = 180;

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 32, 91, ${opacity})`,
  labelColor: () => 'rgba(0, 32, 91, 0.8)',
  strokeWidth: 3,
  style: {
    borderRadius: 16,
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: "rgba(0, 32, 91, 0.1)",
  },
  propsForLabels: {
    fontSize: 12,
    fontWeight: '600',
  },
  propsForVerticalLabels: {
    fontWeight: '600',
  },
  propsForHorizontalLabels: {
    fontWeight: '600',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend = 'neutral',
  chartType = 'line',
  chartData,
  indicatorColor,
  highlightIndex,
  tooltip
}) => {
  const renderChart = () => {
    if (!chartData) return null;
    if (chartType === 'bar') {
      return (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          fromZero
          withInnerLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          showBarTops={false}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={{
            marginVertical: 12,
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            padding: 12,
            paddingBottom: 24,
          }}
          flatColor={true}
        />
      );
    }
    // Default to line chart
    return (
      <LineChart
        data={chartData}
        width={chartWidth}
        height={chartHeight}
        fromZero
        withInnerLines={true}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withDots={true}
        withShadow={false}
        chartConfig={{
          ...chartConfig,
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#FFFFFF",
            fill: "rgba(0, 32, 91, 1)",
          },
        }}
        bezier
        style={{
          marginVertical: 12,
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          padding: 12,
          paddingBottom: 24,
        }}
      />
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#002B5B' }]}>{title}</Text>
        {getIndicatorIcon(trend, indicatorColor)}
      </View>
      <Text style={[styles.value, { color: '#002B5B' }]}>{value}</Text>
      <View style={styles.trendContainer}>
        <Text style={[styles.trendText, { color: getTrendColor(trend, indicatorColor) }]}> 
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''}
        </Text>
      </View>
      <View style={[styles.chartContainer, { marginTop: 16 }]}>{renderChart()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    width: '92%',
    marginBottom: 16,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 2,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 0,
    marginTop: 8,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});