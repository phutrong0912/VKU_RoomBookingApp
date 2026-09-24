import { Room, RoomFilterState } from '../types/room';
import { TimeSlot } from '../types/booking';
import { INITIAL_ROOMS, generateSlotsForRoomAndDate } from './mockData';

// In-memory slot storage cache so slot modifications persist during the session
const roomSlotsCache: Record<string, TimeSlot[]> = {};

export async function fetchRooms(filters?: Partial<RoomFilterState>): Promise<Room[]> {
  // Simulate network latency for realistic TanStack Query behavior
  await new Promise((resolve) => setTimeout(resolve, 250));

  let results = [...INITIAL_ROOMS];

  if (!filters) return results;

  // 1. Search Query Filter
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const q = filters.searchQuery.toLowerCase().trim();
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.building.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.amenities.some((a) => a.toLowerCase().includes(q))
    );
  }

  // 2. Building Filter
  if (filters.selectedBuilding && filters.selectedBuilding !== 'All') {
    results = results.filter((r) => r.building === filters.selectedBuilding);
  }

  // 3. Room Type Filter
  if (filters.selectedType && filters.selectedType !== 'All') {
    results = results.filter((r) => r.type === filters.selectedType);
  }

  // 4. Min Capacity
  if (filters.minCapacity && filters.minCapacity > 0) {
    results = results.filter((r) => r.capacity >= (filters.minCapacity || 0));
  }

  // 5. Status Filter
  if (filters.status && filters.status !== 'All') {
    results = results.filter((r) => r.status === filters.status);
  }

  // 6. Amenities Filter
  if (filters.selectedAmenities && filters.selectedAmenities.length > 0) {
    results = results.filter((r) =>
      filters.selectedAmenities!.every((amenity) => r.amenities.includes(amenity))
    );
  }

  return results;
}

export async function fetchRoomById(roomId: string): Promise<Room> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const room = INITIAL_ROOMS.find((r) => r.id === roomId);
  if (!room) {
    throw new Error(`Room with id ${roomId} not found`);
  }
  return room;
}

export async function fetchRoomSlots(roomId: string, date: string): Promise<TimeSlot[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const cacheKey = `${roomId}_${date}`;
  if (!roomSlotsCache[cacheKey]) {
    roomSlotsCache[cacheKey] = generateSlotsForRoomAndDate(roomId, date);
  }
  return [...roomSlotsCache[cacheKey]];
}

export function updateSlotOccupancy(
  roomId: string,
  date: string,
  slotId: string,
  isOccupied: boolean,
  bookedBy?: { userId: string; userName: string }
) {
  const cacheKey = `${roomId}_${date}`;
  if (!roomSlotsCache[cacheKey]) {
    roomSlotsCache[cacheKey] = generateSlotsForRoomAndDate(roomId, date);
  }
  roomSlotsCache[cacheKey] = roomSlotsCache[cacheKey].map((s) =>
    s.id === slotId ? { ...s, isOccupied, bookedBy: isOccupied ? bookedBy : undefined } : s
  );
}

