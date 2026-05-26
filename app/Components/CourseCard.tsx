'use client';

import { BookOpen, Zap } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CourseThumbnail =
  | 'bitcoin'
  | 'wallet'
  | 'blockchain'
  | 'investing'
  | 'lightning'
  | 'mining';

export interface Course {
  id: string;
  title: string;
  description: string;
  /** Visual key that selects one of the bundled SVG illustrations. */
  thumbnail: CourseThumbnail;
  xpReward: number;
  lessonCount: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  /** 0-100 */
  progress: number;
}

// ---------------------------------------------------------------------------
// Thumbnail artwork
// ---------------------------------------------------------------------------

interface ThumbnailProps {
  variant: CourseThumbnail;
  isDark: boolean;
}

/**
 * Modular SVG illustrations. They render at any size, look good on light and
 * dark surfaces, and avoid any remote image dependency or `next.config.ts`
 * changes. Each variant gets its own palette so cards feel distinct in the
 * grid while staying within the BitPath brand range.
 */
function CourseThumbnailArt({ variant, isDark }: ThumbnailProps) {
  // Palette per variant — first stop is the soft background wash,
  // second stop is the accent used for the foreground graphic.
  const palettes: Record<CourseThumbnail, { from: string; to: string; accent: string }> = {
    bitcoin:    { from: '#F4D9B0', to: '#E0A35C', accent: '#8C4F00' },
    wallet:     { from: '#FBE3C2', to: '#D89248', accent: '#703F00' },
    blockchain: { from: '#E8DCC6', to: '#B58A56', accent: '#5C3A0E' },
    investing:  { from: '#F2D6A8', to: '#CB8B3F', accent: '#7A4308' },
    lightning:  { from: '#FCE8B8', to: '#E4A647', accent: '#8C4F00' },
    mining:     { from: '#EAD7B5', to: '#A9764A', accent: '#5C3A0E' },
  };

  const { from, to, accent } = palettes[variant];
  // Darken the wash slightly in dark mode so cards retain contrast.
  const bgFrom = isDark ? shade(from, -0.45) : from;
  const bgTo   = isDark ? shade(to,   -0.55) : to;

  return (
    <svg
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`bg-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgFrom} />
          <stop offset="100%" stopColor={bgTo} />
        </linearGradient>
        <linearGradient id={`accent-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#bg-${variant})`} />

      {/* Subtle decorative grid for an "editorial" feel */}
      <g stroke={accent} strokeOpacity={isDark ? 0.08 : 0.06} strokeWidth="1">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="220" />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} />
        ))}
      </g>

      {/* Variant-specific foreground graphic, all anchored around (200, 110) */}
      <g transform="translate(200 110)">
        {variant === 'bitcoin' && <BitcoinGlyph fill={`url(#accent-${variant})`} accent={accent} />}
        {variant === 'wallet' && <WalletGlyph fill={`url(#accent-${variant})`} accent={accent} />}
        {variant === 'blockchain' && <BlockchainGlyph fill={`url(#accent-${variant})`} accent={accent} />}
        {variant === 'investing' && <InvestingGlyph fill={`url(#accent-${variant})`} accent={accent} />}
        {variant === 'lightning' && <LightningGlyph fill={`url(#accent-${variant})`} accent={accent} />}
        {variant === 'mining' && <MiningGlyph fill={`url(#accent-${variant})`} accent={accent} />}
      </g>
    </svg>
  );
}

// --- Glyphs ----------------------------------------------------------------
// Each glyph is centered at (0, 0) and sized ~120px tall so the card
// thumbnails feel consistent regardless of variant.

function BitcoinGlyph({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <circle r="56" fill={fill} />
      <circle r="56" fill="none" stroke={accent} strokeOpacity="0.25" strokeWidth="2" />
      <text
        x="0"
        y="18"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
        fontSize="74"
        fontWeight="700"
        fill="#FFFFFF"
      >
        ₿
      </text>
    </g>
  );
}

