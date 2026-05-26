'use client';

import { Bitcoin, TrendingUp } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function WithdrawBalanceCard() {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-6 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-[#8C4F00]/15 via-neutral-900 to-neutral-950 border-[#8C4F00]/25'
          : 'bg-gradient-to-br from-[#8C4F00]/8 via-white to-neutral-50 border-[#8C4F00]/20'
      }`}
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(140, 79, 0, 0.08)' }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Available Balance
          </span>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(140, 79, 0, 0.12)', color: '#8C4F00' }}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Top Learner
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-1">
          <span className={`text-4xl font-bold font-mono ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            54,212
          </span>
          <span className={`text-lg font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            sats
          </span>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <Bitcoin className="w-4 h-4" style={{ color: '#8C4F00' }} />
          <span className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            ≈ $542.12 USD
          </span>
        </div>

        <div className={`h-px ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />

        <div className="flex items-center justify-between mt-4 text-sm">
          <span className={isDark ? 'text-neutral-500' : 'text-neutral-500'}>
            Lifetime earned
          </span>
          <span className={`font-semibold font-mono ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            54,212 sats
          </span>
        </div>
      </div>
    </div>
  );
}
