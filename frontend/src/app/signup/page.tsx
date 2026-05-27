/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import OAuthButton from '../components/OAuthButton';

import ComprehensiveSignupForm from '../components/ComprehensiveSignupForm';

export default function SignupPage() {
  const [emailLoading, setEmailLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const router = useRouter();
  

  const handleSignup = async (formData: any) => {
    setEmailLoading(true);
    
    try {
      console.log('V1 signup data:', formData);
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Account created successfully!');
        router.push(`/login`);
      } else {
        const errorMessage = data.message || 'Signup failed. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: string) => {
    setOauthLoading(provider);
    
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      console.error('OAuth signup error:', error);
      toast.error(`${provider} signup failed. Please try again.`);
      setOauthLoading(null);
    }
  };



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
    <div  style={{ backgroundColor: 'var(--background-page)' }}>


      {/* Right Side - Signup Form */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div >


          {/* Signup Form Container */}
          <motion.div
            variants={itemVariants}
            style={{ backgroundColor: 'var(--background-card)' }}
          >
       

            {/* Comprehensive Signup Form */}
            <motion.div variants={itemVariants}>
              <ComprehensiveSignupForm
                onSubmit={handleSignup}
                loading={emailLoading}
              />
            </motion.div>


            {/* OAuth Buttons */}
            <motion.div
              variants={itemVariants}
              className="space-y-3"
            >
              <OAuthButton
                provider="google"
                onClick={() => handleOAuthSignup('google')}
                loading={oauthLoading === 'google'}
              />
              <OAuthButton
                provider="linkedin"
                onClick={() => handleOAuthSignup('linkedin')}
                loading={oauthLoading === 'linkedin'}
              />
            </motion.div>



            {/* Sign In Link */}
            <motion.div
              variants={itemVariants}
            
            >
   
                <button
                  onClick={() => router.push('/login')}
                  className="font-medium hover:underline transition-colors"
                  style={{ color: 'var(--text-link)' }}
                >
                  Sign In
                </button>
         
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Device Verification Modal */}
    </div>
  );
}
