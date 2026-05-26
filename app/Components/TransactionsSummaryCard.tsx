'use client';

import { useTheme } from './ThemeProvider';

interface TransactionsSummaryCardProps {
  title: string;
  btcAmount: string;
  usdAmount: string;
  icon: React.ReactNode;
  accentText?: string;
  accentLabel?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export default function TransactionsSummaryCard({
  title,
  btcAmount,
  usdAmount,
  icon,
  accentText,
  accentLabel,
  buttonLabel,
  onButtonClick,
}: TransactionsSummaryCardProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col relative ${
        isDark
          ? 'bg-neutral-900 border-neutral-800'
          : 'bg-white border-neutral-200 shadow-sm'
      }`}
    >
      <div className="absolute top-5 right-5">
        {icon}
      </div>

      <span className={`text-sm font-medium mb-3 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
        {title}
      </span>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold font-mono text-green-500">
          {btcAmount}
        </span>
      </div>

      <span className={`text-sm mb-4 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
        {usdAmount}
      </span>

      {accentText && (
        <p className={`text-xs mt-auto ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          {accentText}{' '}
          {accentLabel && (
            <span className="text-green-500 font-medium">{accentLabel}</span>
          )}
        </p>
      )}

      {buttonLabel && (
        <button
          onClick={onButtonClick}
          className="mt-4 w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98] hover:opacity-90"
          style={{ backgroundColor: '#8C4F00' }}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
