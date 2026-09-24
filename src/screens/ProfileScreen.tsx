import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { shadows } from '../constants/theme';
import { useUserStore } from '../store/useUserStore';

export const ProfileScreen: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [autoReminderEnabled, setAutoReminderEnabled] = React.useState(true);

  const quotaPercent = Math.min(100, Math.round((user.dailySlotsUsed / user.dailySlotsQuota) * 100));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={[styles.profileCard, shadows.card]}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.studentId}>ID: {user.studentId}</Text>
          <Text style={styles.department}>{user.department}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      {/* Daily Booking Quota Tracker */}
      <View style={[styles.sectionCard, shadows.card]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Daily Booking Quota</Text>
        </View>

        <View style={styles.quotaRow}>
          <Text style={styles.quotaLabel}>Today's Reserved Slots</Text>
          <Text style={styles.quotaFraction}>
            {user.dailySlotsUsed} / {user.dailySlotsQuota} slots
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${quotaPercent}%` },
              quotaPercent >= 100 && { backgroundColor: colors.occupied },
            ]}
          />
        </View>

        <Text style={styles.quotaHint}>
          {user.dailySlotsQuota - user.dailySlotsUsed > 0
            ? `You have ${user.dailySlotsQuota - user.dailySlotsUsed} more booking slots available today.`
            : 'You have reached the maximum daily limit (3 slots).'}
        </Text>
      </View>

      {/* Notification Preferences */}
      <View style={[styles.sectionCard, shadows.card]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingTextWrap}>
            <Text style={styles.settingTitle}>Booking Confirmations</Text>
            <Text style={styles.settingDesc}>Receive app alerts when reservations succeed</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E2E8F0', true: colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingTextWrap}>
            <Text style={styles.settingTitle}>15-Minute Check-in Reminder</Text>
            <Text style={styles.settingDesc}>Notify before slot start to avoid room forfeiture</Text>
          </View>
          <Switch
            value={autoReminderEnabled}
            onValueChange={setAutoReminderEnabled}
            trackColor={{ false: '#E2E8F0', true: colors.primary }}
          />
        </View>
      </View>

      {/* University Campus Room Rules */}
      <View style={[styles.sectionCard, shadows.card]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>VKU Room Policies</Text>
        </View>

        <View style={styles.ruleItem}>
          <Ionicons name="time-outline" size={16} color={colors.primary} style={styles.ruleIcon} />
          <Text style={styles.ruleText}>
            Check in within 15 minutes of slot start time or the slot will automatically release.
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <Ionicons name="close-circle-outline" size={16} color={colors.secondary} style={styles.ruleIcon} />
          <Text style={styles.ruleText}>
            Cancellations must be made at least 30 minutes prior to slot start.
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <Ionicons name="wine-outline" size={16} color="#EA580C" style={styles.ruleIcon} />
          <Text style={styles.ruleText}>
            No uncovered food or beverages in computer laboratories and quiet study zones.
          </Text>
        </View>
      </View>

      {/* Support & Version */}
      <View style={styles.supportBox}>
        <Text style={styles.supportText}>VKU Campus Room Booking System v1.0.0</Text>
        <Text style={styles.supportSub}>IT Support: support@vku.udn.vn | Ext: 104</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#CBD5E1',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  studentId: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  department: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  email: {
    fontSize: 11,
    color: colors.textMuted,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quotaLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  quotaFraction: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  quotaHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  ruleIcon: {
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  supportBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  supportText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  supportSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});

