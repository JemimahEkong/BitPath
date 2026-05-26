'use client';

import { Zap, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface HeroSectionProps {
  onCtaClick: () => void;
  isAuthenticated: boolean;
  onExploreHowItWorks: () => void;
}

export default function HeroSection({ onCtaClick, isAuthenticated, onExploreHowItWorks }: HeroSectionProps) {
  const { isDark } = useTheme();
  
  return (
    <section className="relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: isDark ? 'rgba(140, 79, 0, 0.05)' : 'rgba(140, 79, 0, 0.08)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: isDark ? 'rgba(140, 79, 0, 0.03)' : 'rgba(140, 79, 0, 0.05)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Pill Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full shadow-lg ${
          isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200'
        }`}>
          <span className="relative flex h-2 w-2">
            <span 
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: '#8C4F00' }}
            />
            <span 
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: '#8C4F00' }}
            />
          </span>
          <span className={`text-sm font-medium tracking-wide uppercase ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
            Hack4Freedom 2026
          </span>
          <Zap className="w-4 h-4" style={{ color: '#8C4F00' }} />
        </div>

        {/* Main Headline */}
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          <span className={isDark ? 'text-white' : 'text-neutral-900'}>Learn digital skills.</span>
          <br />
          <span style={{ color: '#8C4F00' }}>
            Earn real rewards.
          </span>
        </h1>

        {/* Subtext */}
        <p className={`max-w-2xl mx-auto text-lg sm:text-xl mb-10 leading-relaxed ${
          isDark ? 'text-neutral-400' : 'text-neutral-600'
        }`}>
          BitPath uses conversational AI and gamified rewards to make Bitcoin and financial education simple, engaging, and accessible.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCtaClick}
            className="group flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#8C4F00' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A65D00')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8C4F00')}
          >
            {isAuthenticated ? 'Continue Learning' : 'Start Learning'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onExploreHowItWorks}
            className={`flex items-center gap-2 px-8 py-4 bg-transparent border font-semibold rounded-full transition-all duration-300 ${
              isDark 
                ? 'border-neutral-700 hover:border-[#8C4F00]/50 text-white hover:bg-neutral-900'
                : 'border-neutral-300 hover:border-[#8C4F00]/50 text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Explore How It Works
          </button>
        </div>
      </div>
    </section>
  );
}
