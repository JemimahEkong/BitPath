import { create } from 'zustand';
import { SignUpState } from './signUpInterface';

export const useSignUpStore = create<SignUpState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  signup: async (signupData: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        set({ isLoading: false, error: null });
        return true;
      } else {
        set({ isLoading: false, error: data.message || 'Signup failed' });
        return false;
      }
    } catch (error) {
      set({ isLoading: false, error: 'Signup failed. Please try again.' });
      return false;
    }
  },
}));