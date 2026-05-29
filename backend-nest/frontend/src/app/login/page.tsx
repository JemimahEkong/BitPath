/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LoginFormWithRecaptcha from '../components/LoginFormWithRecaptcha';
import { OAuthLoginButtons } from '../components/auth/OAuthLoginButtons';
import { useSearchParams } from 'next/navigation';
import { useOAuthStore } from '@/app/store/auth/login/oauth/oauthStore';

function LoginContent() {
  const [emailLoading, setEmailLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useOAuthStore();
  


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

  const handleLogin = async (loginData: { email: string; password: string}) => {
    setEmailLoading(true);
    
    try {
      console.log('Login data:', { ...loginData, password: '[HIDDEN]' });
      
      // Call backend API with error boundary
      let response;
      try {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password
          }),
        });
      } catch (fetchError) {
        console.log('🔍 Fetch error:', fetchError);
        throw new Error('Network error: Unable to connect to server');
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.log('🔍 JSON parse error:', jsonError);
        throw new Error('Server response error: Invalid response format');
      }

      if (data.success) {
        // Success path
        try {
          toast.success('Login successful! Welcome back.');
        } catch (toastError) {
          console.log('🔍 Success toast error:', toastError);
        }
        
   

        // Check redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/dashboard';
        
   
          console.log('🔐 LOGIN PAGE: No device verification required, redirecting');
          try {
            router.push(redirectTo);
          } catch (routerError) {
            console.log('🔍 Router push error:', routerError);
          }
        
      } else {
        // Error path
        const errorMessage = data.message || 'Login failed. Please check your credentials.';
        try {
          toast.error(errorMessage, {
            duration: 5000,
            style: {
              background: '#ef4444',
              color: 'white',
            },
          });
        } catch (toastError) {
          console.log('🔍 Error toast error:', toastError);
        }
        // Error handled by toast - no console.error needed
      }
    } catch (error: any) {
      // Debug the exact error structure
      console.log('🔍 CATCH BLOCK - Error type:', typeof error);
      console.log('🔍 CATCH BLOCK - Error constructor:', error?.constructor?.name);
      console.log('🔍 CATCH BLOCK - Error keys:', Object.keys(error || {}));
      console.log('🔍 CATCH BLOCK - Error message:', error?.message);
      console.log('🔍 CATCH BLOCK - Full error:', error);
      
      // Only handle real errors
      if (error && error.message && typeof error.message === 'string' && error.message.trim() !== '') {
        toast.error(error.message, {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: 'white',
          },
        });
      } else {
        // Silently ignore all other errors (empty objects, null, undefined, etc.)
        console.log('🔍 CATCH BLOCK - Silently ignoring error:', error);
      }
    } finally {
      setEmailLoading(false);
    }
  };

  // ✅ SECURITY: Don't load email or rememberMe from localStorage for security
  // Users will set their preferences each session for better security



  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div style={{ backgroundColor: 'var(--background-page)' }}>

      {/* Right Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
       
      >
        <div className="w-full max-w-md">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Login Form Container */}
          <motion.div
            variants={itemVariants}
           
            style={{ backgroundColor: 'var(--background-card)' }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <p>sighuin</p>
            </div>

            {/* Login Form */}
            <motion.div variants={itemVariants}>
              <LoginFormWithRecaptcha onSubmit={handleLogin} loading={emailLoading} />
            </motion.div>

  

            {/* OAuth Buttons */}
            <motion.div
              variants={itemVariants}
            >
              <OAuthLoginButtons />
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              variants={itemVariants}
            >
              <p  style={{ color: 'var(--text-secondary)' }}>
                
                <a
                  href="/signup"
             
                  style={{ color: 'var(--primary)' }}
                >
                Sign up here
                </a>
              </p>
            </motion.div>
          </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Main component
export default function LoginPage() {
  return <LoginContent />;
}
