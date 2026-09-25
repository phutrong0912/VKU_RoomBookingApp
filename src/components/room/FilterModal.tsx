import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { Amenity, BuildingName, RoomType } from '../../types/room';
import { useFilterStore } from '../../store/useFilterStore';
import { FilterChip } from '../common/FilterChip';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

const buildings: (BuildingName | 'All')[] = [
  'All',
  'Building A3',
  'Main Library',
  'IT Center',
  'Building B1',
  'Innovation Hub',
];

const roomTypes: (RoomType | 'All')[] = [
  'All',
  'Lab',
  'Quiet Study',
  'Discussion Room',
  'Seminar Room',
];

const capacities = [
  { label: 'Any size', value: 0 },
  { label: '10+ seats', value: 10 },
  { label: '30+ seats', value: 30 },
  { label: '50+ seats', value: 50 },
];

const statuses: ('All' | 'available' | 'occupied')[] = ['All', 'available', 'occupied'];

const allAmenities: Amenity[] = [
  'Computers',
  'Projector',
  'Whiteboard',
  'Air Conditioning',
  'Power Outlets',
  'Conference Camera',
  'High-speed LAN',
];

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
  const {
    selectedBuilding,
    selectedType,
    minCapacity,
    status,
    selectedAmenities,
    setSelectedBuilding,
    setSelectedType,
    setMinCapacity,
    setStatus,
    toggleAmenity,
    resetFilters,
  } = useFilterStore();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Rooms</Text>
          <TouchableOpacity onPress={resetFilters} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability Status</Text>
            <View style={styles.chipsRow}>
              {statuses.map((item) => (
                <FilterChip
                  key={item}
                  label={item === 'All' ? 'All' : item === 'available' ? 'Available' : 'Occupied'}
                  isSelected={status === item}
                  onPress={() => setStatus(item)}
                />
              ))}
            </View>
          </View>

          {/* Building Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campus Building</Text>
            <View style={styles.chipsWrap}>
              {buildings.map((b) => (
                <FilterChip
                  key={b}
                  label={b}
                  isSelected={selectedBuilding === b}
                  onPress={() => setSelectedBuilding(b)}
                  style={styles.wrapChip}
                />
              ))}
            </View>
          </View>

          {/* Room Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Category</Text>
            <View style={styles.chipsWrap}>
              {roomTypes.map((t) => (
                <FilterChip
                  key={t}
                  label={t}
                  isSelected={selectedType === t}
                  onPress={() => setSelectedType(t)}
                  style={styles.wrapChip}
                />
              ))}
            </View>
          </View>

          {/* Minimum Capacity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Capacity (Seats)</Text>
            <View style={styles.chipsRow}>
              {capacities.map((c) => (
                <FilterChip
                  key={c.value}
                  label={c.label}
                  isSelected={minCapacity === c.value}
                  onPress={() => setMinCapacity(c.value)}
                />
              ))}
            </View>
          </View>

          {/* Amenities & Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment & Amenities</Text>
            <View style={styles.chipsWrap}>
              {allAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <FilterChip
                    key={amenity}
                    label={amenity}
                    isSelected={isSelected}
                    onPress={() => toggleAmenity(amenity)}
                    style={styles.wrapChip}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resetBtn: {
    padding: 4,
  },
  resetText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrapChip: {
    marginBottom: 4,
    marginRight: 0,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

