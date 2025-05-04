import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

type FilterChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected ? styles.selectedChip : styles.unselectedChip,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.label,
          isSelected ? styles.selectedLabel : styles.unselectedLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  unselectedChip: {
    backgroundColor: Colors.lightGray,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLabel: {
    color: 'white',
  },
  unselectedLabel: {
    color: Colors.darkGray,
  },
});

export default FilterChip;