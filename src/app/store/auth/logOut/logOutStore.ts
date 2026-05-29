import { create } from 'zustand';
import { LogOutState } from './logOutInterface';

export const useLogOutStore = create<LogOutState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: async (logoutType: 'current' | 'all' = 'current') => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/logOut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoutType }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        set({ isLoading: false, error: null });
        return true;
      } else {
        set({ isLoading: false, error: data.message || 'Logout failed' });
        return false;
      }
    } catch (error) {
      set({ isLoading: false, error: 'Logout failed. Please try again.' });
      return false;
    }
  },
}));