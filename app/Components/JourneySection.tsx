'use client';

import { useState } from 'react';
import { 
  MessageCircle, 
  BookOpen, 
  HelpCircle, 
  Coins, 
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const journeySteps = [
  {
    id: 'ask',
    label: 'Ask',
    icon: MessageCircle,
    title: 'Ask Questions',
    description: 'Start with curiosity. Ask our AI tutor anything about Bitcoin, Lightning, or financial concepts. No question is too basic or too advanced.',
    features: ['Natural language conversations', 'Follow-up questions encouraged', 'Context-aware responses']
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: BookOpen,
    title: 'Absorb Knowledge',
    description: 'Dive into bite-sized lessons tailored to your level. Our AI breaks down complex topics into digestible, engaging content.',
    features: ['Interactive explanations', 'Real-world examples', 'Visual aids & diagrams']
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: HelpCircle,
    title: 'Test Understanding',
    description: 'Reinforce your learning with quick quizzes. Identify knowledge gaps and strengthen your understanding through active recall.',
    features: ['Instant feedback', 'Adaptive difficulty', 'Detailed explanations']
  },
  {
    id: 'earn',
    label: 'Earn',
    icon: Coins,
    title: 'Earn Rewards',
    description: 'Get rewarded for your efforts! Earn real Bitcoin (sats) for completing lessons and acing quizzes. Learning pays off—literally.',
    features: ['Real Bitcoin rewards', 'Streak multipliers', 'Achievement bonuses']
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: TrendingUp,
    title: 'Track Growth',
    description: 'Watch your knowledge and rewards grow. Track streaks, unlock levels, and see your journey from beginner to Bitcoin expert.',
    features: ['Visual progress tracking', 'Level progression', 'Personal statistics']
  }
];

export default function JourneySection() {
  const [activeStep, setActiveStep] = useState(0);
  const { isDark } = useTheme();

  return (
    <section className={`py-24 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-neutral-950' : 'bg-neutral-100'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className={isDark ? 'text-white' : 'text-neutral-900'}>The </span>
            <span style={{ background: 'linear-gradient(to right, #A65D00, #703F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              BitPath
            </span>
            <span className={isDark ? 'text-white' : 'text-neutral-900'}> Journey</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
            A simple 5-step path to mastering Bitcoin and earning while you learn
          </p>
        </div>

        {/* Timeline Navigation */}
        <div className="relative mb-12">
          {/* Connection Line */}
          <div className={`absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 hidden md:block ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'}`} />
          <div 
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 transition-all duration-500 hidden md:block"
            style={{ background: 'linear-gradient(to right, #8C4F00, #A65D00)', width: `${(activeStep / (journeySteps.length - 1)) * 100}%` }}
          />

          {/* Step Nodes */}
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isPast = index < activeStep;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  onMouseEnter={() => setActiveStep(index)}
                  className={`group relative flex flex-col items-center gap-2 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  {/* Node */}
                  <div 
                    className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'shadow-lg' 
                        : isPast 
                          ? '' 
                          : `${isDark ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-white border-neutral-200'} border-2`
                    }`}
                    style={
                      isActive 
                        ? { backgroundColor: '#8C4F00', boxShadow: '0 10px 25px rgba(140, 79, 0, 0.4)' }
                        : isPast
                          ? { backgroundColor: 'rgba(140, 79, 0, 0.8)' }
                          : undefined
                    }
                    onMouseEnter={(e) => {
                      if (!isActive && !isPast) {
                        e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive && !isPast) {
                        e.currentTarget.style.borderColor = isDark ? '#262626' : '#e5e5e5';
                      }
                    }}
                  >
                    <Icon 
                      className={`w-7 h-7 transition-colors ${
                        isActive || isPast ? 'text-black' : `${isDark ? 'text-gray-400' : 'text-neutral-500'}`
                      }`}
                      style={(!isActive && !isPast) ? { ['--hover-color' as string]: '#A65D00' } : undefined}
                    />
                  </div>

                  {/* Label */}
                  <span 
                    className={`font-semibold text-sm transition-colors ${
                      isActive ? '' : isPast ? '' : `${isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-neutral-500 group-hover:text-neutral-700'}`
                    }`}
                    style={isActive ? { color: '#A65D00' } : isPast ? { color: 'rgba(140, 79, 0, 0.7)' } : undefined}
                  >
                    {step.label}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                      <ChevronRight className="w-5 h-5 rotate-90" style={{ color: '#8C4F00' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Detail Panel */}
        <div className="mt-16 relative">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;

            return (
              <div
                key={step.id}
                className={`transition-all duration-500 ${
                  isActive 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className={`bg-gradient-to-br ${isDark ? 'from-[#1a1a1a] to-[#0d0d0d] border-[#262626]' : 'from-white to-neutral-50 border-neutral-200'} border rounded-2xl p-8 md:p-12`}>
                  <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
                        <Icon className="w-10 h-10" style={{ color: '#8C4F00' }} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)', color: '#A65D00' }}>
                          Step {index + 1}
                        </span>
                        <h3 className={`text-2xl md:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                          {step.title}
                        </h3>
                      </div>
                      <p className={`text-lg mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
                        {step.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-3">
                        {step.features.map((feature, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm ${isDark ? 'bg-[#0d0d0d] border-[#262626] text-gray-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'}`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8C4F00' }} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step Number */}
                    <div className="hidden md:block">
                      <span className={`text-8xl font-bold font-[family-name:var(--font-space-grotesk)] ${isDark ? 'text-[#1a1a1a]' : 'text-neutral-200'}`}>
                        0{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Progress Indicator (Mobile) */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {journeySteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeStep ? 'w-6' : isDark ? 'bg-[#262626]' : 'bg-neutral-200'
              }`}
              style={index === activeStep ? { backgroundColor: '#8C4F00' } : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
