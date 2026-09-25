import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

export const RoomCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <LoadingSkeleton height={140} borderRadius={10} style={styles.imageSkeleton} />
      <View style={styles.contentSkeleton}>
        <LoadingSkeleton width="60%" height={18} style={styles.lineSkeleton} />
        <LoadingSkeleton width="40%" height={14} style={styles.lineSkeleton} />
        <LoadingSkeleton width="30%" height={14} style={styles.lineSkeleton} />
        <View style={styles.bottomSkeleton}>
          <LoadingSkeleton width="25%" height={22} borderRadius={6} />
          <LoadingSkeleton width="35%" height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  cardSkeleton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageSkeleton: {
    marginBottom: 12,
  },
  contentSkeleton: {
    gap: 8,
  },
  lineSkeleton: {
    marginBottom: 4,
  },
  bottomSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
