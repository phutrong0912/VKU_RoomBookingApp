import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { RoomStatus } from '../../types/room';

interface StatusBadgeProps {
  status: RoomStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isAvailable = status === 'available';

  return (
    <View
      style={[
        styles.badge,
        isAvailable ? styles.availableBadge : styles.occupiedBadge,
        size === 'sm' && styles.badgeSm,
      ]}
    >
      <View
        style={[
          styles.dot,
          isAvailable ? styles.availableDot : styles.occupiedDot,
          size === 'sm' && styles.dotSm,
        ]}
      />
      <Text
        style={[
          styles.text,
          isAvailable ? styles.availableText : styles.occupiedText,
          size === 'sm' && styles.textSm,
        ]}
      >
        {isAvailable ? 'Available' : 'Occupied'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  availableBadge: {
    backgroundColor: colors.availableLight,
    borderColor: colors.availableBorder,
    borderWidth: 1,
  },
  occupiedBadge: {
    backgroundColor: colors.occupiedLight,
    borderColor: colors.occupiedBorder,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotSm: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  availableDot: {
    backgroundColor: colors.available,
  },
  occupiedDot: {
    backgroundColor: colors.occupied,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
  availableText: {
    color: '#065F46',
  },
  occupiedText: {
    color: '#991B1B',
  },
});

