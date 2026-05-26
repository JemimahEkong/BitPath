'use client';

import { useState } from 'react';
import { 
  X, 
  Shield, 
  FileText, 
  Lock, 
  Code
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

type ModalType = 'privacy' | 'terms' | 'security' | 'api' | null;

const getModalContent = (isDark: boolean): Record<string, { title: string; icon: React.ElementType; content: React.ReactNode }> => ({
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    content: (
      <div className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-neutral-600'}`}>
        <p><strong className={isDark ? 'text-white' : 'text-neutral-900'}>Effective Date:</strong> January 1, 2026</p>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>1. Information We Collect</h4>
        <p>BitPath is designed with privacy-first principles. We collect minimal data:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Public keys from Nostr/Lightning authentication (self-custodial)</li>
          <li>Learning progress and quiz results</li>
          <li>Anonymous usage analytics</li>
        </ul>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>2. What We Don&apos;t Collect</h4>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Private keys or seed phrases</li>
          <li>Personal identification documents</li>
          <li>Financial account information</li>
        </ul>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>3. Data Security</h4>
        <p>All data is encrypted in transit and at rest. Your identity is controlled by your cryptographic keys - we cannot access your account without your private key.</p>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>4. Your Rights</h4>
        <p>You have the right to export or delete your data at any time. Since authentication is key-based, simply stop using your key to &quot;delete&quot; your identity from our platform.</p>
      </div>
    )
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    content: (
      <div className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-neutral-600'}`}>
        <p><strong className={isDark ? 'text-white' : 'text-neutral-900'}>Last Updated:</strong> January 1, 2026</p>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>1. Acceptance of Terms</h4>
        <p>By accessing BitPath, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>2. Educational Purpose</h4>
        <p>BitPath provides educational content about Bitcoin, Lightning Network, and related technologies. This content is for informational purposes only and does not constitute financial advice.</p>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>3. Rewards Program</h4>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Rewards are earned through completing lessons and quizzes</li>
          <li>Sats are distributed via Lightning Network</li>
          <li>BitPath reserves the right to modify reward amounts</li>
          <li>Abuse of the rewards system will result in account termination</li>
        </ul>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>4. User Responsibilities</h4>
        <p>You are responsible for maintaining the security of your private keys. BitPath cannot recover lost keys or access your account on your behalf.</p>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>5. Limitation of Liability</h4>
        <p>BitPath is provided &quot;as is&quot; without warranties. We are not responsible for any losses resulting from use of the platform or reliance on educational content.</p>
      </div>
    )
  },
  security: {
    title: 'Security',
    icon: Lock,
    content: (
      <div className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-neutral-600'}`}>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Our Security Commitment</h4>
        <p>BitPath employs industry-leading security practices to protect your learning experience and rewards.</p>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>Self-Custodial Authentication</h4>
        <div className={`p-4 ${isDark ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-neutral-100 border-neutral-200'} rounded-lg border`}>
          <p>Your private keys never leave your device. We use Nostr&apos;s NIP-07 protocol and Lightning authentication, meaning you maintain full control of your identity.</p>
        </div>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>Infrastructure Security</h4>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>End-to-end encryption for all data transmission</li>
          <li>Regular security audits by third-party firms</li>
          <li>DDoS protection and rate limiting</li>
          <li>Isolated server infrastructure</li>
        </ul>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>Reporting Vulnerabilities</h4>
        <p>Found a security issue? We run a bug bounty program. Contact security@bitpath.io with details.</p>
        <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)', borderColor: 'rgba(140, 79, 0, 0.3)' }}>
          <p className="text-sm" style={{ color: '#A65D00' }}>
            <strong>Reminder:</strong> Never share your private key with anyone, including BitPath team members. We will never ask for it.
          </p>
        </div>
      </div>
    )
  },
  api: {
    title: 'API Documentation',
    icon: Code,
    content: (
      <div className={`space-y-4 ${isDark ? 'text-gray-300' : 'text-neutral-600'}`}>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>BitPath API v1</h4>
        <p>Build on top of BitPath with our REST API. Perfect for integrating learning progress into other applications.</p>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>Authentication</h4>
        <div className={`p-4 ${isDark ? 'bg-[#0d0d0d]' : 'bg-neutral-100'} rounded-lg font-mono text-sm overflow-x-auto`}>
          <code style={{ color: '#A65D00' }}>
            {`Authorization: Bearer <your-api-key>`}
          </code>
        </div>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>Endpoints</h4>
        <div className="space-y-3">
          <div className={`p-3 ${isDark ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-neutral-100 border-neutral-200'} rounded-lg border`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-bold">GET</span>
              <code className="text-sm">/api/v1/user/progress</code>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>Retrieve user&apos;s learning progress</p>
          </div>
          <div className={`p-3 ${isDark ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-neutral-100 border-neutral-200'} rounded-lg border`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-bold">GET</span>
              <code className="text-sm">/api/v1/courses</code>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>List all available courses</p>
          </div>
          <div className={`p-3 ${isDark ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-neutral-100 border-neutral-200'} rounded-lg border`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded font-bold">POST</span>
              <code className="text-sm">/api/v1/quiz/submit</code>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>Submit quiz answers</p>
          </div>
          <div className={`p-3 ${isDark ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-neutral-100 border-neutral-200'} rounded-lg border`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-bold">GET</span>
              <code className="text-sm">/api/v1/rewards/balance</code>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>Get current sats balance</p>
          </div>
        </div>
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'} mt-6`}>Rate Limits</h4>
        <p>Free tier: 100 requests/hour. Pro tier: 10,000 requests/hour.</p>
      </div>
    )
  }
});

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { isDark } = useTheme();
  const modalContent = getModalContent(isDark);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  const links = [
    { label: 'Privacy Policy', type: 'privacy' as const },
    { label: 'Terms of Service', type: 'terms' as const },
    { label: 'Security', type: 'security' as const },
    { label: 'API Documentation', type: 'api' as const },
  ];

  return (
    <>
      <footer className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${isDark ? 'border-[#1a1a1a]' : 'border-neutral-200'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Brand Lockup */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`font-[family-name:var(--font-space-grotesk)] font-bold text-xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  Bit<span style={{ color: '#8C4F00' }}>Path</span>
                </span>
              </div>
              <span className={isDark ? 'text-gray-600' : 'text-neutral-400'}>|</span>
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>
                © 2026 BitPath. Empowering Hack4Freedom.
              </span>
            </div>

            {/* Right: Interactive Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link) => (
                <button
                  key={link.type}
                  onClick={() => openModal(link.type)}
                  className={`text-sm transition-colors ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}
                  style={{ ['--hover-color' as string]: '#8C4F00' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = isDark ? '#A65D00' : '#703F00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#6b7280' : '#737373'}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className={`mt-8 pt-8 border-t ${isDark ? 'border-[#1a1a1a]' : 'border-neutral-200'} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-neutral-500'}`}>
              Built with Bitcoin, for Bitcoiners. Stack sats while you learn.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/BitPath_"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 ${isDark ? 'bg-[#1a1a1a] hover:bg-[#262626]' : 'bg-neutral-100 hover:bg-neutral-200'} rounded-lg transition-colors group`}
                aria-label="BitPath on X (Twitter)"
                onMouseEnter={(e) => {
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) svg.style.color = '#A65D00';
                }}
                onMouseLeave={(e) => {
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) svg.style.color = isDark ? '#6b7280' : '#737373';
                }}
              >
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-neutral-500'} transition-colors`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://github.com/JemimahEkong/BitPath.git"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 ${isDark ? 'bg-[#1a1a1a] hover:bg-[#262626]' : 'bg-neutral-100 hover:bg-neutral-200'} rounded-lg transition-colors group`}
                aria-label="GitHub"
                onMouseEnter={(e) => {
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) svg.style.color = '#A65D00';
                }}
                onMouseLeave={(e) => {
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) svg.style.color = isDark ? '#6b7280' : '#737373';
                }}
              >
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-neutral-500'} transition-colors`} fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {activeModal && modalContent[activeModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 ${isDark ? 'bg-black/80' : 'bg-black/50'} backdrop-blur-sm`}
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className={`relative ${isDark ? 'bg-[#0d0d0d] border-[#262626]' : 'bg-white border-neutral-200'} border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl`}>
            {/* Header */}
            <div className={`sticky top-0 ${isDark ? 'bg-[#0d0d0d] border-[#262626]' : 'bg-white border-neutral-200'} flex items-center justify-between p-6 border-b`}>
              <div className="flex items-center gap-3">
                {(() => {
                  const IconComponent = modalContent[activeModal].icon;
                  return (
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140, 79, 0, 0.1)' }}>
                      <IconComponent className="w-5 h-5" style={{ color: '#8C4F00' }} />
                    </div>
                  );
                })()}
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {modalContent[activeModal].title}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className={`p-2 ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-neutral-100'} rounded-lg transition-colors`}
              >
                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {modalContent[activeModal].content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
