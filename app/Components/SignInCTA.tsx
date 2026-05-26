'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { 
  X, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle,
  Shield,
  Zap,
  Key,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface SignInCTAProps {
  isModalOpen: boolean;
  isAuthenticated: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

export default function SignInCTA({ isModalOpen, isAuthenticated, onOpenModal, onCloseModal }: SignInCTAProps) {
  const { isDark } = useTheme();
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | null>(null);
  const [step, setStep] = useState<'choose' | 'email-form' | 'loading' | 'success'>('choose');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [successUser, setSuccessUser] = useState<{ name: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthMethod('google');
    setStep('loading');
    await signIn('google', { 
      callbackUrl: '/workspace'
    });
  };

  const handleEmailMethodSelect = () => {
    setAuthMethod('email');
    setStep('email-form');
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !name.trim()) return;
    
    setStep('loading');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email,
        name: name,
        callbackUrl: '/workspace'
      });

      if (result?.ok) {
        setSuccessUser({ name, email });
        setStep('success');
      } else {
        setStep('email-form');
      }
    } catch (error) {
      console.error('Email sign-in error:', error);
      setStep('email-form');
    }
  };

  const resetModal = () => {
    setAuthMethod(null);
    setStep('choose');
    setEmail('');
    setName('');
    setSuccessUser(null);
    onCloseModal();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email.trim() && name.trim()) {
      handleEmailSubmit();
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* CTA Section */}
      <section className={`py-24 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-neutral-950' : 'bg-neutral-100'}`}>
        <div className="max-w-4xl mx-auto">
          <div 
            className={`rounded-3xl p-8 md:p-12 text-center relative overflow-hidden border ${
              isDark 
                ? 'bg-gradient-to-br from-[#8C4F00]/10 via-neutral-900 to-neutral-950 border-[#8C4F00]/20' 
                : 'bg-gradient-to-br from-[#8C4F00]/5 via-white to-neutral-50 border-[#8C4F00]/20'
            }`}
          >
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(140, 79, 0, 0.05)' }} />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(140, 79, 0, 0.05)' }} />
            
            <div className="relative z-10">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className={isDark ? 'text-white' : 'text-neutral-900'}>Start your </span>
                <span style={{ color: '#8C4F00' }}>financial learning</span>
                <br />
                <span className={isDark ? 'text-white' : 'text-neutral-900'}>journey today.</span>
              </h2>
              
              <p className={`text-lg max-w-xl mx-auto mb-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Join thousands of learners mastering Bitcoin and earning real rewards. Your keys, your knowledge, your future.
              </p>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/workspace');
                  } else {
                    onOpenModal();
                  }
                }}
                className="group inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.97]"
                style={{ backgroundColor: '#8C4F00' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A65D00')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8C4F00')}
              >
                {isAuthenticated ? 'Go to Workspace' : 'Sign In to Start Learning'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className={`mt-8 flex items-center justify-center gap-6 text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: '#8C4F00', opacity: 0.7 }} />
                  <span>Secure login</span>
                </div>
                <div className={`w-px h-4 ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} />
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" style={{ color: '#8C4F00', opacity: 0.7 }} />
                  <span>Free account</span>
                </div>
                <div className={`w-px h-4 ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} />
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: '#8C4F00', opacity: 0.7 }} />
                  <span>Instant rewards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className={`absolute inset-0 backdrop-blur-md transition-opacity duration-300 ${
              isDark ? 'bg-black/70' : 'bg-black/40'
            }`}
            onClick={resetModal}
          />
          
          <div
            className={`relative w-full max-w-md overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${
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
            {/* Close button */}
            <button
              onClick={resetModal}
              className={`absolute top-5 right-5 z-10 p-2 rounded-xl transition-all duration-200 ${
                isDark
                  ? 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                  : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
              }`}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content with step transitions */}
            <div className="relative">
              {/* Step: Choose Method */}
              {step === 'choose' && (
                <div className="p-8 sm:p-10">
                  {/* Logo / Brand */}
                  <div className="flex justify-center mb-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(140, 79, 0, 0.12)' }}
                    >
                      <Sparkles className="w-6 h-6" style={{ color: '#8C4F00' }} />
                    </div>
                  </div>

                  {/* Heading */}
                  <div className="text-center mb-8">
                    <h2 className={`text-2xl font-bold font-[family-name:var(--font-space-grotesk)] mb-2 ${
                      isDark ? 'text-white' : 'text-neutral-900'
                    }`}>
                      Sign in to BitPath
                    </h2>
                    <p className={`text-sm leading-relaxed ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>
                      Start your journey to learn Bitcoin and earn real rewards
                    </p>
                  </div>

                  {/* Google Sign In Button — Premium */}
                  <button
                    onClick={handleGoogleSignIn}
                    className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-medium transition-all duration-200 active:scale-[0.98] ${
                      isDark
                        ? 'bg-white hover:bg-neutral-100 text-neutral-900 shadow-lg shadow-black/20'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg shadow-neutral-900/20'
                    }`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill={isDark ? '#000' : '#fff'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill={isDark ? '#000' : '#fff'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill={isDark ? '#000' : '#fff'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill={isDark ? '#000' : '#fff'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className={`flex-1 h-px ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                    <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      or
                    </span>
                    <div className={`flex-1 h-px ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                  </div>

                  {/* Email Sign In — Secondary */}
                  <button
                    onClick={handleEmailMethodSelect}
                    className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-medium transition-all duration-200 active:scale-[0.98] border ${
                      isDark
                        ? 'bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800 text-neutral-200'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                    }`}
                    style={{ ['--hover-border' as string]: '#8C4F00' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8C4F00'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#404040' : '#e5e5e5'}
                  >
                    <Mail className="w-5 h-5" style={{ color: '#8C4F00' }} />
                    <span>Continue with Email</span>
                  </button>

                  {/* Terms */}
                  <p className={`text-xs text-center mt-8 leading-relaxed ${
                    isDark ? 'text-neutral-600' : 'text-neutral-400'
                  }`}>
                    By signing in, you agree to our{' '}
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                      style={{ color: '#8C4F00' }}
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                      style={{ color: '#8C4F00' }}
                    >
                      Privacy Policy
                    </button>
                  </p>
                </div>
              )}

              {/* Step: Email Form */}
              {step === 'email-form' && (
                <div className="p-8 sm:p-10">
                  {/* Back + Heading */}
                  <div className="mb-6">
                    <button
                      onClick={() => { setStep('choose'); setAuthMethod(null); }}
                      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                        isDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  </div>

                  <div className="text-center mb-7">
                    <h2 className={`text-2xl font-bold font-[family-name:var(--font-space-grotesk)] mb-2 ${
                      isDark ? 'text-white' : 'text-neutral-900'
                    }`}>
                      Sign in with Email
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Enter your details to get started
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Your Name
                      </label>
                      <div
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                          isDark
                            ? 'bg-neutral-800/50 border-neutral-700 focus-within:border-[#8C4F00] focus-within:ring-1 focus-within:ring-[#8C4F00]/30'
                            : 'bg-neutral-50 border-neutral-200 focus-within:border-[#8C4F00] focus-within:ring-1 focus-within:ring-[#8C4F00]/20'
                        }`}
                      >
                        <User className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter your name"
                          className={`flex-1 bg-transparent outline-none text-sm ${
                            isDark ? 'text-white placeholder-neutral-600' : 'text-neutral-900 placeholder-neutral-400'
                          }`}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Email Address
                      </label>
                      <div
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                          isDark
                            ? 'bg-neutral-800/50 border-neutral-700 focus-within:border-[#8C4F00] focus-within:ring-1 focus-within:ring-[#8C4F00]/30'
                            : 'bg-neutral-50 border-neutral-200 focus-within:border-[#8C4F00] focus-within:ring-1 focus-within:ring-[#8C4F00]/20'
                        }`}
                      >
                        <Mail className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="your@email.com"
                          className={`flex-1 bg-transparent outline-none text-sm ${
                            isDark ? 'text-white placeholder-neutral-600' : 'text-neutral-900 placeholder-neutral-400'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleEmailSubmit}
                      disabled={!name.trim() || !email.trim()}
                      className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${
                        name.trim() && email.trim()
                          ? 'text-white shadow-lg hover:shadow-xl'
                          : isDark
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      }`}
                      style={name.trim() && email.trim() ? { backgroundColor: '#8C4F00', boxShadow: '0 8px 25px rgba(140, 79, 0, 0.3)' } : {}}
                      onMouseEnter={(e) => { if (name.trim() && email.trim()) e.currentTarget.style.backgroundColor = '#A65D00'; }}
                      onMouseLeave={(e) => { if (name.trim() && email.trim()) e.currentTarget.style.backgroundColor = '#8C4F00'; }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Loading */}
              {step === 'loading' && (
                <div className="p-8 sm:p-10">
                  <div className="py-12 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-8">
                      <div className={`absolute inset-0 rounded-full ${
                        isDark ? 'bg-neutral-800' : 'bg-neutral-100'
                      }`} />
                      <div
                        className="absolute inset-0 rounded-full animate-spin"
                        style={{
                          background: `conic-gradient(from 0deg, transparent 60%, #8C4F00)`,
                          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
                          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))',
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#8C4F00' }} />
                      </div>
                    </div>
                    <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      {authMethod === 'google' ? 'Connecting to Google...' : 'Signing you in...'}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                      Please wait while we set up your account
                    </p>
                  </div>
                </div>
              )}

              {/* Step: Success */}
              {step === 'success' && (
                <div className="p-8 sm:p-10">
                  <div className="py-10 text-center">
                    <div
                      className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center animate-in zoom-in duration-300"
                      style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>

                    <h2 className={`text-2xl font-bold font-[family-name:var(--font-space-grotesk)] mb-3 ${
                      isDark ? 'text-white' : 'text-neutral-900'
                    }`}>
                      Welcome{successUser?.name ? `, ${successUser.name.split(' ')[0]}` : ''}!
                    </h2>

                    <p className={`text-sm mb-10 leading-relaxed max-w-xs mx-auto ${
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>
                      You&apos;re now signed in and ready to start learning.
                    </p>

                    <button
                      onClick={() => {
                        resetModal();
                        router.push('/workspace');
                      }}
                      className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl"
                      style={{ backgroundColor: '#8C4F00', boxShadow: '0 8px 25px rgba(140, 79, 0, 0.3)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A65D00'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8C4F00'}
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
