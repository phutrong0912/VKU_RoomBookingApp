import { Booking, CreateBookingPayload, UserProfile } from '../types/booking';
import { INITIAL_USER_BOOKINGS, INITIAL_USER } from './mockData';
import { fetchRoomById, fetchRoomSlots, updateSlotOccupancy } from './roomApi';
import { validateBookingConflict } from '../utils/conflictValidator';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db, seedFirestoreIfEmpty, withTimeout } from '../services/firebase';
import { isFirebaseConfigured } from '../services/firebaseConfig';

// Local storage cache for instant UI mutations and offline usage
let bookingsStore: Booking[] = [...INITIAL_USER_BOOKINGS];

/**
 * Fetch bookings for a specific student from Firebase Firestore or local cache
 */
export async function fetchUserBookings(userId: string): Promise<Booking[]> {
  if (db && isFirebaseConfigured()) {
    try {
      await seedFirestoreIfEmpty();
      const snapshot = await withTimeout(getDocs(collection(db, 'bookings')), 2000);
      if (!snapshot.empty) {
        const allBookings = snapshot.docs.map((d) => d.data() as Booking);
        bookingsStore = allBookings;
        return allBookings.filter((b) => b.userId === userId);
      }
    } catch (err) {
      console.warn('[Firebase] fetchUserBookings fallback to local cache:', (err as any)?.message);
    }
  }

  return bookingsStore.filter((b) => b.userId === userId);
}

/**
 * Create a new booking reservation in Firebase Firestore with conflict prevention
 */
export async function createBooking(
  payload: CreateBookingPayload,
  userProfile: UserProfile = INITIAL_USER
): Promise<Booking> {
  const room = await fetchRoomById(payload.roomId);
  const slots = await fetchRoomSlots(payload.roomId, payload.date);
  const targetSlot = slots.find((s) => s.id === payload.slotId);

  if (!targetSlot) {
    throw new Error('Selected time slot could not be found.');
  }

  // Conflict Prevention Engine check against existing reservations
  const userCurrentBookings = bookingsStore.filter((b) => b.userId === userProfile.id);
  const conflictResult = validateBookingConflict({
    targetSlot,
    userBookings: userCurrentBookings,
    userProfile,
    date: payload.date,
  });

  if (conflictResult.hasConflict) {
    throw new Error(conflictResult.reason || 'Booking conflict detected. Cannot proceed.');
  }

  // Generate Booking entity
  const newBooking: Booking = {
    id: `bkg-${Date.now()}`,
    roomId: room.id,
    roomName: room.name,
    roomBuilding: room.building,
    roomFloor: room.floor,
    roomImageUrl: room.imageUrl,
    userId: userProfile.id,
    userName: userProfile.fullName,
    userStudentId: userProfile.studentId,
    date: payload.date,
    slotId: targetSlot.id,
    timeRange: targetSlot.label,
    purpose: payload.purpose || 'Academic Study Session',
    attendeesCount: payload.attendeesCount || 1,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    qrCodeToken: `VKU-PASS-${room.code}-${Date.now().toString().slice(-4)}`,
  };

  // Save to Firebase Firestore if connected
  if (db && isFirebaseConfigured()) {
    try {
      await withTimeout(setDoc(doc(db, 'bookings', newBooking.id), newBooking), 2000);
      console.log('[Firebase] Reservation saved to Firestore:', newBooking.id);
    } catch (err) {
      console.warn('[Firebase] Firestore write offline fallback:', (err as any)?.message);
    }
  }

  // Update in-memory session cache immediately
  bookingsStore = [newBooking, ...bookingsStore];

  // Mark slot occupied
  updateSlotOccupancy(room.id, payload.date, targetSlot.id, true, {
    userId: userProfile.id,
    userName: userProfile.fullName,
  });

  return newBooking;
}

/**
 * Cancel a booking reservation in Firebase Firestore and release the slot
 */
export async function cancelBooking(bookingId: string): Promise<Booking> {
  const booking = bookingsStore.find((b) => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  const updatedBooking: Booking = {
    ...booking,
    status: 'cancelled',
  };

  // Update in Firebase Firestore if connected
  if (db && isFirebaseConfigured()) {
    try {
      await withTimeout(
        updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' }),
        2000
      );
      console.log('[Firebase] Reservation cancelled in Firestore:', bookingId);
    } catch (err) {
      console.warn('[Firebase] Firestore cancel offline fallback:', (err as any)?.message);
    }
  }

  bookingsStore = bookingsStore.map((b) => (b.id === bookingId ? updatedBooking : b));

  // Release the slot back to the campus pool
  updateSlotOccupancy(booking.roomId, booking.date, booking.slotId, false);

  return updatedBooking;
}