function WalletGlyph({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <rect x="-70" y="-42" width="140" height="84" rx="14" fill={fill} />
      <rect x="-70" y="-42" width="140" height="22" rx="14" fill={accent} fillOpacity="0.35" />
      <circle cx="44" cy="0" r="10" fill="#FFFFFF" fillOpacity="0.85" />
      <circle cx="44" cy="0" r="4" fill={accent} />
    </g>
  );
}

function BlockchainGlyph({ fill, accent }: { fill: string; accent: string }) {
  const block = (x: number, y: number) => (
    <rect x={x - 22} y={y - 22} width="44" height="44" rx="8" fill={fill} stroke={accent} strokeOpacity="0.35" strokeWidth="1.5" />
  );
  return (
    <g>
      <line x1="-58" y1="-30" x2="0" y2="-30" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      <line x1="0"   y1="-30" x2="58" y2="-30" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      <line x1="-58" y1="30"  x2="0" y2="30"  stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      <line x1="0"   y1="30"  x2="58" y2="30"  stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      <line x1="-58" y1="-30" x2="-58" y2="30" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      <line x1="58"  y1="-30" x2="58"  y2="30" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      {block(-58, -30)}
      {block(58, -30)}
      {block(0, 0)}
      {block(-58, 30)}
      {block(58, 30)}
    </g>
  );
}

function InvestingGlyph({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      {/* Stylised bar chart */}
      <rect x="-66" y="-6"  width="22" height="46" rx="4" fill={fill} fillOpacity="0.7" />
      <rect x="-32" y="-22" width="22" height="62" rx="4" fill={fill} fillOpacity="0.85" />
      <rect x="2"   y="-40" width="22" height="80" rx="4" fill={fill} />
      <rect x="36"  y="-14" width="22" height="54" rx="4" fill={fill} fillOpacity="0.85" />
      {/* Trend line */}
      <polyline
        points="-55,10 -21,-6 13,-24 47,2"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="-24" r="4" fill={accent} />
    </g>
  );
}

function LightningGlyph({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <circle r="58" fill={fill} fillOpacity="0.35" />
      <circle r="38" fill={fill} fillOpacity="0.6" />
      <path
        d="M 6 -42 L -22 6 L -2 6 L -10 42 L 22 -10 L 2 -10 Z"
        fill="#FFFFFF"
        stroke={accent}
        strokeOpacity="0.4"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </g>
  );
}

function MiningGlyph({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      {/* Stacked server / rig silhouette */}
      <rect x="-60" y="-36" width="120" height="22" rx="6" fill={fill} />
      <rect x="-60" y="-8"  width="120" height="22" rx="6" fill={fill} fillOpacity="0.85" />
      <rect x="-60" y="20"  width="120" height="22" rx="6" fill={fill} fillOpacity="0.7" />
      <circle cx="-44" cy="-25" r="3" fill={accent} />
      <circle cx="-44" cy="3"   r="3" fill={accent} />
      <circle cx="-44" cy="31"  r="3" fill={accent} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Tiny color helper — lighten/darken a hex by an amount in [-1, 1].
// Pure function, no deps; sufficient for our gradient washes.
// ---------------------------------------------------------------------------

function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const adjust = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (amount >= 0 ? 255 - c : c) * amount)));
  const nr = adjust(r);
  const ng = adjust(g);
  const nb = adjust(b);
  return `#${((1 << 24) | (nr << 16) | (ng << 8) | nb).toString(16).slice(1)}`;
}

// ---------------------------------------------------------------------------
// CourseCard
// ---------------------------------------------------------------------------

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

const DIFFICULTY_STYLES: Record<Course['difficulty'], { bg: string; text: string }> = {
  Beginner:     { bg: 'rgba(34, 197, 94, 0.12)', text: '#16a34a' },
  Intermediate: { bg: 'rgba(140, 79, 0, 0.12)',  text: '#8C4F00' },
  Advanced:     { bg: 'rgba(239, 68, 68, 0.12)', text: '#dc2626' },
};

