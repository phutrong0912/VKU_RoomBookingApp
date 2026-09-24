import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { getUpcomingDays, DayOption } from '../../utils/dateUtils';
import { colors } from '../../constants/colors';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const days = React.useMemo(() => getUpcomingDays(7), []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Select Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day: DayOption) => {
          const isSelected = day.date === selectedDate;
          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dateCard,
                isSelected && styles.dateCardSelected,
              ]}
              onPress={() => onSelectDate(day.date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.relativeLabel,
                  isSelected && styles.textSelected,
                ]}
              >
                {day.relativeLabel}
              </Text>
              <Text
                style={[
                  styles.dateNumber,
                  isSelected && styles.textSelected,
                ]}
              >
                {day.dateNumber}
              </Text>
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.textSelected,
                ]}
              >
                {day.dayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dateCard: {
    width: 68,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  relativeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  textSelected: {
    color: '#FFFFFF',
  },
});

