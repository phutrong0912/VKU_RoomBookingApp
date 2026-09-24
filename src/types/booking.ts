export type SlotPeriod = 'morning' | 'afternoon' | 'evening';

export interface TimeSlot {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  label: string; // "08:00 - 09:30"
  period: SlotPeriod;
  isOccupied: boolean;
  bookedBy?: {
    userId: string;
    userName: string;
  };
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  roomBuilding: string;
  roomFloor: string;
  roomImageUrl: string;
  userId: string;
  userName: string;
  userStudentId: string;
  date: string; // YYYY-MM-DD
  slotId: string;
  timeRange: string;
  purpose: string;
  attendeesCount: number;
  status: BookingStatus;
  createdAt: string;
  qrCodeToken: string;
}

export interface UserProfile {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  avatarUrl: string;
  dailySlotsQuota: number;
  dailySlotsUsed: number;
}

export type ConflictType = 'SLOT_OCCUPIED' | 'USER_OVERLAP' | 'QUOTA_EXCEEDED';

export interface ConflictCheckResult {
  hasConflict: boolean;
  type?: ConflictType;
  reason?: string;
  conflictingBooking?: Booking;
}

export interface CreateBookingPayload {
  roomId: string;
  slotId: string;
  date: string;
  purpose: string;
  attendeesCount: number;
}

