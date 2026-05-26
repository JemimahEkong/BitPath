'use client';

import { Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface LightningWithdrawalCardProps {
  onWithdraw: () => void;
}

export default function LightningWithdrawalCard({ onWithdraw }: LightningWithdrawalCardProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 hover:border-[#8C4F00]/30 hover:shadow-xl hover:shadow-black/20'
          : 'bg-white border-neutral-200 hover:border-[#8C4F00]/30 hover:shadow-xl hover:shadow-neutral-200/50'
      }`}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className="p-3 rounded-xl flex-shrink-0"
          style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}
        >
          <Zap className="w-6 h-6" style={{ color: '#8C4F00' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Bitcoin Lightning
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Send instantly to any Lightning-enabled wallet.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4" style={{ color: '#8C4F00' }} />
          <span className={`text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
            Near-instant delivery
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4" style={{ color: '#8C4F00' }} />
          <span className={`text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
            Zero network fees
          </span>
        </div>
      </div>

      <button
        onClick={onWithdraw}
        className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
        style={{ backgroundColor: '#8C4F00' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A65D00')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8C4F00')}
      >
        Send to Lightning Address
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
