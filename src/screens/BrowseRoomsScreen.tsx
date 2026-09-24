import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Room } from '../types/room';
import { colors } from '../constants/colors';
import { useFilterStore } from '../store/useFilterStore';
import { useRoomsQuery } from '../hooks/useRooms';
import { SearchInput } from '../components/common/SearchInput';
import { FilterChip } from '../components/common/FilterChip';
import { RoomCard, ROOM_CARD_HEIGHT } from '../components/room/RoomCard';
import { FilterModal } from '../components/room/FilterModal';
import { QRScannerModal } from '../components/booking/QRScannerModal';
import { Alert } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BrowseRoomsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  // Zustand filter store
  const {
    searchQuery,
    selectedBuilding,
    selectedType,
    minCapacity,
    status,
    selectedAmenities,
    setSearchQuery,
    setSelectedBuilding,
    setStatus,
    getActiveFiltersCount,
  } = useFilterStore();

  const filterParams = useMemo(
    () => ({
      searchQuery,
      selectedBuilding,
      selectedType,
      minCapacity,
      status,
      selectedAmenities,
    }),
    [searchQuery, selectedBuilding, selectedType, minCapacity, status, selectedAmenities]
  );

  // TanStack Query for server room catalog
  const { data: rooms = [], isLoading, isRefetching, refetch } = useRoomsQuery(filterParams);

  const handleRoomPress = useCallback(
    (roomId: string) => {
      navigation.navigate('RoomDetail', { roomId });
    },
    [navigation]
  );

  const handleScanRoomSuccess = useCallback(
    (scannedCode: string) => {
      setScannerVisible(false);
      setTimeout(() => {
        const normalized = scannedCode.toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = rooms.find((r) => {
          const roomCodeNorm = r.code.toLowerCase().replace(/[^a-z0-9]/g, '');
          const roomIdNorm = r.id.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normalized.includes(roomCodeNorm) || normalized.includes(roomIdNorm);
        });

        if (match) {
          navigation.navigate('RoomDetail', { roomId: match.id });
        } else {
          Alert.alert(
            'QR Code Scanned',
            `Scanned: "${scannedCode}".\nNo registered room found for this code.`
          );
        }
      }, 450);
    },
    [rooms, navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Room }) => <RoomCard room={item} onPress={handleRoomPress} />,
    [handleRoomPress]
  );

  // Layout optimization for 60fps FlatList
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ROOM_CARD_HEIGHT + 16,
      offset: (ROOM_CARD_HEIGHT + 16) * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <View style={styles.container}>
      {/* Search Bar & Filter Button matching wireframe + Camera QR Scan */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onPressFilter={() => setFilterModalVisible(true)}
        filterBadgeCount={activeFiltersCount}
        onPressScanQR={() => setScannerVisible(true)}
      />

      {/* Quick Filter Horizontal Chips */}
      <View style={styles.quickChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickChipsContent}
        >
          <FilterChip
            label="All Rooms"
            isSelected={selectedBuilding === 'All' && status === 'All'}
            onPress={() => {
              setSelectedBuilding('All');
              setStatus('All');
            }}
          />
          <FilterChip
            label="Available Now"
            isSelected={status === 'available'}
            onPress={() => setStatus(status === 'available' ? 'All' : 'available')}
          />
          <FilterChip
            label="Building A3"
            isSelected={selectedBuilding === 'Building A3'}
            onPress={() =>
              setSelectedBuilding(selectedBuilding === 'Building A3' ? 'All' : 'Building A3')
            }
          />
          <FilterChip
            label="Main Library"
            isSelected={selectedBuilding === 'Main Library'}
            onPress={() =>
              setSelectedBuilding(selectedBuilding === 'Main Library' ? 'All' : 'Main Library')
            }
          />
          <FilterChip
            label="IT Center"
            isSelected={selectedBuilding === 'IT Center'}
            onPress={() =>
              setSelectedBuilding(selectedBuilding === 'IT Center' ? 'All' : 'IT Center')
            }
          />
        </ScrollView>
      </View>

      {/* Feed Status Summary */}
      <View style={styles.feedSummaryRow}>
        <Text style={styles.feedCountText}>
          {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} found
        </Text>
        {activeFiltersCount > 0 && (
          <Text style={styles.activeFilterNotice}>Filters applied ({activeFiltersCount})</Text>
        )}
      </View>

      {/* 60fps Optimized FlatList */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading campus rooms...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={Platform.OS === 'web' ? undefined : getItemLayout}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== 'web'}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No matching rooms found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or loosening your filter criteria.
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />

      {/* Camera QR Scanner Modal */}
      <QRScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanSuccess={handleScanRoomSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quickChipsContainer: {
    backgroundColor: colors.surface,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickChipsContent: {
    paddingHorizontal: 16,
  },
  feedSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  feedCountText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterNotice: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

