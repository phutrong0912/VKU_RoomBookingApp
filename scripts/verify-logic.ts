declare const process: any;

import { validateBookingConflict } from '../src/utils/conflictValidator';
import { TimeSlot, Booking, UserProfile } from '../src/types/booking';
import { fetchRooms, fetchRoomSlots } from '../src/api/roomApi';
import { createBooking, cancelBooking, fetchUserBookings } from '../src/api/bookingApi';

async function runVerification() {
  console.log('--- 1. Testing Room API & Filters ---');
  const allRooms = await fetchRooms();
  console.log(`✓ Fetched ${allRooms.length} total rooms`);
  if (allRooms.length < 5) throw new Error('Expected at least 5 rooms');

  // Test filter by building
  const a3Rooms = await fetchRooms({ selectedBuilding: 'Building A3' });
  console.log(`✓ Building A3 filter returned ${a3Rooms.length} rooms`);
  if (!a3Rooms.every((r) => r.building === 'Building A3')) throw new Error('Building filter mismatch');

  // Test filter by capacity
  const largeRooms = await fetchRooms({ minCapacity: 35 });
  console.log(`✓ MinCapacity (35+) filter returned ${largeRooms.length} rooms`);
  if (!largeRooms.every((r) => r.capacity >= 35)) throw new Error('Capacity filter mismatch');

  // Test filter by search text
  const searchResults = await fetchRooms({ searchQuery: 'lab' });
  console.log(`✓ Search "lab" returned ${searchResults.length} rooms`);
  if (searchResults.length === 0) throw new Error('Search failed');

  console.log('\n--- 2. Testing Conflict Prevention Engine ---');
  const dummyUser: UserProfile = {
    id: 'test-usr-1',
    studentId: '21IT999',
    fullName: 'Test Student',
    email: 'test@vku.udn.vn',
    department: 'CS',
    avatarUrl: '',
    dailySlotsQuota: 2,
    dailySlotsUsed: 0,
  };

  const slotA: TimeSlot = {
    id: 'slot-1',
    roomId: 'room-a3-101',
    date: '2026-09-18',
    startTime: '07:30',
    endTime: '09:00',
    label: '07:30 - 09:00',
    period: 'morning',
    isOccupied: false,
  };

  const occupiedSlot: TimeSlot = {
    ...slotA,
    id: 'slot-2',
    isOccupied: true,
  };

  // Check 1: Slot already occupied
  const occupiedCheck = validateBookingConflict({
    targetSlot: occupiedSlot,
    userBookings: [],
    userProfile: dummyUser,
    date: '2026-09-18',
  });
  console.log('✓ Slot occupied conflict detected:', occupiedCheck.type === 'SLOT_OCCUPIED');
  if (!occupiedCheck.hasConflict || occupiedCheck.type !== 'SLOT_OCCUPIED') {
    throw new Error('Occupied slot test failed');
  }

  // Check 2: Valid slot (no conflict)
  const validCheck = validateBookingConflict({
    targetSlot: slotA,
    userBookings: [],
    userProfile: dummyUser,
    date: '2026-09-18',
  });
  console.log('✓ Available slot check passed:', !validCheck.hasConflict);
  if (validCheck.hasConflict) throw new Error('Valid slot falsely flagged as conflict');

  // Check 3: User schedule overlap (user already booked another room at same time)
  const existingBooking: Booking = {
    id: 'bkg-dummy',
    roomId: 'room-it-402',
    roomName: 'Lab IT-402',
    roomBuilding: 'IT Center',
    roomFloor: '4th Floor',
    roomImageUrl: '',
    userId: dummyUser.id,
    userName: dummyUser.fullName,
    userStudentId: dummyUser.studentId,
    date: '2026-09-18',
    slotId: 'different-room-slot',
    timeRange: '07:30 - 09:00',
    purpose: 'Test',
    attendeesCount: 1,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    qrCodeToken: 'TOKEN',
  };

  const overlapCheck = validateBookingConflict({
    targetSlot: slotA,
    userBookings: [existingBooking],
    userProfile: dummyUser,
    date: '2026-09-18',
  });
  console.log('✓ User schedule overlap conflict detected:', overlapCheck.type === 'USER_OVERLAP');
  if (!overlapCheck.hasConflict || overlapCheck.type !== 'USER_OVERLAP') {
    throw new Error('User overlap test failed');
  }

  // Check 4: Quota exceeded
  const quotaUser: UserProfile = { ...dummyUser, dailySlotsQuota: 1 };
  const quotaCheck = validateBookingConflict({
    targetSlot: { ...slotA, id: 'slot-free-afternoon', label: '13:00 - 14:30' },
    userBookings: [existingBooking],
    userProfile: quotaUser,
    date: '2026-09-18',
  });
  console.log('✓ Quota exceeded conflict detected:', quotaCheck.type === 'QUOTA_EXCEEDED');
  if (!quotaCheck.hasConflict || quotaCheck.type !== 'QUOTA_EXCEEDED') {
    throw new Error('Quota test failed');
  }

  console.log('\n--- 3. Testing Booking Mutation & Cancellation Lifecycle ---');
  const dateStr = '2026-09-19';
  const slots = await fetchRoomSlots('room-a3-101', dateStr);
  const targetSlot = slots.find((s) => !s.isOccupied)!;
  console.log(`✓ Selecting available slot: ${targetSlot.label}`);

  const booking = await createBooking(
    {
      roomId: 'room-a3-101',
      slotId: targetSlot.id,
      date: dateStr,
      purpose: 'Capstone Demo',
      attendeesCount: 4,
    },
    dummyUser
  );
  console.log(`✓ Booking created successfully with ID: ${booking.id}, Token: ${booking.qrCodeToken}`);

  // Re-fetch slots for this room & date to verify slot is now occupied
  const updatedSlots = await fetchRoomSlots('room-a3-101', dateStr);
  const bookedSlotState = updatedSlots.find((s) => s.id === targetSlot.id);
  console.log(`✓ Slot is now occupied: ${bookedSlotState?.isOccupied}`);
  if (!bookedSlotState?.isOccupied) throw new Error('Slot was not marked occupied after booking');

  // Verify cancel releases slot
  await cancelBooking(booking.id);
  const releasedSlots = await fetchRoomSlots('room-a3-101', dateStr);
  const releasedSlotState = releasedSlots.find((s) => s.id === targetSlot.id);
  console.log(`✓ Slot is now released back to available: ${!releasedSlotState?.isOccupied}`);
  if (releasedSlotState?.isOccupied) throw new Error('Slot was not freed after cancellation');

  console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY! 🎉');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

