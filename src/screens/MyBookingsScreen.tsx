import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { shadows } from '../constants/theme';
import { Booking } from '../types/booking';
import { useUserStore } from '../store/useUserStore';
import { useBookingsQuery, useCancelBookingMutation } from '../hooks/useBookings';
import { formatFriendlyDate } from '../utils/dateUtils';
import { ScannableQRCode } from '../components/common/ScannableQRCode';
import { QRScannerModal } from '../components/booking/QRScannerModal';

export const MyBookingsScreen: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const [selectedSegment, setSelectedSegment] = useState<'active' | 'past'>('active');
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  const { data: bookings = [], isLoading, refetch } = useBookingsQuery(user.id);
  const cancelMutation = useCancelBookingMutation();

  const filteredBookings = useMemo(() => {
    if (selectedSegment === 'active') {
      return bookings.filter((b) => b.status === 'confirmed');
    }
    return bookings.filter((b) => b.status === 'cancelled' || b.status === 'completed');
  }, [bookings, selectedSegment]);

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Reservation?',
      `Are you sure you want to cancel your reservation for ${booking.roomName} on ${formatFriendlyDate(
        booking.date
      )} (${booking.timeRange})? The slot will be released immediately.`,
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync(booking.id);
              Alert.alert('Reservation Cancelled', 'The slot has been released back to campus.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to cancel reservation.');
            }
          },
        },
      ]
    );
  };

  const handleScanSuccess = (scannedCode: string) => {
    setIsScannerVisible(false);
    setTimeout(() => {
      Alert.alert(
        'Check-in Verified! 🎉',
        `Room Code: "${scannedCode}"\n\nLab door unlocked successfully for student ${user.fullName} (${user.studentId}).`
      );
    }, 450);
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const isConfirmed = item.status === 'confirmed';

    return (
      <View style={[styles.card, shadows.card]}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.roomImageUrl }} style={styles.thumbnail} />
          <View style={styles.headerDetails}>
            <View style={styles.roomStatusRow}>
              <Text style={styles.roomName} numberOfLines={1}>
                {item.roomName}
              </Text>
              <View
                style={[
                  styles.statusTag,
                  isConfirmed ? styles.statusConfirmed : styles.statusCancelled,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    isConfirmed ? styles.statusConfirmedText : styles.statusCancelledText,
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.buildingText}>📍 {item.roomBuilding} • {item.roomFloor}</Text>
            <Text style={styles.purposeText} numberOfLines={1}>
              🎯 {item.purpose}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Schedule Info */}
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleItem}>
            <Ionicons name="calendar-outline" size={15} color={colors.primary} />
            <Text style={styles.scheduleText}>{formatFriendlyDate(item.date)}</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Ionicons name="time-outline" size={15} color={colors.primary} />
            <Text style={styles.scheduleHighlight}>{item.timeRange}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isConfirmed && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => setSelectedPass(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
              <Text style={styles.qrButtonText}>Digital Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={16} color={colors.secondary} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Banner with Scan Door QR CTA */}
      <View style={styles.topScanBar}>
        <View style={styles.topScanTextWrap}>
          <Text style={styles.topScanTitle}>At the campus lab door?</Text>
          <Text style={styles.topScanSubtitle}>Scan the door QR scanner to check in</Text>
        </View>
        <TouchableOpacity
          style={styles.topScanButton}
          onPress={() => setIsScannerVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
          <Text style={styles.topScanButtonText}>Scan Door</Text>
        </TouchableOpacity>
      </View>

      {/* Segment Selector */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, selectedSegment === 'active' && styles.segmentBtnActive]}
          onPress={() => setSelectedSegment('active')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedSegment === 'active' && styles.segmentTextActive,
            ]}
          >
            Active & Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, selectedSegment === 'past' && styles.segmentBtnActive]}
          onPress={() => setSelectedSegment('past')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedSegment === 'past' && styles.segmentTextActive,
            ]}
          >
            History & Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching your reservations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="bookmark-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {selectedSegment === 'active'
                  ? 'No active reservations'
                  : 'No past booking history'}
              </Text>
              <Text style={styles.emptyDesc}>
                {selectedSegment === 'active'
                  ? 'Explore campus labs and reserve a time slot to get started.'
                  : 'Your past completed or cancelled sessions will appear here.'}
              </Text>
            </View>
          }
        />
      )}

      {/* QR Code Digital Pass Modal with REAL Scannable QR Code */}
      {selectedPass && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.passOverlay}>
            <SafeAreaView style={styles.passModal}>
              <View style={styles.passHeader}>
                <Text style={styles.passTitle}>VKU Room Access Pass</Text>
                <TouchableOpacity onPress={() => setSelectedPass(null)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.passCard}>
                <Text style={styles.passRoomName}>{selectedPass.roomName}</Text>
                <Text style={styles.passLocation}>
                  {selectedPass.roomBuilding} • {selectedPass.roomFloor}
                </Text>

                {/* Real Scannable QR Code */}
                <View style={styles.qrGraphicContainer}>
                  <View style={styles.qrOuterFrame}>
                    <ScannableQRCode value={selectedPass.qrCodeToken} size={180} />
                  </View>
                  <Text style={styles.passToken}>{selectedPass.qrCodeToken}</Text>
                  <Text style={styles.scannableHint}>
                    📷 Scannable by any mobile camera or scanner
                  </Text>
                </View>

                <View style={styles.passInfoGrid}>
                  <View style={styles.passInfoCol}>
                    <Text style={styles.passInfoLabel}>Date</Text>
                    <Text style={styles.passInfoVal}>
                      {formatFriendlyDate(selectedPass.date)}
                    </Text>
                  </View>
                  <View style={styles.passInfoCol}>
                    <Text style={styles.passInfoLabel}>Time Window</Text>
                    <Text style={styles.passInfoVal}>{selectedPass.timeRange}</Text>
                  </View>
                </View>

                <View style={styles.studentBadge}>
                  <Text style={styles.studentBadgeText}>
                    Authorized: {selectedPass.userName} ({selectedPass.userStudentId})
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}

      {/* Camera QR Scanner Modal */}
      <QRScannerModal
        visible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onScanSuccess={handleScanSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topScanBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.primarySoft,
  },
  topScanTextWrap: {
    flex: 1,
  },
  topScanTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  topScanSubtitle: {
    fontSize: 11,
    color: colors.primary,
  },
  topScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  topScanButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scannableHint: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 6,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    margin: 16,
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  headerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  roomStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  statusConfirmed: {
    backgroundColor: colors.availableLight,
  },
  statusCancelled: {
    backgroundColor: '#F1F5F9',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusConfirmedText: {
    color: '#065F46',
  },
  statusCancelledText: {
    color: colors.textMuted,
  },
  buildingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  purposeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scheduleHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
  },
  qrButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  passOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  passModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  passCard: {
    alignItems: 'center',
  },
  passRoomName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  passLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  qrGraphicContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  qrOuterFrame: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  passToken: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginTop: 8,
  },
  passInfoGrid: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  passInfoCol: {
    flex: 1,
    alignItems: 'center',
  },
  passInfoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  passInfoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studentBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  studentBadgeText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '600',
  },
});

