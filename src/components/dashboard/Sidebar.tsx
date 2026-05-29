'use client';

import React, { useState, useEffect } from 'react';
import type { Conversation, User } from './types';

const styles = {
  sidebar: {
    width: 260,
    minWidth: 260,
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  } as React.CSSProperties,
  sidebarMobile: {
    position: 'fixed' as const,
    left: -260,
    top: 0,
    zIndex: 50,
    transition: 'left 0.3s ease',
    boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
  } as React.CSSProperties,
  sidebarMobileOpen: {
    left: 0,
  } as React.CSSProperties,
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,
  logo: {
    fontFamily: 'var(--font-inter)',
    fontWeight: 700,
    fontSize: 20,
    color: '#8C4F00',
  },
  hamburger: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  } as React.CSSProperties,
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#4A5565',
    borderRadius: 1,
  },
  navSection: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } as React.CSSProperties,
  newChatBtn: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#8C4F00',
    color: '#ffffff',
    border: 'none',
    borderRadius: 10,
    fontFamily: 'var(--font-inter)',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'opacity 0.2s',
  } as React.CSSProperties,
  chatHistoryBtn: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#ffffff',
    color: '#101828',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    fontFamily: 'var(--font-inter)',
    fontWeight: 500,
    fontSize: 15,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'all 0.2s',
  } as React.CSSProperties,
  recentLabel: {
    fontFamily: 'var(--font-inter)',
    fontWeight: 500,
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '4px 0',
  },
  chatItem: {
    width: '100%',
    background: 'none',
    border: 'none',
    borderRadius: 10,
    padding: '12px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  chatItemActive: {
    backgroundColor: '#F3F4F6',
  },
  chatItemTitle: {
    fontFamily: 'var(--font-inter)',
    fontWeight: 500,
    fontSize: 14,
    color: '#0A0A0A',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chatItemDate: {
    fontFamily: 'var(--font-inter)',
    fontWeight: 400,
    fontSize: 12,
    color: '#6B7280',
  },
  bottomSection: {
    marginTop: 'auto',
    padding: '12px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } as React.CSSProperties,
  walletLabel: {
    fontFamily: 'var(--font-inter)',
    fontWeight: 500,
    fontSize: 11,
    color: '#99A1AF',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    padding: '4px 0',
  },
  walletItem: {
    width: '100%',
    background: 'none',
    border: 'none',
    borderRadius: 10,
    padding: '10px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontFamily: 'var(--font-inter)',
    fontWeight: 500,
    fontSize: 14,
    color: '#4A5565',
    textAlign: 'left' as const,
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#8C4F00',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-inter)',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  userName: {
    fontFamily: 'var(--font-inter)',
    fontWeight: 500,
    fontSize: 14,
    color: '#0A0A0A',
    flex: 1,
  },
  upgradeBtn: {
    padding: '6px 12px',
    backgroundColor: '#101828',
    color: '#ffffff',
    border: 'none',
    borderRadius: 9999,
    fontFamily: 'var(--font-inter)',
    fontWeight: 600,
    fontSize: 11,
    cursor: 'pointer',
    flexShrink: 0,
  },
};

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#101828" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ClockIcon({ color = '#6B7280' }: { color?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function RewardsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5565" strokeWidth="1.5">
      <circle cx="12" cy="8" r="7" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  );
}

function TransactionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5565" strokeWidth="1.5">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function WithdrawIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5565" strokeWidth="1.5">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff" stroke="#101828" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function formatChatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

interface SidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  user: User | null;
  unclaimedRewards: any[];
  isClaimingRewards: boolean;
  onSelectConversation: (conv: Conversation) => void;
  onNewChat: () => void;
  onClaimRewards: () => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
}

export default function Sidebar({
  conversations,
  currentConversation,
  user,
  unclaimedRewards,
  isClaimingRewards,
  onSelectConversation,
  onNewChat,
  onClaimRewards,
  isMobileOpen,
  onToggleMobile,
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={onToggleMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}
      <div style={{
        ...styles.sidebar,
        ...(isMobile ? styles.sidebarMobile : {}),
        ...(isMobile && isMobileOpen ? styles.sidebarMobileOpen : {}),
      }}>
        {/* Top Bar - Logo + Menu */}
        <div style={styles.topBar}>
          <span style={styles.logo}>BitPath</span>
          <button style={styles.hamburger} onClick={isMobileOpen ? onToggleMobile : undefined}>
            <div style={styles.hamburgerLine} />
            <div style={styles.hamburgerLine} />
            <div style={styles.hamburgerLine} />
          </button>
        </div>

      {/* Nav Section */}
      <div style={styles.navSection}>
        <button style={styles.newChatBtn} onClick={onNewChat}>
          <ChatIcon />
          New Chat
        </button>
        <button style={styles.chatHistoryBtn}>
          <HistoryIcon />
          Chat History
        </button>

        {/* Recent Chats */}
        <div style={{ marginTop: 8 }}>
          <div style={styles.recentLabel}>Recent Chats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {conversations.slice(0, 10).map((conv) => (
              <button
                key={conv.id}
                style={{
                  ...styles.chatItem,
                  ...(currentConversation?.id === conv.id ? styles.chatItemActive : {}),
                }}
                onClick={() => onSelectConversation(conv)}
                onMouseEnter={(e) => { if (currentConversation?.id !== conv.id) e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = currentConversation?.id === conv.id ? '#F3F4F6' : 'transparent'; }}
              >
                <span style={styles.chatItemTitle}>
                  {conv.title || 'New Chat'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockIcon />
                  <span style={styles.chatItemDate}>{formatChatDate(conv.lastMessageAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        <div style={styles.walletLabel}>Wallet & Rewards</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            style={styles.walletItem}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <RewardsIcon />
            Rewards
          </button>
          <button
            style={styles.walletItem}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <TransactionIcon />
            Transactions
          </button>
          <button
            style={styles.walletItem}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <WithdrawIcon />
            Withdraw BTC
          </button>
        </div>

        {/* User Profile Card */}
        <div
          style={styles.userCard}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8C4F00'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
          <div style={styles.avatar}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span style={styles.userName}>
            {user?.email?.split('@')[0] || 'User'}
          </span>
          <button style={styles.upgradeBtn}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <StarIcon />
              Upgrade
            </div>
          </button>
        </div>

        {/* Claim Rewards Button */}
        {unclaimedRewards.length > 0 && (
          <button
            onClick={onClaimRewards}
            disabled={isClaimingRewards}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isClaimingRewards ? '#9CA3AF' : '#F54900',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              fontFamily: 'var(--font-inter)',
              fontWeight: 700,
              fontSize: 13,
              cursor: isClaimingRewards ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isClaimingRewards
              ? 'Claiming...'
              : `Claim ${unclaimedRewards.length} Reward${unclaimedRewards.length > 1 ? 's' : ''}`
            }
          </button>
        )}
      </div>
    </div>
    <style>{`
      @media (max-width: 768px) {
        .sidebar-mobile { position: fixed !important; left: -260px !important; z-index: 50 !important; transition: left 0.3s ease !important; }
        .sidebar-mobile-open { left: 0 !important; }
      }
    `}</style>
  </>
  );
}
