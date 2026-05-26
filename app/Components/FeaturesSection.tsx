'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Trophy, 
  BookOpen, 
  Route, 
  Bitcoin, 
  Calendar,
  Sparkles,
  Zap,
  Flame
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TOTAL_LESSONS = 24;

export default function FeaturesSection() {
  const { isDark } = useTheme();
  const [streakDays, setStreakDays] = useState<number[]>([0, 1, 2, 3, 4]);

  const toggleDay = (index: number) => {
    setStreakDays(prev => 
      prev.includes(index) 
        ? prev.filter(d => d !== index)
        : [...prev, index]
    );
  };

  const activeCount = streakDays.length;
  // Mock lessons-completed signal so the card stays meaningful as the user
  // toggles days. ~2 lessons per active day, capped at the total.
  const lessonsCompleted = Math.min(activeCount * 2, TOTAL_LESSONS);
  const progressPct = Math.round((lessonsCompleted / TOTAL_LESSONS) * 100);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className={isDark ? 'text-white' : 'text-neutral-900'}>Redefining Education for the </span>
            <span style={{ background: 'linear-gradient(to right, #A65D00, #703F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Digital Age
            </span>
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg max-w-2xl mx-auto`}>
            A learning experience designed for the future of finance
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Conversational AI Learning (Wide) */}
          <div 
            className={`lg:col-span-2 bg-gradient-to-br ${isDark ? 'from-[#1a1a1a] to-[#0d0d0d]' : 'from-white to-neutral-50'} border ${isDark ? 'border-[#262626]' : 'border-neutral-200'} rounded-2xl p-6 transition-all card-hover`}
            style={{ ['--hover-border-color' as string]: 'rgba(140, 79, 0, 0.3)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#262626' : '#e5e5e5'}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
                <MessageSquare className="w-6 h-6" style={{ color: '#8C4F00' }} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Conversational AI Learning</h3>
            </div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Learn through natural conversations with our AI tutor. Ask questions, get explanations, and build understanding at your own pace.
            </p>
            {/* Chat Skeleton Mockup */}
            <div className={`space-y-3 ${isDark ? 'bg-[#0d0d0d]' : 'bg-neutral-50'} rounded-xl p-4`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)' }} />
                <div className="space-y-2 flex-1">
                  <div className={`h-3 ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'} rounded-full w-3/4`} />
                  <div className={`h-3 ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'} rounded-full w-1/2`} />
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'} flex-shrink-0`} />
                <div className="space-y-2 flex-1 flex flex-col items-end">
                  <div className="h-3 rounded-full w-2/3" style={{ backgroundColor: 'rgba(140, 79, 0, 0.3)' }} />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)' }} />
                <div className="space-y-2 flex-1">
                  <div className={`h-3 ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'} rounded-full w-5/6`} />
                  <div className={`h-3 ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'} rounded-full w-2/3`} />
                  <div className={`h-3 ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'} rounded-full w-1/3`} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Gamified XP & Rewards */}
          <div 
            className={`bg-gradient-to-br ${isDark ? 'from-[#1a1a1a] to-[#0d0d0d]' : 'from-white to-neutral-50'} border ${isDark ? 'border-[#262626]' : 'border-neutral-200'} rounded-2xl p-6 transition-all card-hover relative overflow-hidden`}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#262626' : '#e5e5e5'}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
                <Trophy className="w-6 h-6" style={{ color: '#8C4F00' }} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Gamified XP & Rewards</h3>
            </div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Earn XP and real Bitcoin rewards as you learn. Level up and unlock new achievements.
            </p>
            {/* Floating Badges */}
            <div className="relative h-24">
              <div className="absolute top-0 left-4 px-3 py-1.5 border rounded-full text-sm font-bold animate-bounce" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)', borderColor: 'rgba(140, 79, 0, 0.3)', color: '#A65D00', animationDelay: '0ms' }}>
                +50 XP
              </div>
              <div className="absolute top-6 right-4 px-3 py-1.5 border rounded-full text-sm font-bold animate-bounce" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)', borderColor: 'rgba(140, 79, 0, 0.3)', color: '#A65D00', animationDelay: '200ms' }}>
                <Bitcoin className="w-4 h-4 inline mr-1" />
                100 sats
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-3 py-1.5 border rounded-full text-sm font-bold animate-bounce" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)', borderColor: 'rgba(140, 79, 0, 0.3)', color: '#A65D00', animationDelay: '400ms' }}>
                Level Up!
              </div>
            </div>
          </div>

          {/* Card 3: Bite-sized Lessons */}
          <div 
            className={`bg-gradient-to-br ${isDark ? 'from-[#1a1a1a] to-[#0d0d0d]' : 'from-white to-neutral-50'} border ${isDark ? 'border-[#262626]' : 'border-neutral-200'} rounded-2xl p-6 transition-all card-hover`}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#262626' : '#e5e5e5'}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
                <BookOpen className="w-6 h-6" style={{ color: '#8C4F00' }} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Bite-sized Lessons</h3>
            </div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Short, focused lessons that fit your schedule. Learn complex concepts in just 5-10 minutes.
            </p>
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-2 ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'} rounded-full overflow-hidden`}>
                <div className="h-full w-3/4 rounded-full" style={{ background: 'linear-gradient(to right, #8C4F00, #A65D00)' }} />
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>5 min</span>
            </div>
          </div>

          {/* Card 4: Personalized Paths */}
          <div 
            className={`bg-gradient-to-br ${isDark ? 'from-[#1a1a1a] to-[#0d0d0d]' : 'from-white to-neutral-50'} border ${isDark ? 'border-[#262626]' : 'border-neutral-200'} rounded-2xl p-6 transition-all card-hover`}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#262626' : '#e5e5e5'}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
                <Route className="w-6 h-6" style={{ color: '#8C4F00' }} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Personalized Paths</h3>
            </div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              AI adapts to your learning style and pace. Your journey is uniquely yours.
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-10 flex-1 rounded ${i > 3 ? (isDark ? 'bg-[#262626]' : 'bg-neutral-200') : ''}`}
                  style={i <= 3 ? { backgroundColor: '#8C4F00', transform: `scaleY(${0.4 + i * 0.15})`, transformOrigin: 'bottom' } : { transform: `scaleY(${0.4 + i * 0.15})`, transformOrigin: 'bottom' }}
                />
              ))}
            </div>
          </div>

          {/* Card 5: Bitcoin Focused */}
          <div 
            className={`bg-gradient-to-br ${isDark ? 'from-[#1a1a1a] to-[#0d0d0d]' : 'from-white to-neutral-50'} border ${isDark ? 'border-[#262626]' : 'border-neutral-200'} rounded-2xl p-6 transition-all card-hover`}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#262626' : '#e5e5e5'}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
                <Bitcoin className="w-6 h-6" style={{ color: '#8C4F00' }} />
              </div>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Bitcoin Focused</h3>
            </div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Deep-dive into Bitcoin, Lightning, and the future of money with expert-curated content.
            </p>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)' }}>
                  <Zap className="w-8 h-8" style={{ color: '#8C4F00' }} />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 animate-pulse" style={{ color: '#A65D00' }} />
              </div>
            </div>
          </div>

          {/* Card 6: Progress Tracking & Streaks (Wide) */}
          <div 
            className={`lg:col-span-3 bg-gradient-to-br ${isDark ? 'from-[#1a1a1a] to-[#0d0d0d]' : 'from-white to-neutral-50'} border ${isDark ? 'border-[#262626]' : 'border-neutral-200'} rounded-2xl p-6 sm:p-8 transition-all card-hover`}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#262626' : '#e5e5e5'}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#8C4F00' }} />
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  Progress & Streaks
                </h3>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)', color: '#8C4F00' }}
              >
                <Flame className="w-3.5 h-3.5" />
                {activeCount}-day streak
              </div>
            </div>

            <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tap a day to log your learning.
            </p>

            {/* Day row + stats live in a single calm row on desktop */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Day dots */}
              <div className="flex items-center justify-between sm:justify-start sm:gap-3 lg:gap-4">
                {days.map((label, index) => {
                  const isActive = streakDays.includes(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      aria-pressed={isActive}
                      aria-label={`Toggle day ${index + 1}`}
                      className={`flex flex-col items-center gap-2 group focus:outline-none`}
                    >
                      <span
                        className={`flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'text-white'
                            : isDark
                              ? 'bg-neutral-900 border border-neutral-800 text-neutral-500 group-hover:border-[#8C4F00]/40'
                              : 'bg-white border border-neutral-200 text-neutral-400 group-hover:border-[#8C4F00]/40'
                        }`}
                        style={
                          isActive
                            ? { backgroundColor: '#8C4F00' }
                            : undefined
                        }
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Stats — just the essentials */}
              <div className="flex items-stretch gap-6 sm:gap-8">
                <div>
                  <div className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>
                    Progress
                  </div>
                  <div className={`font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tabular-nums ${
                    isDark ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {progressPct}%
                  </div>
                </div>
                <div className={`w-px ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                <div>
                  <div className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>
                    Lessons
                  </div>
                  <div className={`font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tabular-nums ${
                    isDark ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {lessonsCompleted}<span className={`text-base font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>/{TOTAL_LESSONS}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slim progress bar */}
            <div className={`mt-6 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(to right, #8C4F00, #A65D00)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
