import { Booking, TimeSlot, UserProfile } from '../types/booking';
import { Room } from '../types/room';
import { formatDateString } from '../utils/dateUtils';

export const INITIAL_USER: UserProfile = {
  id: 'usr_vku_2026',
  studentId: '23IT999',
  fullName: 'Pham Nguyen Phu Trong',
  email: 'trongpnp.23ceb@vku.udn.vn',
  department: 'Faculty of Computer Science',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  dailySlotsQuota: 3,
  dailySlotsUsed: 1,
};

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-a3-101',
    name: 'Lab A3-101',
    code: 'A3-101',
    building: 'Building A3',
    floor: '1st Floor',
    capacity: 30,
    type: 'Lab',
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    amenities: ['Computers', 'Projector', 'Air Conditioning', 'High-speed LAN', 'Whiteboard'],
    description: 'Specialized computer programming lab equipped with 30 high-performance workstations, dual monitors, and high-speed campus gigabit LAN.',
    rules: ['No food or open drink containers allowed', 'Turn off monitors after leaving', 'ID badge verification required'],
    availableSlotsToday: 4,
    rating: 4.9,
  },
  {
    id: 'room-lib-zone-b',
    name: 'Library Zone B',
    code: 'LIB-ZB',
    building: 'Main Library',
    floor: '2nd Floor',
    capacity: 50,
    type: 'Quiet Study',
    status: 'occupied',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    amenities: ['Power Outlets', 'Air Conditioning', 'Whiteboard'],
    description: 'Silent study and research zone situated in the VKU central library with individual carrels and ergonomic seating.',
    rules: ['Strict silence zone at all times', 'No phone calls inside the room', 'Clean your desk before exiting'],
    currentOccupant: 'Reserved for Discrete Math Group',
    availableSlotsToday: 1,
    rating: 4.8,
  },
  {
    id: 'room-it-402',
    name: 'Lab IT-402 (Software Eng)',
    code: 'IT-402',
    building: 'IT Center',
    floor: '4th Floor',
    capacity: 40,
    type: 'Lab',
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    amenities: ['Computers', 'Projector', 'Whiteboard', 'Air Conditioning', 'Power Outlets'],
    description: 'Modern software engineering lab optimized for team capstone projects, mobile dev, and hackathons.',
    rules: ['Only licensed educational software allowed', 'Keep door locked when unattended'],
    availableSlotsToday: 5,
    rating: 4.7,
  },
  {
    id: 'room-b1-205',
    name: 'Discussion Room B1-205',
    code: 'B1-205',
    building: 'Building B1',
    floor: '2nd Floor',
    capacity: 12,
    type: 'Discussion Room',
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    amenities: ['Whiteboard', 'Conference Camera', 'Air Conditioning', 'Power Outlets'],
    description: 'Intimate collaborative meeting space with full AV video conferencing gear, magnetic glass board, and sound insulation.',
    rules: ['Booking requires min 3 participants', 'Maximum 2 hours consecutive use'],
    availableSlotsToday: 3,
    rating: 4.6,
  },
  {
    id: 'room-a3-301',
    name: 'Smart Seminar Hall A3-301',
    code: 'A3-301',
    building: 'Building A3',
    floor: '3rd Floor',
    capacity: 65,
    type: 'Seminar Room',
    status: 'occupied',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    amenities: ['Projector', 'Conference Camera', 'Air Conditioning', 'Power Outlets'],
    description: 'Large tier-seated seminar hall equipped with stage podium, surround sound, and dual 4K laser projectors.',
    rules: ['Authorized faculty advisor approval required', 'No drinks on podium table'],
    currentOccupant: 'Faculty Guest Lecture on Cloud Architecture',
    availableSlotsToday: 0,
    rating: 4.9,
  },
  {
    id: 'room-hub-02',
    name: 'Innovation Hub Room 02',
    code: 'HUB-02',
    building: 'Innovation Hub',
    floor: '1st Floor',
    capacity: 18,
    type: 'Discussion Room',
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    amenities: ['Whiteboard', 'Power Outlets', 'Air Conditioning', 'High-speed LAN'],
    description: 'Open creative workshop room designed for startup incubation, design sprints, and club activities.',
    rules: ['Keep creative whiteboards intact unless cleared', 'Return furniture to original positions'],
    availableSlotsToday: 4,
    rating: 4.7,
  },
];

const standardSlotTimes = [
  { startTime: '07:30', endTime: '09:00', label: '07:30 - 09:00', period: 'morning' as const },
  { startTime: '09:15', endTime: '10:45', label: '09:15 - 10:45', period: 'morning' as const },
  { startTime: '11:00', endTime: '12:30', label: '11:00 - 12:30', period: 'morning' as const },
  { startTime: '13:00', endTime: '14:30', label: '13:00 - 14:30', period: 'afternoon' as const },
  { startTime: '14:45', endTime: '16:15', label: '14:45 - 16:15', period: 'afternoon' as const },
  { startTime: '16:30', endTime: '18:00', label: '16:30 - 18:00', period: 'afternoon' as const },
  { startTime: '18:30', endTime: '20:00', label: '18:30 - 20:00', period: 'evening' as const },
];

/**
 * Generate standard campus time slots for a given room and date
 */
export function generateSlotsForRoomAndDate(roomId: string, date: string): TimeSlot[] {
  const isLibraryOccupied = roomId === 'room-lib-zone-b';
  const isSeminarOccupied = roomId === 'room-a3-301';

  return standardSlotTimes.map((item, idx) => {
    // Generate deterministic initial occupancy for demo
    let isOccupied = false;

    if (isSeminarOccupied) {
      isOccupied = true;
    } else if (isLibraryOccupied && idx < 5) {
      isOccupied = true;
    } else if (roomId === 'room-a3-101' && idx === 1) {
      // 09:15 - 10:45 is occupied
      isOccupied = true;
    } else if (roomId === 'room-b1-205' && idx === 3) {
      // 13:00 - 14:30 is occupied
      isOccupied = true;
    }

    return {
      id: `slot_${roomId}_${date}_${idx}`,
      roomId,
      date,
      startTime: item.startTime,
      endTime: item.endTime,
      label: item.label,
      period: item.period,
      isOccupied,
      bookedBy: isOccupied
        ? {
            userId: 'usr_other',
            userName: 'Study Group ' + (idx + 1),
          }
        : undefined,
    };
  });
}

const todayStr = formatDateString(new Date());

export const INITIAL_USER_BOOKINGS: Booking[] = [
  {
    id: 'bkg-1001',
    roomId: 'room-a3-101',
    roomName: 'Lab A3-101',
    roomBuilding: 'Building A3',
    roomFloor: '1st Floor',
    roomImageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    userId: INITIAL_USER.id,
    userName: INITIAL_USER.fullName,
    userStudentId: INITIAL_USER.studentId,
    date: todayStr,
    slotId: `slot_room-a3-101_${todayStr}_1`,
    timeRange: '09:15 - 10:45',
    purpose: 'Mobile App Pair Programming',
    attendeesCount: 3,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    qrCodeToken: 'VKU-PASS-2026-A3-101-0915',
  },
];

