import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelBooking, createBooking, fetchUserBookings } from '../api/bookingApi';
import { CreateBookingPayload, UserProfile } from '../types/booking';
import { useUserStore } from '../store/useUserStore';

export function useBookingsQuery(userId: string) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: () => fetchUserBookings(userId),
    enabled: Boolean(userId),
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  const incrementSlotsUsed = useUserStore((s) => s.incrementSlotsUsed);

  return useMutation({
    mutationFn: ({
      payload,
      userProfile,
    }: {
      payload: CreateBookingPayload;
      userProfile: UserProfile;
    }) => createBooking(payload, userProfile),
    onSuccess: () => {
      // Invalidate all related caches to trigger fresh UI state
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['room-slots'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      incrementSlotsUsed();
    },
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();
  const decrementSlotsUsed = useUserStore((s) => s.decrementSlotsUsed);

  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['room-slots'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      decrementSlotsUsed();
    },
  });
}

