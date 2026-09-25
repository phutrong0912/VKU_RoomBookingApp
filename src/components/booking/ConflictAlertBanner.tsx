import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { ConflictCheckResult } from '../../types/booking';

interface ConflictAlertBannerProps {
  conflictResult: ConflictCheckResult | null;
}

export const ConflictAlertBanner: React.FC<ConflictAlertBannerProps> = ({
  conflictResult,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (conflictResult?.hasConflict) {
      Animated.spring(anim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      anim.setValue(0);
    }
  }, [conflictResult, anim]);

  if (!conflictResult || !conflictResult.hasConflict) {
    return null;
  }

  const isWarning = conflictResult.type === 'QUOTA_EXCEEDED';

  return (
    <Animated.View
      style={[
        styles.container,
        isWarning ? styles.warningBox : styles.errorBox,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons
        name={isWarning ? 'warning-outline' : 'alert-circle'}
        size={20}
        color={isWarning ? '#B45309' : colors.occupied}
        style={styles.icon}
      />
      <View style={styles.textWrap}>
        <Text style={[styles.title, isWarning ? styles.warningTitle : styles.errorTitle]}>
          {conflictResult.type === 'SLOT_OCCUPIED'
            ? 'Slot Unavailable'
            : conflictResult.type === 'USER_OVERLAP'
            ? 'Schedule Overlap Detected'
            : 'Quota Notice'}
        </Text>
        <Text style={[styles.reason, isWarning ? styles.warningReason : styles.errorReason]}>
          {conflictResult.reason}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  icon: {
    marginRight: 8,
    marginTop: 1,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  errorTitle: {
    color: '#991B1B',
  },
  warningTitle: {
    color: '#92400E',
  },
  reason: {
    fontSize: 12,
    lineHeight: 16,
  },
  errorReason: {
    color: '#B91C1C',
  },
  warningReason: {
    color: '#B45309',
  },
});
