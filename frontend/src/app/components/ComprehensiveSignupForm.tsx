'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 

  DollarSign, Check, AlertCircle
} from 'lucide-react';




interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ComprehensiveSignupFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function ComprehensiveSignupForm({ onSubmit, loading = false }: ComprehensiveSignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const totalSteps = 1; // V1 Simplified - single step form
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      await onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // V1 Simplified - No communication channels toggle needed

  const renderStep = () => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >

        {/* Email */}
        <div>
          <label >
            Email 
          </label>
          <div >
  
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
             
              style={{ 
                backgroundColor: 'var(--background-card)', 
                borderColor: errors.email ? '#ef4444' : 'var(--input-border)',
                color: 'var(--text-primary)'
              }}
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label >
            Password 
          </label>
          <div >
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              
              style={{ 
                backgroundColor: 'var(--background-card)', 
                borderColor: errors.password ? '#ef4444' : 'var(--input-border)',
                color: 'var(--text-primary)'
              }}
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label >
            Confirm Password 
          </label>
          <div >
       
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
             
              style={{ 
                backgroundColor: 'var(--background-card)', 
                borderColor: errors.confirmPassword ? '#ef4444' : 'var(--input-border)',
                color: 'var(--text-primary)'
              }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
             
              style={{ color: 'var(--text-muted)' }}
            >
              showConfirmPassword 
            </button>
          </div>
         
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" style={{ backgroundColor: 'var(--background-secondary)' }}>
          <motion.div
            className="h-2 rounded-full transition-all duration-300"
            style={{ backgroundColor: 'var(--primary)', width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="min-h-100">
          {renderStep()}
        </div>

        {/* Submit Button - V1 Simplified */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors shadow-sm w-full max-w-xs"
            style={{ 
              backgroundColor: loading ? 'var(--text-muted)' : 'var(--primary)', 
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
