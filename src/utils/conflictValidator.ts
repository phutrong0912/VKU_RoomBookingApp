import { Booking, ConflictCheckResult, TimeSlot, UserProfile } from '../types/booking';

/**
 * Validates whether booking a time slot creates any conflicts
 */
export function validateBookingConflict({
  targetSlot,
  userBookings,
  userProfile,
  date,
}: {
  targetSlot: TimeSlot;
  userBookings: Booking[];
  userProfile: UserProfile;
  date: string;
}): ConflictCheckResult {
  // 1. Check if the slot itself is already occupied/reserved
  if (targetSlot.isOccupied) {
    return {
      hasConflict: true,
      type: 'SLOT_OCCUPIED',
      reason: `This slot (${targetSlot.label}) has already been reserved by another student or faculty.`,
    };
  }

  // 2. Check if the user already has a reservation during the same date & time
  const overlappingBooking = userBookings.find((b) => {
    return (
      b.status === 'confirmed' &&
      b.date === date &&
      (b.slotId === targetSlot.id || b.timeRange === targetSlot.label)
    );
  });

  if (overlappingBooking) {
    return {
      hasConflict: true,
      type: 'USER_OVERLAP',
      reason: `Schedule Conflict: You already reserved ${overlappingBooking.roomName} during ${targetSlot.label} on ${date}.`,
      conflictingBooking: overlappingBooking,
    };
  }

  // 3. Check user daily quota for the selected date
  const bookingsOnThisDate = userBookings.filter(
    (b) => b.status === 'confirmed' && b.date === date
  );

  if (bookingsOnThisDate.length >= userProfile.dailySlotsQuota) {
    return {
      hasConflict: true,
      type: 'QUOTA_EXCEEDED',
      reason: `Daily Quota Limit: Campus policy permits a maximum of ${userProfile.dailySlotsQuota} room bookings per day.`,
    };
  }

  return {
    hasConflict: false,
  };
}

