'use client';

import Image from 'next/image';
import { CheckCircle, Zap, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface AuthSuccessModalProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onClose: () => void;
}

export default function AuthSuccessModal({ user, onClose }: AuthSuccessModalProps) {
  const { isDark } = useTheme();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-black/80' : 'bg-black/50'}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 ${
        isDark ? 'bg-[#0d0d0d] border border-[#262626]' : 'bg-white border border-neutral-200'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors z-10 ${
            isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-neutral-100'
          }`}
        >
          <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`} />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          {/* User Avatar (if available) */}
          {user.image && (
            <div className="mb-4 flex justify-center">
              <Image 
                src={user.image} 
                alt={user.name || 'User'} 
                width={64}
                height={64}
                className="rounded-full border-2"
                style={{ borderColor: 'rgba(140, 79, 0, 0.5)' }}
              />
            </div>
          )}

          {/* Welcome Message */}
          <h4 className={`text-2xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)] ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}>
            Welcome{user.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h4>
          
          <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
            You&apos;ve successfully signed in with Google.
          </p>
          
          {user.email && (
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>
              {user.email}
            </p>
          )}

          {/* Bonus Sats */}
          <div 
            className="p-4 rounded-xl mb-6 border"
            style={{ 
              backgroundColor: isDark ? 'rgba(140, 79, 0, 0.1)' : 'rgba(140, 79, 0, 0.05)',
              borderColor: isDark ? 'rgba(140, 79, 0, 0.3)' : 'rgba(140, 79, 0, 0.2)'
            }}
          >
            <div className="flex items-center justify-center gap-2" style={{ color: '#8C4F00' }}>
              <Zap className="w-5 h-5" />
              <span className="font-semibold text-lg">Move on to learning!</span>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
              Continue your journey and explore more about Bitcoin!
            </p>
          </div>

          {/* What's Next */}
          <div className={`text-left rounded-xl p-4 mb-6 ${
            isDark ? 'bg-[#1a1a1a]' : 'bg-neutral-50'
          }`}>
            <h5 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-neutral-700'}`}>What&apos;s next?</h5>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)', color: '#8C4F00' }}>1</span>
                Start with Bitcoin Basics course
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)', color: '#8C4F00' }}>2</span>
                Complete quizzes to earn more sats
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)', color: '#8C4F00' }}>3</span>
                Build your learning streak
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-3 text-black font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: '#8C4F00' }}
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
