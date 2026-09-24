import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../../types/room';
import { TimeSlot, UserProfile } from '../../types/booking';
import { colors } from '../../constants/colors';
import { formatFriendlyDate } from '../../utils/dateUtils';

interface BookingSummaryModalProps {
  visible: boolean;
  room: Room;
  slot: TimeSlot | null;
  user: UserProfile;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (data: { purpose: string; attendeesCount: number }) => void;
}

const commonPurposes = [
  'Group Study',
  'Software Project',
  'Exam Preparation',
  'Research & Capstone',
  'Club Meeting',
];

export const BookingSummaryModal: React.FC<BookingSummaryModalProps> = ({
  visible,
  room,
  slot,
  user,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const [purpose, setPurpose] = useState('Group Study');
  const [attendeesCount, setAttendeesCount] = useState(2);

  if (!slot) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Confirm Room Reservation</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            {/* Room Summary Box */}
            <View style={styles.roomSummaryCard}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomLocation}>
                📍 {room.building} • {room.floor}
              </Text>

              <View style={styles.divider} />

              <View style={styles.timeSlotRow}>
                <View style={styles.timeInfo}>
                  <Text style={styles.metaLabel}>Date</Text>
                  <Text style={styles.metaValue}>{formatFriendlyDate(slot.date)}</Text>
                </View>
                <View style={styles.timeInfo}>
                  <Text style={styles.metaLabel}>Time Slot</Text>
                  <Text style={styles.metaValueHighlight}>{slot.label}</Text>
                </View>
              </View>
            </View>

            {/* Student Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booked By</Text>
              <View style={styles.userInfoBox}>
                <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
                <View style={styles.userTextWrap}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userSub}>
                    ID: {user.studentId} • {user.department}
                  </Text>
                </View>
              </View>
            </View>

            {/* Purpose Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Purpose of Booking</Text>
              <View style={styles.purposesRow}>
                {commonPurposes.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.purposeChip,
                      purpose === p && styles.purposeChipSelected,
                    ]}
                    onPress={() => setPurpose(p)}
                  >
                    <Text
                      style={[
                        styles.purposeChipText,
                        purpose === p && styles.purposeChipTextSelected,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.customPurposeInput}
                placeholder="Or type custom description..."
                placeholderTextColor={colors.textMuted}
                value={purpose}
                onChangeText={setPurpose}
              />
            </View>

            {/* Attendees Counter */}
            <View style={styles.section}>
              <View style={styles.attendeesHeader}>
                <Text style={styles.sectionTitle}>Expected Attendees</Text>
                <Text style={styles.capacityNotice}>Max capacity: {room.capacity}</Text>
              </View>

              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setAttendeesCount(Math.max(1, attendeesCount - 1))}
                >
                  <Ionicons name="remove" size={20} color={colors.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.counterValue}>
                  {attendeesCount} {attendeesCount === 1 ? 'person' : 'people'}
                </Text>

                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setAttendeesCount(Math.min(room.capacity, attendeesCount + 1))}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Campus Policy reminder */}
            <View style={styles.policyNotice}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.policyText}>
                Please check in with your VKU Student Card or QR code within 15 minutes of slot start time.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => onConfirm({ purpose, attendeesCount })}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Reservation</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 20,
  },
  roomSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  timeSlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInfo: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaValueHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  userTextWrap: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  purposesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  purposeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: colors.border,
  },
  purposeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  purposeChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  purposeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customPurposeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  attendeesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityNotice: {
    fontSize: 12,
    color: colors.textMuted,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  counterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  counterValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 90,
    textAlign: 'center',
  },
  policyNotice: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    alignItems: 'center',
  },
  policyText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

