import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OAuthState, OAuthResponse } from './oauthInterface';
import toast from 'react-hot-toast';

interface OAuthStore extends OAuthState {
  // Actions
  setProvider: (provider: 'google' | 'linkedin' | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initiateOAuth: (provider: 'google' | 'linkedin') => void;
  handleOAuthCallback: (url: string) => Promise<void>;
  clearOAuth: () => void;
}

export const useOAuthStore = create<OAuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      provider: null,

      // Actions
      setProvider: (provider) => set({ provider }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      initiateOAuth: async (provider: 'google' | 'linkedin') => {
        try {
          set({ isLoading: true, error: null, provider });
          
          // Store OAuth state for callback verification
          const state = Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('oauth_state', state);
          sessionStorage.setItem('oauth_provider', provider);
          
          // Redirect to OAuth provider
          const redirectUrl = `/api/auth/${provider}`;
          
          window.location.href = redirectUrl;
          
        } catch (error) {
          console.error('OAuth initiation error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to initiate OAuth' 
          });
        }
      },
      
      handleOAuthCallback: async (url: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const urlParams = new URLSearchParams(url);
          const oauthSuccess = urlParams.get('oauth');
          const provider = urlParams.get('provider');
          const error = urlParams.get('error');
          
          if (error || oauthSuccess === 'error') {
            const errorMessage = error || 'OAuth authentication failed';
            toast.error(errorMessage);
            throw new Error(errorMessage);
          }
          
          if (oauthSuccess === 'success' && provider) {
            // OAuth was successful, the session cookie is already set
            const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
            toast.success(`Successfully logged in with ${providerName}!`);
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
          } else {
            const errorMessage = 'Invalid OAuth response';
            toast.error(errorMessage);
            throw new Error(errorMessage);
          }
          
        } catch (error) {
          console.error('OAuth callback error:', error);
          const errorMessage = error instanceof Error ? error.message : 'OAuth callback failed';
          toast.error(errorMessage);
          set({ 
            isLoading: false, 
            error: errorMessage
          });
          // Redirect back to login on error
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      },
      
      clearOAuth: () => {
        set({ isLoading: false, error: null, provider: null });
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_provider');
      },
    }),
    {
      name: 'oauth-store',
      partialize: (state) => ({
        provider: state.provider,
        error: state.error,
      }),
    }
  )
);