'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target, BookOpen, Bitcoin, TrendingUp, Check, MessageCircle, HelpCircle, Rocket, Shield, Wallet, Monitor, Clock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const SunIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  const t = {
    bg: isDark ? '#0a0a0b' : '#f8f8fa',
    cardBg: isDark ? 'rgba(22,22,24,0.7)' : 'rgba(255,255,255,0.8)',
    text: isDark ? '#ffffff' : '#1a1a2e',
    textSecondary: isDark ? '#e5e2e3' : '#3a3a4e',
    muted: isDark ? '#a1a1aa' : '#6b7280',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    sectionBg: isDark ? '#1c1b1c' : '#f0f0f2',
    footerBg: isDark ? '#0a0a0b' : '#e8e8ea',
    headerBg: isDark ? 'rgba(22,22,24,0.7)' : 'rgba(248,248,250,0.7)',
    shadow: isDark ? 'inset 0px 1px 1px 0px rgba(255,255,255,0.05)' : 'inset 0px 1px 1px 0px rgba(0,0,0,0.02)',
    accent: '#ffb874',
    accentDark: '#f7931a',
    accentMuted: isDark ? '#8c4f00' : '#d48a2a',
    navActiveBg: isDark ? 'rgba(28,27,28,0.5)' : 'rgba(240,240,242,0.5)',
    chatBg: isDark ? '#201f20' : '#f0f0f2',
    chatBorder: isDark ? '#2a2a2b' : '#e4e4e7',
    aiMessageBg: isDark ? '#2a2a2b' : '#e8e8ea',
    quizOptionBg: isDark ? 'rgba(10,10,11,0.5)' : 'rgba(248,248,250,0.5)',
    bitcoinBg: isDark ? 'rgba(255,184,105,0.2)' : 'rgba(255,184,105,0.15)',
    glowBg: isDark ? 'rgba(255,184,116,0.05)' : 'rgba(255,184,116,0.03)',
    streakBg: isDark ? 'rgba(22,22,24,0.7)' : 'rgba(255,255,255,0.65)',
  };

  const features = [
    {
      icon: Sparkles,
      title: 'Conversational AI Learning',
      description: 'No more boring lectures. Chat with our intelligent AI tutor that breaks down complex financial concepts into simple, human explanations tailored to your pace.',
      accent: '#ffb874',
      colSpan: 'col-span-2',
      graphic: true,
    },
    {
      icon: BookOpen,
      title: 'Gamified XP & Rewards',
      description: 'Earn Sats (fractions of Bitcoin) and XP badges as you level up. Turn your knowledge into tangible digital assets.',
      accent: '#ffb874',
      colSpan: 'col-span-1',
      graphic: false,
    },
    {
      icon: BookOpen,
      title: 'Bite-sized Lessons',
      description: 'Designed for busy lives. Each lesson takes less than 5 minutes. Learn while you commute or during a break.',
      accent: '#ffb874',
      colSpan: 'col-span-1',
      graphic: false,
    },
    {
      icon: Target,
      title: 'Personalized Paths',
      description: "Whether you're a crypto native or a total beginner, we build a roadmap that matches your specific goals.",
      accent: '#ffb874',
      colSpan: 'col-span-1',
      graphic: false,
    },
    {
      icon: Bitcoin,
      title: 'Bitcoin Focused',
      description: 'Master the hardest money ever created. From private keys to the Lightning Network.',
      accent: '#ffb874',
      colSpan: 'col-span-1',
      graphic: false,
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking & Streaks',
      description: "Visualize your growth. See how much you've learned and watch your streak grow as you build a daily learning habit that lasts.",
      accent: '#ffb874',
      colSpan: 'col-span-3',
      graphic: false,
      showStreak: true,
    },
  ];

  const steps = [
    { icon: MessageCircle, title: 'Ask', desc: 'Start a conversation' },
    { icon: BookOpen, title: 'Learn', desc: 'Grasp new concepts' },
    { icon: HelpCircle, title: 'Quiz', desc: 'Test your skill' },
    { icon: Zap, title: 'Earn', desc: 'Get real Bitcoin' },
    { icon: Rocket, title: 'Progress', desc: 'Unlock next level' },
  ];

  const topics = [
    { icon: () => <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 18, color: t.accent }}>B</span>, name: 'Bitcoin Basics' },
    { icon: Shield, name: 'Wallet Safety' },
    { icon: Zap, name: 'Lightning Payments' },
    { icon: Wallet, name: 'Personal Finance' },
    { icon: Monitor, name: 'Digital Skills' },
    { icon: Clock, name: 'Coming Soon', dashed: true },
  ];

  const TopicIconComponent = ({ icon: Icon, dashed }: { icon: any; dashed?: boolean }) => {
    if (typeof Icon === 'function' && Icon.length === 0) return <Icon />;
    return <Icon size={18} color={dashed ? t.muted : t.accent} />;
  };

  return (
    <div style={{ backgroundColor: t.bg, minHeight: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          backgroundColor: t.headerBg,
          borderBottom: `1px solid ${t.border}`,
          boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 24, color: t.accent }}>
                BitPath
              </span>
            </div>

            <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              {['Home', 'How It Works', 'Features'].map((link, i) => (
                <a
                  key={link}
                  href={i === 0 ? '#' : `#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 500,
                    fontSize: 14,
                    letterSpacing: '0.7px',
                    color: i === 0 ? t.accent : t.muted,
                    borderBottom: i === 0 ? `2px solid ${t.accent}` : 'none',
                    paddingBottom: i === 0 ? 6 : 0,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { if (i !== 0) e.currentTarget.style.color = t.textSecondary; }}
                  onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.color = t.muted; }}
                >
                  {link}
                </a>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                display: 'flex',
                gap: 4,
                padding: 5,
                borderRadius: 9999,
                border: `1px solid ${t.border}`,
                backgroundColor: t.navActiveBg,
                backdropFilter: 'blur(6px)',
              }}>
                <div
                  onClick={() => setIsDark(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: !isDark ? t.accent : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: !isDark ? '#2d1600' : t.muted,
                    transition: 'all 0.2s',
                  }}
                >
                  <SunIcon size={16} />
                </div>
                <div
                  onClick={() => setIsDark(true)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: isDark ? t.accent : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isDark ? '#2d1600' : t.muted,
                    transition: 'all 0.2s',
                  }}
                >
                  <MoonIcon size={14} />
                </div>
              </div>

              <motion.button
                onClick={() => router.push('/signup')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: t.accentMuted,
                  color: 'white',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '10px 24px',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.7px',
                  cursor: 'pointer',
                  boxShadow: '0px 0px 7.5px rgba(247,147,26,0.3)',
                }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ paddingTop: 80 }}
      >
        {/* Hero Section */}
        <section style={{
          position: 'relative',
          padding: '160px 48px 96px',
          overflow: 'hidden',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1280 1291' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(90.899 0 0 90.899 640 645.5)'%3E%3Cstop stop-color='rgba(247,147,26,0.08)' offset='0'/%3E%3Cstop stop-color='rgba(247,147,26,0)' offset='0.7'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")`,
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div variants={fadeIn}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 17px',
                borderRadius: 9999,
                border: `1px solid ${t.border}`,
                backgroundColor: t.cardBg,
                backdropFilter: 'blur(10px)',
                boxShadow: t.shadow,
                marginBottom: 32,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: t.accent }} />
                <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: 12, letterSpacing: '1.2px', textTransform: 'uppercase', color: t.accent }}>
                  Powered by Nostr & Lightning
                </span>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} style={{ maxWidth: 896, paddingBottom: 24 }}>
              <h1 style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 700,
                fontSize: 64,
                lineHeight: '72px',
                letterSpacing: '-1.28px',
                color: t.text,
                textAlign: 'center',
                margin: 0,
              }}>
                Learn digital skills.<br />Earn real rewards.
              </h1>
            </motion.div>

            <motion.div variants={fadeIn} style={{ maxWidth: 672, paddingBottom: 48 }}>
              <p style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 400,
                fontSize: 18,
                lineHeight: '28px',
                color: t.muted,
                textAlign: 'center',
                margin: 0,
              }}>
                BitPath uses conversational AI and gamified rewards to make Bitcoin and
                financial education simple, engaging, and accessible.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} style={{ paddingBottom: 80 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <motion.button
                  onClick={() => router.push('/signup')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: t.accentDark,
                    color: '#2d1600',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '16px 40px',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: '0.7px',
                    cursor: 'pointer',
                  }}
                >
                  Start Learning
                </motion.button>

                <motion.button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: t.cardBg,
                    color: t.text,
                    border: `1px solid ${t.border}`,
                    borderRadius: 9999,
                    padding: '18px 41px',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: '0.7px',
                    cursor: 'pointer',
                  }}
                >
                  Explore How It Works
                </motion.button>
              </div>
            </motion.div>

            {/* AI Chat Preview Card */}
            <motion.div
              variants={fadeIn}
              style={{
                position: 'relative',
                width: 900,
                maxWidth: 900,
                borderRadius: 32,
                border: `1px solid ${t.border}`,
                backgroundColor: t.cardBg,
                backdropFilter: 'blur(10px)',
                padding: 9,
                boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ backgroundColor: t.chatBg, borderRadius: 28, overflow: 'hidden' }}>
                <div style={{
                  backgroundColor: t.chatBorder,
                  borderBottom: `1px solid ${t.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px 17px',
                }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffb4ab', opacity: 0.4 }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: t.accent, opacity: 0.4 }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffb869', opacity: 0.4 }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: 14, letterSpacing: '0.7px', color: t.muted }}>
                    AI Tutor: Bitcoin 101
                  </span>
                  <div />
                </div>

                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* AI Message */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: t.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2d1600" strokeWidth="2">
                        <path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 4s-4-2-4-4 2-4 4-4z"/>
                        <path d="M12 14c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/>
                      </svg>
                    </div>
                    <div style={{
                      backgroundColor: t.aiMessageBg,
                      padding: 16,
                      borderRadius: '0 48px 48px 48px',
                      maxWidth: 512,
                    }}>
                      <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 16, lineHeight: '24px', color: t.textSecondary, margin: 0 }}>
                        What is the Lightning Network? Think of it as a second layer on top of Bitcoin that makes payments instant and cheap!
                      </p>
                    </div>
                  </div>

                  {/* User Message */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingLeft: 250 }}>
                    <div style={{
                      border: `1px solid ${t.border}`,
                      padding: 17,
                      borderRadius: '48px 48px 0 48px',
                      maxWidth: 512,
                    }}>
                      <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 16, lineHeight: '24px', color: t.textSecondary, margin: 0 }}>
                        Wait, so it&apos;s not on the main blockchain for every coffee purchase?
                      </p>
                    </div>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: `1px solid ${t.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  </div>

                  {/* AI Quiz Message */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: t.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="19" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d1600" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </div>
                    <div style={{
                      backgroundColor: t.aiMessageBg,
                      padding: 16,
                      borderRadius: '0 48px 48px 48px',
                      maxWidth: 512,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 16, lineHeight: '24px', color: t.accent, margin: 0 }}>
                        Pop Quiz!
                      </p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 16, lineHeight: '24px', color: t.textSecondary, margin: 0 }}>
                        Does the Lightning Network settle every transaction immediately on the Bitcoin mainnet?
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                        <div style={{
                          backgroundColor: t.quizOptionBg,
                          border: `1px solid ${t.border}`,
                          borderRadius: 32,
                          padding: '9px 17px',
                          color: t.textSecondary,
                          fontFamily: 'var(--font-inter)',
                          fontSize: 16,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.backgroundColor = 'rgba(255,184,116,0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.backgroundColor = t.quizOptionBg; }}
                        >
                          A) Yes, every single one.
                        </div>
                        <div style={{
                          backgroundColor: 'rgba(255,184,116,0.1)',
                          border: `1px solid ${t.accent}`,
                          borderRadius: 32,
                          padding: '9px 17px',
                          color: t.textSecondary,
                          fontFamily: 'var(--font-inter)',
                          fontSize: 16,
                        }}>
                          B) No, it batches them for settlement.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Reward Card */}
              <div style={{
                position: 'absolute',
                top: -40,
                right: -40,
                borderRadius: 32,
                border: `1px solid ${t.border}`,
                backgroundColor: t.streakBg,
                backdropFilter: 'blur(10px)',
                padding: 25,
                boxShadow: t.shadow,
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: t.bitcoinBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={t.accent}><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4" stroke="#2d1600" strokeWidth="2" fill="none"/></svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', color: t.muted, margin: 0, letterSpacing: '0.5px' }}>
                      REWARD EARNED
                    </p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 24, color: t.accent, margin: 0 }}>
                      +50 Sats
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Streak Card */}
              <div style={{
                position: 'absolute',
                bottom: -24,
                left: -40,
                borderRadius: 32,
                border: `1px solid ${t.border}`,
                backgroundColor: t.streakBg,
                backdropFilter: 'blur(10px)',
                padding: 21,
                boxShadow: t.shadow,
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <svg width="24" height="32" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2">
                    <polygon points="13 2 15 9 22 9 16 14 18 21 12 17 6 21 8 14 2 9 9 9 11 2"/>
                  </svg>
                  <div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 16, color: t.text, margin: 0 }}>
                      7-Day Streak!
                    </p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: 12, color: t.muted, margin: 0 }}>
                      Multiplier Active 1.2x
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" style={{ padding: '120px 48px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center' }}
            >
              <h2 style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
                fontSize: 40,
                lineHeight: '48px',
                letterSpacing: '-0.4px',
                color: t.text,
                margin: '0 0 16px',
              }}>
                Redefining Education for the Digital Age
              </h2>
              <p style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 400,
                fontSize: 18,
                lineHeight: '28px',
                color: t.muted,
                margin: 0,
                maxWidth: 672,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Master the future of money through an experience designed for clarity, speed, and fun.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
                gridAutoRows: 'auto',
              }}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  style={{
                    gridColumn: feature.colSpan,
                    position: 'relative',
                    borderRadius: 32,
                    border: `1px solid ${t.border}`,
                    backgroundColor: t.cardBg,
                    backdropFilter: 'blur(10px)',
                    padding: 41,
                    overflow: feature.graphic ? 'hidden' : 'visible',
                    boxShadow: t.shadow,
                    ...(feature.title === 'Conversational AI Learning' ? { gridRow: 'span 1' } : {}),
                  }}
                >
                  {feature.title === 'Conversational AI Learning' && (
                    <div style={{
                      position: 'absolute',
                      bottom: -80,
                      right: -80,
                      width: 256,
                      height: 256,
                      borderRadius: '50%',
                      backgroundColor: t.glowBg,
                      filter: 'blur(32px)',
                      pointerEvents: 'none',
                    }} />
                  )}

                  <div style={{ width: 40, height: 40, marginBottom: 16 }}>
                    <feature.icon size={40} color={feature.accent} />
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 600,
                    fontSize: 24,
                    lineHeight: '32px',
                    color: t.textSecondary,
                    margin: '0 0 8px',
                  }}>
                    {feature.title}
                  </h3>

                  <p style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: '24px',
                    color: t.muted,
                    margin: 0,
                  }}>
                    {feature.description}
                  </p>

                  {feature.graphic && (
                    <div style={{
                      marginTop: 16,
                      backgroundColor: t.chatBorder,
                      borderRadius: 48,
                      padding: '24px 16px 16px',
                      height: 136,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      <div style={{ height: 16, width: '80%', borderRadius: 9999, backgroundColor: 'rgba(255,184,116,0.2)' }} />
                      <div style={{ height: 16, width: '60%', borderRadius: 9999, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }} />
                      <div style={{ height: 16, width: '90%', borderRadius: 9999, backgroundColor: 'rgba(255,184,116,0.2)' }} />
                    </div>
                  )}

                  {feature.showStreak && (
                    <div style={{
                      marginTop: 16,
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center',
                    }}>
                      {['S', 'M', 'T', 'W'].map((letter, i) => (
                        <div key={i} style={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          border: `2px solid ${i < 3 ? t.accent : t.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-inter)',
                          fontWeight: 700,
                          fontSize: 16,
                          color: i < 3 ? t.accent : t.muted,
                        }}>
                          {letter}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" style={{
          backgroundColor: t.sectionBg,
          padding: '128px 48px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 96 }}
          >
            <motion.div variants={fadeIn} style={{ textAlign: 'center' }}>
              <motion.h2 variants={fadeIn} style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
                fontSize: 40,
                lineHeight: '48px',
                letterSpacing: '-0.4px',
                color: t.text,
                margin: '0 0 16px',
              }}>
                The BitPath Journey
              </motion.h2>
              <motion.p variants={fadeIn} style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 400,
                fontSize: 18,
                lineHeight: '28px',
                color: t.muted,
                margin: 0,
              }}>
                Five simple steps to mastery.
              </motion.p>
            </motion.div>

            <motion.div variants={fadeIn} style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
            }}>
              {/* Connector line */}
              <div style={{
                position: 'absolute',
                top: 'calc(50% + 1px)',
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(to right, transparent, ${t.accent}44, transparent)`,
                transform: 'translateY(-50%)',
              }} />

              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: `1px solid ${t.border}`,
                    backgroundColor: t.cardBg,
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 32,
                    boxShadow: t.shadow,
                  }}>
                    <step.icon size={28} color={t.accent} />
                  </div>
                  <h4 style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 600,
                    fontSize: 24,
                    color: t.textSecondary,
                    margin: '0 0 8px',
                  }}>
                    {step.title}
                  </h4>
                  <p style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 500,
                    fontSize: 12,
                    color: t.muted,
                    margin: 0,
                    textAlign: 'center',
                  }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Categories & Rewards */}
        <section style={{ padding: '120px 48px', maxWidth: 1280, margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 96,
              alignItems: 'center',
            }}
          >
            {/* Left: Topics */}
            <motion.div variants={fadeIn}>
              <h2 style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
                fontSize: 40,
                lineHeight: '48px',
                letterSpacing: '-0.4px',
                color: t.text,
                margin: '0 0 32px',
              }}>
                What do you want to master<br />first?
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}>
                {topics.map((topic, i) => (
                  <div key={i} style={{
                    borderRadius: 32,
                    borderWidth: 1,
                    borderStyle: topic.dashed ? 'dashed' : 'solid',
                    borderColor: t.border,
                    backgroundColor: t.cardBg,
                    backdropFilter: 'blur(10px)',
                    padding: 25,
                    boxShadow: t.shadow,
                    cursor: topic.dashed ? 'default' : 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={(e) => { if (!topic.dashed) e.currentTarget.style.borderColor = t.accent; }}
                    onMouseLeave={(e) => { if (!topic.dashed) e.currentTarget.style.borderColor = t.border; }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <TopicIconComponent icon={topic.icon} dashed={topic.dashed} />
                      <span style={{
                        fontFamily: 'var(--font-inter)',
                        fontWeight: 700,
                        fontSize: 16,
                        color: topic.dashed ? t.muted : t.textSecondary,
                      }}>
                        {topic.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Stats Card */}
            <motion.div
              variants={fadeIn}
              style={{
                borderRadius: 32,
                border: `1px solid ${t.border}`,
                backgroundColor: t.cardBg,
                backdropFilter: 'blur(10px)',
                padding: 41,
                overflow: 'hidden',
                boxShadow: t.shadow,
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
                fontSize: 24,
                lineHeight: '32px',
                color: t.textSecondary,
                margin: '0 0 32px',
              }}>
                Your Stats
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {/* Current Course */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      border: `1px solid ${isDark ? 'rgba(255,184,116,0.3)' : 'rgba(255,184,116,0.5)'}`,
                      backgroundColor: t.cardBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 12, color: t.textSecondary }}>75%</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 16, color: t.textSecondary, margin: 0 }}>Current Course</p>
                      <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: 12, color: t.muted, margin: 0 }}>Lightning Level 4</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 24, color: t.accent, margin: 0 }}>12,450</p>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: 12, color: t.muted, margin: 0 }}>Total XP</p>
                  </div>
                </div>

                <div style={{ height: 1, backgroundColor: t.border }} />

                {/* Total Earned */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', color: t.muted, margin: '0 0 4px', letterSpacing: '0.5px' }}>
                      TOTAL EARNED
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 40, lineHeight: '48px', letterSpacing: '-0.4px', color: t.text }}>
                        840,200
                      </span>
                      <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 24, lineHeight: '32px', color: t.accent }}>
                        Sats
                      </span>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(255,184,116,0.1)',
                    border: '1px solid rgba(255,184,116,0.2)',
                    borderRadius: 32,
                    padding: '9px 17px',
                  }}>
                    <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 16, color: t.accent }}>
                      ~ $542.12
                    </span>
                  </div>
                </div>

                {/* Progress bars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[20, 40, 70, 100].map((opacity, i) => (
                    <div key={i} style={{
                      height: 40,
                      borderRadius: 6,
                      backgroundColor: t.accent,
                      opacity: opacity / 100,
                    }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section style={{
          padding: '128px 48px',
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(to bottom, rgba(255,184,116,0), rgba(255,184,116,0.05), rgba(255,184,116,0))'
            : 'linear-gradient(to bottom, rgba(255,184,116,0), rgba(255,184,116,0.03), rgba(255,184,116,0))',
        }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              borderRadius: 32,
              backgroundColor: t.cardBg,
              backdropFilter: 'blur(10px)',
              padding: 64,
              textAlign: 'center',
              boxShadow: isDark ? '0px 0px 100px 0px rgba(247,147,26,0.05)' : '0px 0px 60px 0px rgba(247,147,26,0.05)',
            }}
          >
            <motion.h2 variants={fadeIn} style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 700,
              fontSize: 64,
              lineHeight: '72px',
              letterSpacing: '-1.28px',
              color: t.text,
              margin: '0 0 24px',
            }}>
              Start your financial learning<br />journey today.
            </motion.h2>

            <motion.p variants={fadeIn} style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 400,
              fontSize: 18,
              lineHeight: '28px',
              color: t.muted,
              margin: '0 auto 24px',
              maxWidth: 672,
            }}>
              Join thousands of learners earning Bitcoin while they master the digital economy.
            </motion.p>

            <motion.div variants={fadeIn} style={{ paddingTop: 24 }}>
              <motion.button
                onClick={() => router.push('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: t.accentDark,
                  color: '#2d1600',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '20px 48px',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.7px',
                  cursor: 'pointer',
                }}
              >
                Sign In to Start Learning
              </motion.button>
            </motion.div>

            <motion.div variants={fadeIn} style={{
              display: 'flex',
              gap: 32,
              justifyContent: 'center',
              paddingTop: 24,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Check size={12} color={t.muted} />
                <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 16, color: t.muted }}>
                  No credit card required
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Check size={12} color={t.muted} />
                <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 16, color: t.muted }}>
                  Instant rewards
                </span>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </motion.div>

      {/* Footer */}
      <footer style={{
        backgroundColor: t.footerBg,
        borderTop: `1px solid ${t.border}`,
        padding: '49px 48px 48px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: 24, color: t.accent }}>
                BitPath
              </span>
              <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 400, fontSize: 16, color: t.muted, margin: 0 }}>
                &copy; 2026 BitPath. Empowering Hack4Freedom.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              {['Privacy Policy', 'Terms of Service', 'Security', 'API Documentation'].map((link) => (
                <a
                  key={link}
                  href="#"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 400,
                    fontSize: 16,
                    color: t.muted,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = t.textSecondary}
                  onMouseLeave={(e) => e.currentTarget.style.color = t.muted}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
