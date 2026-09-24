import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../../types/room';
import { colors } from '../../constants/colors';
import { shadows } from '../../constants/theme';
import { StatusBadge } from '../common/StatusBadge';

interface RoomCardProps {
  room: Room;
  onPress: (roomId: string) => void;
}

export const ROOM_CARD_HEIGHT = 280;

export const RoomCard: React.FC<RoomCardProps> = React.memo(
  ({ room, onPress }) => {
    return (
      <TouchableOpacity
        style={[styles.card, shadows.card]}
        onPress={() => onPress(room.id)}
        activeOpacity={0.88}
      >
        {/* Room Photo */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: room.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{room.type}</Text>
          </View>
        </View>

        {/* Card Content Matching Wireframe */}
        <View style={styles.content}>
          {/* Room Title */}
          <View style={styles.titleRow}>
            <Text style={styles.roomName} numberOfLines={1}>
              {room.name}
            </Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{room.rating}</Text>
            </View>
          </View>

          {/* Location Pin & Building */}
          <View style={styles.infoRow}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.infoText} numberOfLines={1}>
              {room.building} ({room.floor})
            </Text>
          </View>

          {/* Capacity */}
          <View style={styles.infoRow}>
            <Text style={styles.peopleIcon}>👥</Text>
            <Text style={styles.infoText}>{room.capacity} seats</Text>
          </View>

          {/* Status & Action */}
          <View style={styles.bottomRow}>
            <StatusBadge status={room.status} />

            <View style={styles.slotsAvailable}>
              <Text style={styles.slotsText}>
                {room.availableSlotsToday > 0
                  ? `${room.availableSlotsToday} slots free today`
                  : 'Fully booked today'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.room.id === nextProps.room.id &&
      prevProps.room.status === nextProps.room.status &&
      prevProps.room.availableSlotsToday === nextProps.room.availableSlotsToday
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pinIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  peopleIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  slotsAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotsText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

