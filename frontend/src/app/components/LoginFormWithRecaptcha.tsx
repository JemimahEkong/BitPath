'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { getCaptchaToken, renderRecaptcha, resetRecaptcha } from '../../../lib/captcha';

interface LoginFormWithRecaptchaProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading: boolean;
}

export default function LoginFormWithRecaptcha({ onSubmit, loading }: LoginFormWithRecaptchaProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Clear reCAPTCHA error when user starts typing again
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: '' }));
    }
    

      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
   
      
      console.log('✅ reCAPTCHA verified successfully');
      
      await onSubmit({
        email: formData.email,
        password: formData.password
      });
    } catch (error) {
      console.error('❌ reCAPTCHA error:', error);
      setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA verification failed' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div >
        <label htmlFor="email" >
Email Address
        </label>
        <div >
          
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
        </div>
       
      </div>

      {/* Password Field */}
      <div >
        <label htmlFor="password">
          Password
        </label>
        <div >
        
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
 
          </button>
        </div>
       
      </div>

    

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: (loading) ? 1 : 1.02 }}
        whileTap={{ scale: (loading) ? 1 : 0.98 }}
      >
    Sign In

      </motion.button>
    </form>
  );
}
