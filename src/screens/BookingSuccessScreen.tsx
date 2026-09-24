import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../constants/colors';
import { shadows } from '../constants/theme';
import { useBookingsQuery } from '../hooks/useBookings';
import { useUserStore } from '../store/useUserStore';
import { formatFriendlyDate } from '../utils/dateUtils';

type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingSuccess'>;
type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BookingSuccessScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavigationProp>();
  const { bookingId } = route.params;

  const user = useUserStore((s) => s.user);
  const { data: bookings = [] } = useBookingsQuery(user.id);

  const booking = bookings.find((b) => b.id === bookingId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={54} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Reservation Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your campus room time slot has been successfully reserved.
        </Text>

        {/* Pass Card */}
        {booking && (
          <View style={[styles.card, shadows.card]}>
            <Text style={styles.roomName}>{booking.roomName}</Text>
            <Text style={styles.roomLocation}>
              📍 {booking.roomBuilding} • {booking.roomFloor}
            </Text>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{formatFriendlyDate(booking.date)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Time Slot</Text>
                <Text style={styles.highlightValue}>{booking.timeRange}</Text>
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={styles.col}>
                <Text style={styles.label}>Student</Text>
                <Text style={styles.value}>{booking.userName}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Access Code</Text>
                <Text style={styles.value}>{booking.qrCodeToken}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.tipBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.tipText}>
            Bring your student ID card or present your digital QR pass at the entrance scanner.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              navigation.navigate('MainTabs', { screen: 'MyBookings' });
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              navigation.navigate('MainTabs', { screen: 'BrowseRooms' });
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Browse Other Rooms</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.available,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.available,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roomLocation: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  highlightValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 28,
    width: '100%',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});

