'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Bitcoin,
  Shield,
  Zap,
  Wallet,
  Sparkles,
  Lock,
  BookOpen,
  Flame,
  CheckCircle,
  Trophy,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

// ---------------------------------------------------------------------------
// Mock data — shaped for a future `GET /api/learner/overview` response
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  progress: number;     // 0-100 — used to drive the radial when selected
  courses: number;      // current courses count for this category
  sats: number;         // sats earned within this category
  lessons: number;      // lessons completed
  streak: number;       // current streak (days)
  quizzes: number;      // quizzes passed
  rewards: number;      // rewards unlocked
  comingSoon?: boolean;
}

const categories: Category[] = [
  { id: 'bitcoin-basics',     name: 'Bitcoin Basics',     icon: Bitcoin,  progress: 72, courses: 4, sats: 24_500, lessons: 38, streak: 6,  quizzes: 12, rewards: 5 },
  { id: 'wallet-safety',      name: 'Wallet Safety',      icon: Shield,   progress: 45, courses: 3, sats: 12_300, lessons: 21, streak: 3,  quizzes:  7, rewards: 3 },
  { id: 'lightning-payments', name: 'Lightning Payments', icon: Zap,      progress: 28, courses: 2, sats:  8_400, lessons: 11, streak: 2,  quizzes:  4, rewards: 2 },
  { id: 'personal-finance',   name: 'Personal Finance',   icon: Wallet,   progress: 14, courses: 1, sats:  3_900, lessons:  6, streak: 1,  quizzes:  2, rewards: 1 },
  { id: 'digital-skills',     name: 'Digital Skills',     icon: Sparkles, progress:  0, courses: 0, sats:      0, lessons:  0, streak: 0,  quizzes:  0, rewards: 0 },
  { id: 'coming-soon',        name: 'Coming Soon',        icon: Lock,     progress:  0, courses: 0, sats:      0, lessons:  0, streak: 0,  quizzes:  0, rewards: 0, comingSoon: true },
];

const USD_RATE = 0.01; // 1 sat = $0.01 (mock)

// ---------------------------------------------------------------------------
// Animated counter — small hook so both totals share the same ramp logic
// ---------------------------------------------------------------------------

