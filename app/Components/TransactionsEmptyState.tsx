'use client';

import { History } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface TransactionsEmptyStateProps {
  onStartLearning: () => void;
  onViewRewards: () => void;
}

export default function TransactionsEmptyState({ onStartLearning, onViewRewards }: TransactionsEmptyStateProps) {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: isDark ? 'rgba(140, 79, 0, 0.12)' : 'rgba(140, 79, 0, 0.08)' }}
      >
        <History className="w-7 h-7" style={{ color: '#8C4F00' }} />
      </div>

      <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
        No Transactions Yet
      </h3>

      <p className={`text-sm text-center max-w-md mb-8 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
        Start your Bitcoin learning journey! Complete lessons and quizzes to earn your first satoshis. Your transaction history will appear here.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onStartLearning}
          className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98] hover:opacity-90"
          style={{ backgroundColor: '#8C4F00' }}
        >
          Start Learning
        </button>
        <button
          onClick={onViewRewards}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-200 active:scale-[0.98] ${
            isDark
              ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
              : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          View Rewards
        </button>
      </div>
    </div>
  );
}
