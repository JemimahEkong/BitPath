'use client';

import { useState } from 'react';
import { X, Zap, Info } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const { isDark } = useTheme();
  const [lightningAddress, setLightningAddress] = useState('');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 backdrop-blur-md transition-opacity duration-300 ${
          isDark ? 'bg-black/70' : 'bg-black/40'
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-neutral-900 border border-neutral-800'
            : 'bg-white border border-neutral-200'
        }`}
        style={{
          borderRadius: '20px',
          boxShadow: isDark
            ? '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)'
            : '0 25px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)'
        }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: isDark ? '#262626' : '#e5e5e5' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
              <Zap className="w-5 h-5" style={{ color: '#8C4F00' }} />
            </div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Withdraw via Lightning
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Lightning Address */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Lightning Address
            </label>
            <div
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                isDark
                  ? 'bg-neutral-800/50 border-neutral-700 focus-within:border-[#8C4F00] focus-within:ring-1 focus-within:ring-[#8C4F00]/30'
                  : 'bg-neutral-50 border-neutral-200 focus-within:border-[#8C4F00] focus-within:ring-1 focus-within:ring-[#8C4F00]/20'
              }`}
            >
              <Zap className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} />
              <input
                type="text"
                value={lightningAddress}
                onChange={(e) => setLightningAddress(e.target.value)}
                placeholder="you@getalby.com"
                className={`flex-1 bg-transparent outline-none text-sm ${
                  isDark ? 'text-white placeholder-neutral-600' : 'text-neutral-900 placeholder-neutral-400'
                }`}
                autoFocus
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Amount (sats)
            </label>
            <div
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                isDark
                  ? 'bg-neutral-800/50 border-neutral-700 focus-within:border-[#8C4F00] focus-within:ring-1 focus-within:ring-[#8C4F00]/30'
                  : 'bg-neutral-50 border-neutral-200 focus-within:border-[#8C4F00] focus-within:ring-1 focus-within:ring-[#8C4F00]/20'
              }`}
            >
              <span className={`text-sm font-medium flex-shrink-0 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>₿</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                className={`flex-1 bg-transparent outline-none text-sm ${
                  isDark ? 'text-white placeholder-neutral-600' : 'text-neutral-900 placeholder-neutral-400'
                }`}
              />
              <span className={`text-sm flex-shrink-0 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>sats</span>
            </div>
            <p className={`text-xs mt-1.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Max: 54,212 sats
            </p>
          </div>

          {/* Placeholder info banner */}
          <div
            className="flex items-start gap-3 p-4 rounded-2xl border"
            style={{
              backgroundColor: isDark ? 'rgba(140, 79, 0, 0.08)' : 'rgba(140, 79, 0, 0.05)',
              borderColor: isDark ? 'rgba(140, 79, 0, 0.2)' : 'rgba(140, 79, 0, 0.15)',
            }}
          >
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#8C4F00' }} />
            <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Lightning withdrawals will be connected to the backend soon.
            </p>
          </div>

          {/* Continue Button */}
          <button
            disabled
            className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-not-allowed"
            style={{
              backgroundColor: isDark ? '#262626' : '#e5e5e5',
              color: isDark ? '#525252' : '#a3a3a3',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
