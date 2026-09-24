import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeSlot } from '../../types/booking';
import { colors } from '../../constants/colors';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: TimeSlot) => void;
  userOverlappingSlotIds?: string[];
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  userOverlappingSlotIds = [],
}) => {
  const morningSlots = slots.filter((s) => s.period === 'morning');
  const afternoonSlots = slots.filter((s) => s.period === 'afternoon');
  const eveningSlots = slots.filter((s) => s.period === 'evening');

  const renderSlotItem = (slot: TimeSlot) => {
    const isSelected = slot.id === selectedSlotId;
    const isOccupied = slot.isOccupied;
    const isUserOverlap = userOverlappingSlotIds.includes(slot.id);

    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.slotItem,
          isOccupied && styles.slotOccupied,
          isSelected && styles.slotSelected,
          isUserOverlap && !isOccupied && styles.slotConflict,
        ]}
        onPress={() => onSelectSlot(slot)}
        disabled={isOccupied}
        activeOpacity={0.8}
      >
        <View style={styles.slotHeader}>
          <Text
            style={[
              styles.slotTime,
              isSelected && styles.slotTextSelected,
              isOccupied && styles.slotTextOccupied,
            ]}
          >
            {slot.label}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
          )}
          {isOccupied && (
            <Ionicons name="lock-closed" size={13} color={colors.textMuted} />
          )}
        </View>

        <View style={styles.slotFooter}>
          {isOccupied ? (
            <Text style={styles.occupiedLabel}>Booked</Text>
          ) : isUserOverlap ? (
            <Text style={styles.conflictLabel}>Conflict</Text>
          ) : (
            <Text style={[styles.availableLabel, isSelected && styles.slotTextSelected]}>
              Available
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F1F5F9', borderColor: colors.border }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E2E8F0' }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
      </View>

      {/* Morning Slots */}
      {morningSlots.length > 0 && (
        <View style={styles.section}>
          <View style={styles.periodHeader}>
            <Ionicons name="sunny-outline" size={16} color="#F59E0B" />
            <Text style={styles.periodTitle}>Morning</Text>
          </View>
          <View style={styles.slotsGrid}>
            {morningSlots.map(renderSlotItem)}
          </View>
        </View>
      )}

      {/* Afternoon Slots */}
      {afternoonSlots.length > 0 && (
        <View style={styles.section}>
          <View style={styles.periodHeader}>
            <Ionicons name="partly-sunny-outline" size={16} color="#EA580C" />
            <Text style={styles.periodTitle}>Afternoon</Text>
          </View>
          <View style={styles.slotsGrid}>
            {afternoonSlots.map(renderSlotItem)}
          </View>
        </View>
      )}

      {/* Evening Slots */}
      {eveningSlots.length > 0 && (
        <View style={styles.section}>
          <View style={styles.periodHeader}>
            <Ionicons name="moon-outline" size={15} color="#6366F1" />
            <Text style={styles.periodTitle}>Evening</Text>
          </View>
          <View style={styles.slotsGrid}>
            {eveningSlots.map(renderSlotItem)}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  periodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotOccupied: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.65,
  },
  slotConflict: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  slotTextOccupied: {
    color: colors.textMuted,
  },
  slotFooter: {
    marginTop: 2,
  },
  availableLabel: {
    fontSize: 11,
    color: colors.available,
    fontWeight: '600',
  },
  occupiedLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  conflictLabel: {
    fontSize: 11,
    color: colors.occupied,
    fontWeight: '700',
  },
});

