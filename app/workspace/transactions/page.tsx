'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, TrendingUp, ArrowDownToLine } from 'lucide-react';
import { useTheme } from '../../Components/ThemeProvider';
import WorkspaceSidebar from '../../Components/WorkspaceSidebar';
import TransactionsSummaryCard from '../../Components/TransactionsSummaryCard';
import TransactionsEmptyState from '../../Components/TransactionsEmptyState';

export default function TransactionsPage() {
  const { isDark } = useTheme();
  const router = useRouter();

  const handleNewChat = useCallback(() => {
    router.push('/workspace');
  }, [router]);

  const handleStartLearning = useCallback(() => {
    router.push('/workspace');
  }, [router]);

  const handleViewRewards = useCallback(() => {
    router.push('/workspace');
  }, [router]);

  const handleWithdraw = useCallback(() => {
    router.push('/workspace/withdraw');
  }, [router]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      <WorkspaceSidebar onNewChat={handleNewChat} />

      <main className="lg:pl-72 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.back()}
                className={`p-2 rounded-xl transition-colors mt-1 ${
                  isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-500'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] mb-1 ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}>
                  Transactions
                </h1>
                <p className={`text-sm sm:text-base ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  All your earnings and withdrawals
                </p>
              </div>
            </div>

            <button
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                isDark
                  ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Upgrade
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <TransactionsSummaryCard
              title="Available Balance"
              btcAmount="0.000542 BTC"
              usdAmount="≈ $542.12 USD"
              icon={<Wallet className="w-5 h-5" style={{ color: '#8C4F00' }} />}
              buttonLabel="Withdraw"
              onButtonClick={handleWithdraw}
            />
            <TransactionsSummaryCard
              title="Total Earned"
              btcAmount="0.000542 BTC"
              usdAmount="≈ $542.12 USD"
              icon={<TrendingUp className="w-5 h-5" style={{ color: '#8C4F00' }} />}
              accentText="Rewards from"
              accentLabel="lessons"
            />
            <TransactionsSummaryCard
              title="Total Withdrawn"
              btcAmount="0.000000 BTC"
              usdAmount="≈ $0.00 USD"
              icon={<ArrowDownToLine className="w-5 h-5" style={{ color: '#8C4F00' }} />}
              accentText="Last withdrawal to"
              accentLabel="Lightning"
            />
          </div>

          {/* Transactions List Container */}
          <div
            className={`rounded-2xl border ${
              isDark
                ? 'bg-neutral-900 border-neutral-800'
                : 'bg-white border-neutral-200 shadow-sm'
            }`}
          >
            <TransactionsEmptyState
              onStartLearning={handleStartLearning}
              onViewRewards={handleViewRewards}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
