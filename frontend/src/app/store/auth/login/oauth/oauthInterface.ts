export interface OAuthState {
  isLoading: boolean;
  error: string | null;
  provider: 'google' | 'linkedin' | null;
}

export interface OAuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      fullName: string;
      profilePictureUrl?: string;
      isEmailVerified: boolean;
    };
    sessionToken: string;
    deviceId: string;
    deviceStatus: string;
    requiresVerification: boolean;
  };
}

export interface OAuthProvider {
  name: 'google' | 'linkedin';
  displayName: string;
  icon: string;
  color: string;
}

export const OAUTH_PROVIDERS: Record<'google' | 'linkedin', OAuthProvider> = {
  google: {
    name: 'google',
    displayName: 'Google',
    icon: '/icons/google.svg',
    color: '#4285f4',
  },
  linkedin: {
    name: 'linkedin',
    displayName: 'LinkedIn',
    icon: '/icons/linkedin.svg',
    color: '#0077b5',
  },
};