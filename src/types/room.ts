export type BuildingName =
  | 'Building A3'
  | 'Main Library'
  | 'IT Center'
  | 'Building B1'
  | 'Innovation Hub';

export type RoomType =
  | 'Lab'
  | 'Study Room'
  | 'Discussion Room'
  | 'Quiet Study'
  | 'Seminar Room';

export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export type Amenity =
  | 'Projector'
  | 'Whiteboard'
  | 'Computers'
  | 'Air Conditioning'
  | 'Power Outlets'
  | 'Conference Camera'
  | 'High-speed LAN';

export interface Room {
  id: string;
  name: string;
  code: string;
  building: BuildingName;
  floor: string;
  capacity: number;
  type: RoomType;
  status: RoomStatus;
  imageUrl: string;
  amenities: Amenity[];
  description: string;
  rules: string[];
  currentOccupant?: string;
  availableSlotsToday: number;
  rating: number;
}

export interface RoomFilterState {
  searchQuery: string;
  selectedBuilding: BuildingName | 'All';
  selectedType: RoomType | 'All';
  minCapacity: number | 0;
  status: 'All' | 'available' | 'occupied';
  selectedAmenities: Amenity[];
}

