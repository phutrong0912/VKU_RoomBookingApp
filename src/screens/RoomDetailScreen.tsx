import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { TimeSlot, ConflictCheckResult } from '../types/booking';
import { colors } from '../constants/colors';
import { useRoomDetailQuery, useRoomSlotsQuery } from '../hooks/useRooms';
import { useBookingsQuery, useCreateBookingMutation } from '../hooks/useBookings';
import { useUserStore } from '../store/useUserStore';
import { useBookingStore } from '../store/useBookingStore';
import { StatusBadge } from '../components/common/StatusBadge';
import { DateSelector } from '../components/booking/DateSelector';
import { TimeSlotGrid } from '../components/booking/TimeSlotGrid';
import { ConflictAlertBanner } from '../components/booking/ConflictAlertBanner';
import { BookingSummaryModal } from '../components/booking/BookingSummaryModal';
import { validateBookingConflict } from '../utils/conflictValidator';

type ScreenRouteProp = RouteProp<RootStackParamList, 'RoomDetail'>;
type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavigationProp>();
  const { roomId } = route.params;

  const user = useUserStore((s) => s.user);
  const { selectedDate, setSelectedDate, resetDraft } = useBookingStore();

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // TanStack Queries
  const { data: room, isLoading: isRoomLoading } = useRoomDetailQuery(roomId);
  const { data: slots = [], isLoading: isSlotsLoading } = useRoomSlotsQuery(roomId, selectedDate);
  const { data: userBookings = [] } = useBookingsQuery(user.id);

  // Mutation
  const createBookingMutation = useCreateBookingMutation();

  // Find user's existing bookings for the selected date to mark conflict indicators
  const userOverlappingSlotIds = useMemo(() => {
    return userBookings
      .filter((b) => b.status === 'confirmed' && b.date === selectedDate)
      .map((b) => b.slotId);
  }, [userBookings, selectedDate]);

  // Conflict validation for the currently selected slot
  const currentConflictResult = useMemo<ConflictCheckResult | null>(() => {
    if (!selectedSlot) return null;
    return validateBookingConflict({
      targetSlot: selectedSlot,
      userBookings,
      userProfile: user,
      date: selectedDate,
    });
  }, [selectedSlot, userBookings, user, selectedDate]);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleOpenConfirm = () => {
    if (!selectedSlot) {
      Alert.alert('Select a Slot', 'Please choose an available time slot before continuing.');
      return;
    }

    if (currentConflictResult?.hasConflict) {
      Alert.alert('Booking Conflict', currentConflictResult.reason);
      return;
    }

    setIsModalVisible(true);
  };

  const handleConfirmReservation = async (details: {
    purpose: string;
    attendeesCount: number;
  }) => {
    if (!selectedSlot || !room) return;

    try {
      const newBooking = await createBookingMutation.mutateAsync({
        payload: {
          roomId: room.id,
          slotId: selectedSlot.id,
          date: selectedDate,
          purpose: details.purpose,
          attendeesCount: details.attendeesCount,
        },
        userProfile: user,
      });

      setIsModalVisible(false);
      resetDraft();
      setSelectedSlot(null);

      // Navigate to booking success pass
      navigation.navigate('BookingSuccess', { bookingId: newBooking.id });
    } catch (err: any) {
      Alert.alert('Reservation Failed', err?.message || 'Could not complete booking.');
    }
  };

  if (isRoomLoading || !room) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>Loading room details...</Text>
      </View>
    );
  }

  const isBookButtonDisabled =
    !selectedSlot || selectedSlot.isOccupied || Boolean(currentConflictResult?.hasConflict);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Photo Gallery Header */}
        <View style={styles.imageBox}>
          <Image source={{ uri: room.imageUrl }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Room Header Info */}
        <View style={styles.infoCard}>
          <View style={styles.roomHeaderRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.roomCode}>{room.code}</Text>
              <Text style={styles.roomName}>{room.name}</Text>
            </View>
            <StatusBadge status={room.status} />
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>📍 {room.building} ({room.floor})</Text>
            <Text style={styles.metaItem}>👥 {room.capacity} seats</Text>
            <Text style={styles.metaItem}>⭐ {room.rating} / 5.0</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{room.description}</Text>

          {/* Amenities Chips */}
          <View style={styles.amenitiesSection}>
            <Text style={styles.subTitle}>Equipment & Amenities</Text>
            <View style={styles.amenitiesList}>
              {room.amenities.map((amenity) => (
                <View key={amenity} style={styles.amenityBadge}>
                  <Ionicons name="checkmark-done" size={14} color={colors.primary} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rules */}
          {room.rules.length > 0 && (
            <View style={styles.rulesSection}>
              <Text style={styles.subTitle}>Room Guidelines</Text>
              {room.rules.map((rule, idx) => (
                <View key={idx} style={styles.ruleItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Time-Slot Booking Section */}
        <View style={styles.bookingSection}>
          <View style={styles.bookingHeader}>
            <Text style={styles.sectionHeaderTitle}>Reserve a Time Slot</Text>
            <Text style={styles.sectionHeaderSubtitle}>
              Conflict prevention active
            </Text>
          </View>

          {/* Horizontal Date Selector */}
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null);
            }}
          />

          {/* Conflict Alert Banner if any */}
          <ConflictAlertBanner conflictResult={currentConflictResult} />

          {/* Time Slot Grid */}
          {isSlotsLoading ? (
            <View style={styles.slotsLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.slotsLoadingText}>Checking live availability...</Text>
            </View>
          ) : (
            <TimeSlotGrid
              slots={slots}
              selectedSlotId={selectedSlot ? selectedSlot.id : null}
              onSelectSlot={handleSlotSelect}
              userOverlappingSlotIds={userOverlappingSlotIds}
            />
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.summarySlotWrap}>
          <Text style={styles.summaryLabel}>Selected Slot</Text>
          <Text style={styles.summaryValue}>
            {selectedSlot ? selectedSlot.label : 'None chosen'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.bookBtn, isBookButtonDisabled && styles.bookBtnDisabled]}
          onPress={handleOpenConfirm}
          disabled={isBookButtonDisabled}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>
            {selectedSlot?.isOccupied
              ? 'Slot Booked'
              : currentConflictResult?.hasConflict
              ? 'Conflict'
              : 'Reserve Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking Summary Confirmation Modal */}
      {room && (
        <BookingSummaryModal
          visible={isModalVisible}
          room={room}
          slot={selectedSlot}
          user={user}
          isLoading={createBookingMutation.isPending}
          onClose={() => setIsModalVisible(false)}
          onConfirm={handleConfirmReservation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  imageBox: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: '#CBD5E1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  roomCode: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  amenitiesSection: {
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rulesSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    marginRight: 6,
    color: colors.primary,
    fontSize: 14,
  },
  ruleText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  bookingSection: {
    backgroundColor: colors.surface,
    marginTop: 10,
    paddingTop: 16,
    paddingBottom: 24,
  },
  bookingHeader: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  slotsLoading: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  slotsLoadingText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  summarySlotWrap: {
    flex: 1,
    marginRight: 16,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

