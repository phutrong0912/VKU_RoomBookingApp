import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onPressFilter: () => void;
  filterBadgeCount?: number;
  onPressScanQR?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onPressFilter,
  filterBadgeCount = 0,
  onPressScanQR,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.inputContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search rooms..."
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        {onPressScanQR && (
          <TouchableOpacity onPress={onPressScanQR} style={styles.cameraButton} activeOpacity={0.7}>
            <Ionicons name="camera-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button [Filter ▼] */}
      <TouchableOpacity
        style={[styles.filterButton, filterBadgeCount > 0 && styles.filterButtonActive]}
        onPress={onPressFilter}
        activeOpacity={0.8}
      >
        <Text style={[styles.filterText, filterBadgeCount > 0 && styles.filterTextActive]}>
          Filter
        </Text>
        <Ionicons
          name="chevron-down"
          size={14}
          color={filterBadgeCount > 0 ? '#FFFFFF' : colors.textPrimary}
          style={styles.filterChevron}
        />
        {filterBadgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filterBadgeCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  cameraButton: {
    padding: 4,
    marginLeft: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterChevron: {
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

