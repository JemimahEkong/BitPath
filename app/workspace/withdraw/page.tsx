'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../Components/ThemeProvider';
import WorkspaceSidebar from '../../Components/WorkspaceSidebar';
import WithdrawBalanceCard from '../../Components/WithdrawBalanceCard';
import LightningWithdrawalCard from '../../Components/LightningWithdrawalCard';
import WithdrawalModal from '../../Components/WithdrawalModal';

export default function WithdrawPage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use client-side nav so the session cache survives the route change.
  const handleNewChat = useCallback(() => {
    router.push('/workspace');
  }, [router]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      <WorkspaceSidebar onNewChat={handleNewChat} />

      <main className="lg:pl-72 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className={`text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] mb-3 ${
              isDark ? 'text-white' : 'text-neutral-900'
            }`}>
              Withdraw Your Rewards
            </h1>
            <p className={`text-base sm:text-lg ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Choose your preferred method to receive your sats.
            </p>
          </div>

          {/* Balance Card */}
          <div className="mb-8">
            <WithdrawBalanceCard />
          </div>

          {/* Withdrawal Methods */}
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
              Withdrawal Methods
            </h2>
            <LightningWithdrawalCard onWithdraw={() => setIsModalOpen(true)} />
          </div>
        </div>
      </main>

      <WithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
