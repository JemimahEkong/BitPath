/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import toast from 'react-hot-toast';
import { useOAuthStore } from '@/app/store/auth/login/oauth/oauthStore';

const SunIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

function LoginContent() {
  const [isDark, setIsDark] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useOAuthStore();

  const t = {
    bg: isDark ? '#0a0a0b' : '#f8f8fa',
    cardBg: isDark ? 'rgba(22,22,24,0.7)' : 'rgba(255,255,255,0.8)',
    text: isDark ? '#ffffff' : '#1a1a2e',
    textSecondary: isDark ? '#e5e2e3' : '#3a3a4e',
    muted: isDark ? '#a1a1aa' : '#6b7280',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    shadow: isDark ? 'inset 0px 1px 1px 0px rgba(255,255,255,0.05)' : 'inset 0px 1px 1px 0px rgba(0,0,0,0.02)',
    accent: '#ffb874',
    accentDark: '#f7931a',
    accentMuted: isDark ? '#8c4f00' : '#d48a2a',
    navActiveBg: isDark ? 'rgba(28,27,28,0.5)' : 'rgba(240,240,242,0.5)',
  };

  // Handle OAuth callbacks
  React.useEffect(() => {
    const oauth = searchParams.get('oauth');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (oauth || error) {
      const url = searchParams.toString();
      if (url) {
        handleOAuthCallback(url);
      }
    }
  }, [searchParams, handleOAuthCallback]);

  const handleLogin = async (loginData: { email: string; password: string }) => {
    setEmailLoading(true);
    try {
      let response;
      try {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
        });
      } catch {
        throw new Error('Network error: Unable to connect to server');
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server response error: Invalid response format');
      }

      if (data.success) {
        toast.success('Login successful! Welcome back.');
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
      } else {
        toast.error(data.message || 'Login failed. Please check your credentials.', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      if (error?.message && typeof error.message === 'string' && error.message.trim() !== '') {
        toast.error(error.message, { duration: 5000 });
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setOauthLoading(provider);
    try {
      window.location.href = `/api/auth/oauth?provider=${provider}`;
    } catch {
      toast.error(`${provider} login failed. Please try again.`);
      setOauthLoading(null);
    }
  };

  return (
    <div style={{ backgroundColor: t.bg, minHeight: '100vh', overflow: 'hidden' }}>
      {/* Theme Toggle */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 50 }}>
        <div style={{
          display: 'flex',
          gap: 4,
          padding: 5,
          borderRadius: 9999,
          border: `1px solid ${t.border}`,
          backgroundColor: t.navActiveBg,
          backdropFilter: 'blur(6px)',
        }}>
          <div
            onClick={() => setIsDark(false)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: !isDark ? t.accent : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: !isDark ? '#2d1600' : t.muted,
              transition: 'all 0.2s',
            }}
          >
            <SunIcon size={16} />
          </div>
          <div
            onClick={() => setIsDark(true)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: isDark ? t.accent : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isDark ? '#2d1600' : t.muted,
              transition: 'all 0.2s',
            }}
          >
            <MoonIcon size={14} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: 448,
            borderRadius: 32,
            border: `1px solid ${t.border}`,
            backgroundColor: t.cardBg,
            backdropFilter: 'blur(10px)',
            padding: 33,
            boxShadow: t.shadow,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Heading */}
            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 700,
                fontSize: 32,
                lineHeight: '36px',
                color: t.accent,
                margin: '0 0 8px',
              }}>
                BitPath
              </h1>
              <p style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '20px',
                color: t.muted,
                margin: 0,
              }}>
                Welcome back
              </p>
            </div>

            {/* Login Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const email = (fd.get('email') as string) || '';
                const password = (fd.get('password') as string) || '';
                if (!email.trim()) { toast.error('Email is required'); return; }
                if (!password) { toast.error('Password is required'); return; }
                await handleLogin({ email, password });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              <div>
                <label style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 500,
                  fontSize: 14,
                  color: t.textSecondary,
                  display: 'block',
                  marginBottom: 8,
                }}>
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 12,
                    border: `1px solid ${t.border}`,
                    backgroundColor: 'transparent',
                    padding: '0 16px',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 400,
                    fontSize: 16,
                    color: t.textSecondary,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = t.accent}
                  onBlur={(e) => e.currentTarget.style.borderColor = t.border}
                />
              </div>

              <div>
                <label style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 500,
                  fontSize: 14,
                  color: t.textSecondary,
                  display: 'block',
                  marginBottom: 8,
                }}>
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 12,
                    border: `1px solid ${t.border}`,
                    backgroundColor: 'transparent',
                    padding: '0 16px',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 400,
                    fontSize: 16,
                    color: t.textSecondary,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = t.accent}
                  onBlur={(e) => e.currentTarget.style.borderColor = t.border}
                />
              </div>

              <motion.button
                type="submit"
                disabled={emailLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 12,
                  border: 'none',
                  backgroundColor: t.accentDark,
                  color: '#2d1600',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: emailLoading ? 'not-allowed' : 'pointer',
                  opacity: emailLoading ? 0.6 : 1,
                  marginTop: 4,
                }}
              >
                {emailLoading ? 'Signing In...' : 'Sign In'}
              </motion.button>
            </form>

            {/* OR Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: t.border }} />
              <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 14, color: t.muted }}>
                OR
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: t.border }} />
            </div>

            {/* OAuth Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleOAuthLogin('google')}
                disabled={oauthLoading === 'google'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  width: '100%',
                  height: 52,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 500,
                  fontSize: 16,
                  color: t.textSecondary,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.backgroundColor = isDark ? 'rgba(42,42,43,0.5)' : 'rgba(240,240,242,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleOAuthLogin('linkedin')}
                disabled={oauthLoading === 'linkedin'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  width: '100%',
                  height: 52,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 500,
                  fontSize: 16,
                  color: t.textSecondary,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.backgroundColor = isDark ? 'rgba(42,42,43,0.5)' : 'rgba(240,240,242,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                {oauthLoading === 'linkedin' ? 'Redirecting...' : 'Continue with LinkedIn'}
              </motion.button>
            </div>

            {/* Sign Up Link */}
            <p style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 400,
              fontSize: 14,
              color: t.muted,
              textAlign: 'center',
              margin: 0,
            }}>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/signup')}
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: t.accent,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary for useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f8fa',
      }}>
        <span style={{ fontFamily: 'var(--font-inter)', color: '#6b7280' }}>Loading...</span>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
