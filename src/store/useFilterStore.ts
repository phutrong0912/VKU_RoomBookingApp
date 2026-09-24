import { create } from 'zustand';
import { Amenity, BuildingName, RoomFilterState, RoomType } from '../types/room';

interface FilterStore extends RoomFilterState {
  setSearchQuery: (query: string) => void;
  setSelectedBuilding: (building: BuildingName | 'All') => void;
  setSelectedType: (type: RoomType | 'All') => void;
  setMinCapacity: (capacity: number) => void;
  setStatus: (status: 'All' | 'available' | 'occupied') => void;
  toggleAmenity: (amenity: Amenity) => void;
  resetFilters: () => void;
  getActiveFiltersCount: () => number;
}

const initialFilterState: RoomFilterState = {
  searchQuery: '',
  selectedBuilding: 'All',
  selectedType: 'All',
  minCapacity: 0,
  status: 'All',
  selectedAmenities: [],
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialFilterState,

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),

  setSelectedType: (selectedType) => set({ selectedType }),

  setMinCapacity: (minCapacity) => set({ minCapacity }),

  setStatus: (status) => set({ status }),

  toggleAmenity: (amenity) => {
    const current = get().selectedAmenities;
    if (current.includes(amenity)) {
      set({ selectedAmenities: current.filter((a) => a !== amenity) });
    } else {
      set({ selectedAmenities: [...current, amenity] });
    }
  },

  resetFilters: () =>
    set({
      selectedBuilding: 'All',
      selectedType: 'All',
      minCapacity: 0,
      status: 'All',
      selectedAmenities: [],
    }),

  getActiveFiltersCount: () => {
    const state = get();
    let count = 0;
    if (state.selectedBuilding !== 'All') count++;
    if (state.selectedType !== 'All') count++;
    if (state.minCapacity > 0) count++;
    if (state.status !== 'All') count++;
    count += state.selectedAmenities.length;
    return count;
  },
}));

