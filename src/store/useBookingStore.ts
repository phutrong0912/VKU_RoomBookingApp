import { create } from 'zustand';
import { TimeSlot } from '../types/booking';
import { formatDateString } from '../utils/dateUtils';

interface BookingDraftStore {
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  purpose: string;
  attendeesCount: number;
  isSummaryModalVisible: boolean;
  setSelectedDate: (date: string) => void;
  setSelectedSlot: (slot: TimeSlot | null) => void;
  setPurpose: (purpose: string) => void;
  setAttendeesCount: (count: number) => void;
  setIsSummaryModalVisible: (visible: boolean) => void;
  resetDraft: () => void;
}

export const useBookingStore = create<BookingDraftStore>((set) => ({
  selectedDate: formatDateString(new Date()),
  selectedSlot: null,
  purpose: 'Study & Research',
  attendeesCount: 2,
  isSummaryModalVisible: false,

  setSelectedDate: (selectedDate) => set({ selectedDate, selectedSlot: null }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  setPurpose: (purpose) => set({ purpose }),
  setAttendeesCount: (attendeesCount) => set({ attendeesCount }),
  setIsSummaryModalVisible: (isSummaryModalVisible) => set({ isSummaryModalVisible }),
  resetDraft: () =>
    set({
      selectedSlot: null,
      purpose: 'Study & Research',
      attendeesCount: 2,
      isSummaryModalVisible: false,
    }),
}));

