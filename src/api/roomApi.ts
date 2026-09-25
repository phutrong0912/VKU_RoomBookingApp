import { Room, RoomFilterState } from '../types/room';
import { TimeSlot } from '../types/booking';
import { INITIAL_ROOMS, generateSlotsForRoomAndDate } from './mockData';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, seedFirestoreIfEmpty, withTimeout } from '../services/firebase';
import { isFirebaseConfigured } from '../services/firebaseConfig';

// In-memory slot storage cache so slot modifications persist during the session
const roomSlotsCache: Record<string, TimeSlot[]> = {};

/**
 * Fetch rooms from Firebase Firestore backend with multi-parameter filtering
 * If Firebase is not configured or network times out, instantly serves preloaded catalog
 */
export async function fetchRooms(filters?: Partial<RoomFilterState>): Promise<Room[]> {
  let results: Room[] = [];

  if (db && isFirebaseConfigured()) {
    try {
      await seedFirestoreIfEmpty();
      const querySnapshot = await withTimeout(getDocs(collection(db, 'rooms')), 2000);
      if (!querySnapshot.empty) {
        results = querySnapshot.docs.map((docSnap) => docSnap.data() as Room);
      } else {
        results = [...INITIAL_ROOMS];
      }
    } catch (err) {
      console.warn('[Firebase] fetchRooms fallback to local catalog:', (err as any)?.message);
      results = [...INITIAL_ROOMS];
    }
  } else {
    // Instant local serving with minor debounce simulation
    await new Promise((resolve) => setTimeout(resolve, 80));
    results = [...INITIAL_ROOMS];
  }

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

/**
 * Fetch a specific room by ID from Firebase Firestore or local cache
 */
export async function fetchRoomById(roomId: string): Promise<Room> {
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'rooms', roomId);
      const docSnap = await withTimeout(getDoc(docRef), 2000);
      if (docSnap.exists()) {
        return docSnap.data() as Room;
      }
    } catch (err) {
      console.warn('[Firebase] fetchRoomById fallback:', (err as any)?.message);
    }
  }

  const room = INITIAL_ROOMS.find((r) => r.id === roomId);
  if (!room) {
    throw new Error(`Room with id ${roomId} not found`);
  }
  return room;
}

/**
 * Fetch available time slots for a specific room and calendar date
 */
export async function fetchRoomSlots(roomId: string, date: string): Promise<TimeSlot[]> {
  const cacheKey = `${roomId}_${date}`;
  if (!roomSlotsCache[cacheKey]) {
    roomSlotsCache[cacheKey] = generateSlotsForRoomAndDate(roomId, date);
  }
  return [...roomSlotsCache[cacheKey]];
}

/**
 * Update slot occupancy state
 */
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
