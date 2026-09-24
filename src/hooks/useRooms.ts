import { useQuery } from '@tanstack/react-query';
import { fetchRoomById, fetchRooms, fetchRoomSlots } from '../api/roomApi';
import { RoomFilterState } from '../types/room';

export function useRoomsQuery(filters?: Partial<RoomFilterState>) {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => fetchRooms(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useRoomDetailQuery(roomId: string) {
  return useQuery({
    queryKey: ['room', roomId],
    queryFn: () => fetchRoomById(roomId),
    enabled: Boolean(roomId),
  });
}

export function useRoomSlotsQuery(roomId: string, date: string) {
  return useQuery({
    queryKey: ['room-slots', roomId, date],
    queryFn: () => fetchRoomSlots(roomId, date),
    enabled: Boolean(roomId) && Boolean(date),
  });
}