function useCountTo(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // Smooth ease-out for a premium feel
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

interface CategoryPillProps {
  category: Category;
  isActive: boolean;
  isDark: boolean;
  onClick: () => void;
}

function CategoryPill({ category, isActive, isDark, onClick }: CategoryPillProps) {
  const Icon = category.icon;
  const disabled = !!category.comingSoon;

  // Base classes shared across all states
  const base =
    'group relative w-full flex items-center gap-3 px-4 py-3 rounded-full border text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  // Resolve appearance per state
  let appearance: string;
  let style: React.CSSProperties | undefined;

  if (isActive) {
    appearance = 'text-white border-transparent';
    style = {
      backgroundColor: '#8C4F00',
      boxShadow: isDark
        ? '0 8px 24px rgba(140, 79, 0, 0.35), 0 0 0 1px rgba(140, 79, 0, 0.4)'
        : '0 8px 20px rgba(140, 79, 0, 0.25)',
    };
  } else if (disabled) {
    appearance = isDark
      ? 'bg-neutral-900/60 border-neutral-800 text-neutral-500 cursor-not-allowed'
      : 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed';
  } else {
    appearance = isDark
      ? 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-[#8C4F00]/50 hover:bg-neutral-800/70'
      : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#8C4F00]/40 hover:bg-neutral-50';
  }

  const ringClass = isDark
    ? 'focus-visible:ring-[#A65D00] focus-visible:ring-offset-neutral-950'
    : 'focus-visible:ring-[#8C4F00] focus-visible:ring-offset-white';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      className={`${base} ${appearance} ${ringClass}`}
      style={style}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          isActive
            ? 'bg-white/15'
            : isDark
              ? 'bg-neutral-800'
              : 'bg-neutral-100'
        }`}
      >
        <Icon
          className="h-4 w-4"
          style={{ color: isActive ? '#FFFFFF' : '#8C4F00' }}
        />
      </span>
      <span className="truncate">{category.name}</span>
      {disabled && (
        <span
          className={`ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isDark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-200 text-neutral-500'
          }`}
        >
          Soon
        </span>
      )}
    </button>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  isDark: boolean;
}

function MiniStat({ label, value, icon: Icon, isDark }: MiniStatProps) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        isDark
          ? 'bg-neutral-900/70 border-neutral-800'
          : 'bg-neutral-50 border-neutral-200/80'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ backgroundColor: 'rgba(140, 79, 0, 0.12)' }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: '#8C4F00' }} />
        </span>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          }`}
        >
          {label}
        </span>
      </div>
      <div
        className={`text-lg font-bold font-mono tabular-nums ${
          isDark ? 'text-white' : 'text-neutral-900'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

interface RadialProgressProps {
  /** 0-100 */
  value: number;
  isDark: boolean;
}

function RadialProgress({ value, isDark }: RadialProgressProps) {
  const radius = 64;
  const stroke = 10;
  const size = (radius + stroke) * 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDark ? '#262626' : '#e5e5e5'}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#bp-progress)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="bp-progress" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8C4F00" />
            <stop offset="100%" stopColor="#A65D00" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tabular-nums ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}
        >
          {clamped}%
        </span>
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          }`}
        >
          Complete
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export default function CoursesDashboard() {
  const { isDark } = useTheme();
  const [selectedId, setSelectedId] = useState<string>(categories[0].id);

  const selected = useMemo(
    () => categories.find((c) => c.id === selectedId) ?? categories[0],
    [selectedId],
  );

  const animatedSats = useCountTo(selected.sats);
  const usdValue = (animatedSats * USD_RATE).toFixed(2);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section intro — kept short, the dashboard does the heavy lifting */}
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className={isDark ? 'text-white' : 'text-neutral-900'}>
              Your Learning{' '}
            </span>
            <span
              style={{
                background: 'linear-gradient(to right, #A65D00, #703F00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Dashboard
            </span>
          </h2>
          <p
            className={`text-base sm:text-lg max-w-2xl mx-auto ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            Pick a path, track your progress, and watch your sats grow.
          </p>
        </div>

        {/* The dashboard panel itself */}
        <div
          className={`relative overflow-hidden rounded-[28px] border ${
            isDark
              ? 'bg-neutral-950 border-neutral-800/80 shadow-2xl shadow-black/40'
              : 'bg-white border-neutral-200/80 shadow-xl shadow-neutral-900/[0.06]'
          }`}
        >
          {/* Ambient brand glow — subtle, only visible in dark mode */}
          <div
            className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full blur-3xl"
            style={{
              backgroundColor: isDark ? 'rgba(140, 79, 0, 0.18)' : 'rgba(140, 79, 0, 0.07)',
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full blur-3xl"
            style={{
              backgroundColor: isDark ? 'rgba(140, 79, 0, 0.08)' : 'rgba(140, 79, 0, 0.04)',
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-10">
            {/* -------- Left: category selection -------- */}
            <div className="lg:col-span-3">
              <h3
                className={`font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-bold leading-tight mb-2 ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}
              >
                What do you want to master first?
              </h3>
              <p
                className={`text-sm mb-6 ${
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                }`}
              >
                Choose a category to see your stats and rewards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <CategoryPill
                    key={cat.id}
                    category={cat}
                    isActive={cat.id === selected.id}
                    isDark={isDark}
                    onClick={() => setSelectedId(cat.id)}
                  />
                ))}
              </div>
            </div>

            {/* -------- Right: stats card -------- */}
            <div className="lg:col-span-2">
              <div
                className={`h-full rounded-2xl border p-6 flex flex-col ${
                  isDark
                    ? 'bg-neutral-900/80 border-neutral-800'
                    : 'bg-neutral-50 border-neutral-200/80'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      isDark ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    Your Stats
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(140, 79, 0, 0.12)', color: '#8C4F00' }}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {selected.name}
                  </span>
                </div>

                {/* Radial + counts */}
                <div className="flex items-center gap-6 mb-6">
                  <RadialProgress value={selected.progress} isDark={isDark} />
                  <div className="flex-1 min-w-0">
                    <div className="mb-4">
                      <div
                        className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                          isDark ? 'text-neutral-500' : 'text-neutral-400'
                        }`}
                      >
                        Current courses
                      </div>
                      <div
                        className={`font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tabular-nums ${
                          isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        {selected.courses}
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                          isDark ? 'text-neutral-500' : 'text-neutral-400'
                        }`}
                      >
                        Total sats earned
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`font-mono text-xl font-bold tabular-nums ${
                            isDark ? 'text-white' : 'text-neutral-900'
                          }`}
                        >
                          {animatedSats.toLocaleString()}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'rgba(140, 79, 0, 0.12)',
                            color: '#8C4F00',
                          }}
                        >
                          ≈ ${usdValue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini stat boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 mt-auto">
                  <MiniStat label="Lessons" value={selected.lessons} icon={BookOpen} isDark={isDark} />
                  <MiniStat label="Streak"  value={`${selected.streak}d`} icon={Flame} isDark={isDark} />
                  <MiniStat label="Quizzes" value={selected.quizzes} icon={CheckCircle} isDark={isDark} />
                  <MiniStat label="Rewards" value={selected.rewards} icon={Trophy} isDark={isDark} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