export function CourseCard({ course, onClick }: CourseCardProps) {
  const { isDark } = useTheme();
  const diff = DIFFICULTY_STYLES[course.difficulty];
  const hasProgress = course.progress > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-2xl overflow-hidden border transition-all duration-300 ease-out hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-2xl hover:shadow-black/40 focus:ring-[#A65D00] focus:ring-offset-neutral-950'
          : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/[0.06] focus:ring-[#8C4F00] focus:ring-offset-white'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <CourseThumbnailArt variant={course.thumbnail} isDark={isDark} />
        </div>
        {/* Difficulty pill */}
        <span
          className="absolute top-3 left-3 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full backdrop-blur-sm"
          style={{ backgroundColor: diff.bg, color: diff.text }}
        >
          {course.difficulty}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        <h3
          className={`font-semibold text-base sm:text-lg leading-snug mb-2 line-clamp-1 ${
            isDark ? 'text-neutral-50' : 'text-neutral-900'
          }`}
        >
          {course.title}
        </h3>
        <p
          className={`text-sm leading-relaxed mb-5 line-clamp-2 ${
            isDark ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        >
          {course.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5" style={{ color: '#8C4F00' }}>
            <Zap className="w-4 h-4" fill="currentColor" strokeWidth={0} />
            <span className="text-sm font-semibold">+{course.xpReward} XP</span>
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs ${
              isDark ? 'text-neutral-500' : 'text-neutral-500'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{course.lessonCount} lessons</span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-[11px] font-medium tracking-wide uppercase ${
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              Progress
            </span>
            <span
              className={`text-xs font-semibold tabular-nums ${
                hasProgress
                  ? ''
                  : isDark
                    ? 'text-neutral-500'
                    : 'text-neutral-400'
              }`}
              style={hasProgress ? { color: '#8C4F00' } : undefined}
            >
              {course.progress}%
            </span>
          </div>
          <div
            className={`h-1.5 rounded-full overflow-hidden ${
              isDark ? 'bg-neutral-800' : 'bg-neutral-100'
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.max(course.progress, 2)}%`,
                background: hasProgress
                  ? 'linear-gradient(to right, #8C4F00, #A65D00)'
                  : 'transparent',
              }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// CourseGrid — used by the "Recommended Learning Paths" section
// ---------------------------------------------------------------------------

interface CourseGridProps {
  courses: Course[];
  title?: string;
  /** Subtle right-aligned helper text shown in the header row. */
  subtitle?: string;
  onCourseClick?: (course: Course) => void;
}

export function CourseGrid({ courses, title, subtitle, onCourseClick }: CourseGridProps) {
  const { isDark } = useTheme();

  return (
    <section>
      {(title || subtitle) && (
        <div className="flex items-end justify-between gap-4 mb-6">
          {title && (
            <h2
              className={`font-[family-name:var(--font-space-grotesk)] text-xl sm:text-2xl font-semibold tracking-tight ${
                isDark ? 'text-neutral-50' : 'text-neutral-900'
              }`}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <span
              className={`text-xs sm:text-sm ${
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => onCourseClick?.(course)}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// LearningPaths — kept for backward compatibility with existing imports.
// Not used by the workspace page anymore, but other surfaces may rely on it.
// ---------------------------------------------------------------------------

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courseCount: number;
  totalXp: number;
  icon: React.ReactNode;
}

interface LearningPathsProps {
  paths: LearningPath[];
  onSelectPath?: (path: LearningPath) => void;
}

export function LearningPaths({ paths, onSelectPath }: LearningPathsProps) {
  const { isDark } = useTheme();

  return (
    <section>
      <h2
        className={`text-lg font-semibold mb-4 ${
          isDark ? 'text-neutral-100' : 'text-neutral-900'
        }`}
      >
        Learning Paths
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paths.map((path) => (
          <button
            key={path.id}
            type="button"
            onClick={() => onSelectPath?.(path)}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 hover:border-[#8C4F00]/50'
                : 'bg-white border-neutral-200 hover:border-[#8C4F00]/50 hover:shadow-lg'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}
              >
                {path.icon}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-1 ${
                    isDark ? 'text-neutral-100' : 'text-neutral-900'
                  }`}
                >
                  {path.title}
                </h3>
                <p
                  className={`text-sm mb-3 ${
                    isDark ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                >
                  {path.description}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>
                    {path.courseCount} courses
                  </span>
                  <span className="font-semibold" style={{ color: '#8C4F00' }}>
                    +{path.totalXp} XP
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
