import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isSelected,
  onPress,
  style,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected ? styles.chipSelected : styles.chipUnselected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text
        style={[
          styles.label,
          isSelected ? styles.labelSelected : styles.labelUnselected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    gap: 4,
  },
  chipUnselected: {
    backgroundColor: '#F1F5F9',
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  labelUnselected: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

