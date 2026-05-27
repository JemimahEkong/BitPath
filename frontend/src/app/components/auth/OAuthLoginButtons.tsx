'use client';

import { useState } from 'react';
import { useOAuthStore } from '@/app/store/auth/login/oauth/oauthStore';
import OAuthButton from '../OAuthButton';
import { AlertCircle } from 'lucide-react';

interface OAuthLoginButtonsProps {
  className?: string;
}

export function OAuthLoginButtons({ className }: OAuthLoginButtonsProps) {
  const { error, initiateOAuth } = useOAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'linkedin') => {
    try {
      setLoadingProvider(provider);
      await initiateOAuth(provider);
    } catch (error) {
      console.error('OAuth login error:', error);
      setLoadingProvider(null);
    }
  };

  return (
    <div >


      <div>
        <OAuthButton
          provider="google"
          onClick={() => handleOAuthLogin('google')}
          loading={loadingProvider === 'google'}
        />
        <OAuthButton
          provider="linkedin"
          onClick={() => handleOAuthLogin('linkedin')}
          loading={loadingProvider === 'linkedin'}
        />
      </div>
    </div>
  );
}
