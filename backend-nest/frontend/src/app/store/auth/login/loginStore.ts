import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginState, LoginResponse } from './loginInterface';

export const useLoginStore = create<LoginState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      rememberMe: false,

      // Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setRememberMe: (rememberMe) => set({ rememberMe }),

      login: async (email: string, password: string, rememberMe?: boolean, recaptchaToken?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Use the rememberMe parameter or fall back to store state
          const useRememberMe = rememberMe !== undefined ? rememberMe : get().rememberMe;
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, rememberMe: useRememberMe, recaptchaToken }),
            credentials: 'include',
          });

          const data = await response.json();

          if (data.success) {
            set({ isLoading: false, error: null });
            return {
              success: true,
              requiresVerification: data.data?.requiresVerification,
              deviceId: data.data?.deviceId,
              deviceStatus: data.data?.deviceStatus,
              user: data.data?.user,
              message: data.message,
            };
          } else {
            set({ isLoading: false, error: data.message || 'Login failed' });
            return {
              success: false,
              message: data.message || 'Login failed',
            };
          }
        } catch (error) {
          set({ isLoading: false, error: 'Login failed. Please try again.' });
          return {
            success: false,
            message: 'Login failed. Please try again.',
          };
        }
      },
    }),
    {
      name: 'login-store', // localStorage key
      partialize: (state) => ({ 
        rememberMe: state.rememberMe 
        // Only persist rememberMe, not loading/error states
      }),
    }
  )
);