import { Booking, CreateBookingPayload, UserProfile } from '../types/booking';
import { INITIAL_USER_BOOKINGS, INITIAL_USER } from './mockData';
import { fetchRoomById, fetchRoomSlots, updateSlotOccupancy } from './roomApi';
import { validateBookingConflict } from '../utils/conflictValidator';

// In-memory bookings store
let bookingsStore: Booking[] = [...INITIAL_USER_BOOKINGS];

export async function fetchUserBookings(userId: string): Promise<Booking[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return bookingsStore.filter((b) => b.userId === userId);
}

export async function createBooking(
  payload: CreateBookingPayload,
  userProfile: UserProfile = INITIAL_USER
): Promise<Booking> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const room = await fetchRoomById(payload.roomId);
  const slots = await fetchRoomSlots(payload.roomId, payload.date);
  const targetSlot = slots.find((s) => s.id === payload.slotId);

  if (!targetSlot) {
    throw new Error('Selected time slot could not be found.');
  }

  // Conflict Prevention Engine check
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

  // Generate Booking
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

  // Update in-memory storage
  bookingsStore = [newBooking, ...bookingsStore];

  // Mark slot occupied
  updateSlotOccupancy(room.id, payload.date, targetSlot.id, true, {
    userId: userProfile.id,
    userName: userProfile.fullName,
  });

  return newBooking;
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const booking = bookingsStore.find((b) => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  const updatedBooking: Booking = {
    ...booking,
    status: 'cancelled',
  };

  bookingsStore = bookingsStore.map((b) => (b.id === bookingId ? updatedBooking : b));

  // Release the slot
  updateSlotOccupancy(booking.roomId, booking.date, booking.slotId, false);

  return updatedBooking;
}

