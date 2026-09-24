import { create } from 'zustand';
import { UserProfile } from '../types/booking';
import { INITIAL_USER } from '../api/mockData';

interface UserStore {
  user: UserProfile;
  incrementSlotsUsed: () => void;
  decrementSlotsUsed: () => void;
  updateUser: (updated: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: INITIAL_USER,

  incrementSlotsUsed: () =>
    set((state) => ({
      user: {
        ...state.user,
        dailySlotsUsed: Math.min(state.user.dailySlotsQuota, state.user.dailySlotsUsed + 1),
      },
    })),

  decrementSlotsUsed: () =>
    set((state) => ({
      user: {
        ...state.user,
        dailySlotsUsed: Math.max(0, state.user.dailySlotsUsed - 1),
      },
    })),

  updateUser: (updated) =>
    set((state) => ({
      user: { ...state.user, ...updated },
    })),
}));

