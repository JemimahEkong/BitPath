'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from './types';

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#ffffff',
    fontFamily: 'var(--font-inter)',
    overflow: 'hidden',
  } as React.CSSProperties,
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
  navSection: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } as React.CSSProperties,
  navBtn: {
    width: '100%',
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    borderRadius: 10,
    fontFamily: 'var(--font-inter)',
    fontWeight: 500,
    fontSize: 15,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'all 0.2s',
    textAlign: 'left' as const,
  } as React.CSSProperties,
  navBtnActive: {
    backgroundColor: '#8C4F00',
    color: '#ffffff',
  },
  navBtnInactive: {
    backgroundColor: '#ffffff',
    color: '#101828',
    border: '1px solid #e5e7eb',
  },
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
  walletItemActive: {
    color: '#8C4F00',
  },
  bottomSection: {
    marginTop: 'auto',
    padding: '12px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
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
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  } as React.CSSProperties,
};

function RewardsIcon({ active }: { active?: boolean }) {
  const color = active ? '#8C4F00' : '#4A5565';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="8" r="7" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  );
}

function TransactionIcon({ active }: { active?: boolean }) {
  const color = active ? '#8C4F00' : '#4A5565';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function WithdrawIcon({ active }: { active?: boolean }) {
  const color = active ? '#8C4F00' : '#4A5565';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
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

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function NewChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage: 'withdraw' | 'rewards' | 'transactions' | 'upgrade' | 'chat';
}

export default function DashboardLayout({ children, activePage }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logOut', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    } catch {
      // proceed even if logout fails
    }
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
        }
      } catch {
        console.error('Error loading user profile');
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/check');
        if (res.status === 401) {
          window.location.href = '/login';
        }
      } catch {
        console.error('Session check failed');
      }
    };
    const intervalId = setInterval(checkSession, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const sidebar = (
    <div style={{
      ...styles.sidebar,
      ...(isMobile ? styles.sidebarMobile : {}),
      ...(isMobile && sidebarOpen ? styles.sidebarMobileOpen : {}),
    }}>
      <div style={styles.topBar}>
        <span style={styles.logo}>BitPath</span>
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            opacity: isMobile ? 1 : 0,
            pointerEvents: isMobile ? 'auto' : 'none',
          } as React.CSSProperties}
        >
          <div style={{ width: 20, height: 2, backgroundColor: '#4A5565', borderRadius: 1 }} />
          <div style={{ width: 20, height: 2, backgroundColor: '#4A5565', borderRadius: 1 }} />
          <div style={{ width: 20, height: 2, backgroundColor: '#4A5565', borderRadius: 1 }} />
        </button>
      </div>

      <div style={styles.navSection}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            ...styles.navBtn,
            ...(activePage === 'chat' ? styles.navBtnActive : styles.navBtnInactive),
          }}
          onMouseEnter={(e) => { if (activePage !== 'chat') e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = activePage === 'chat' ? '#8C4F00' : '#ffffff'; }}
        >
          <NewChatIcon />
          New Chat
        </button>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={styles.walletLabel}>Wallet & Rewards</div>
        <button
          onClick={() => router.push('/dashboard/rewards')}
          onMouseEnter={(e) => { if (activePage !== 'rewards') e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          style={{
            ...styles.walletItem,
            ...(activePage === 'rewards' ? styles.walletItemActive : {}),
          }}
        >
          <RewardsIcon active={activePage === 'rewards'} />
          Rewards
        </button>
        <button
          onClick={() => router.push('/dashboard/transactions')}
          onMouseEnter={(e) => { if (activePage !== 'transactions') e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          style={{
            ...styles.walletItem,
            ...(activePage === 'transactions' ? styles.walletItemActive : {}),
          }}
        >
          <TransactionIcon active={activePage === 'transactions'} />
          Transactions
        </button>
        <button
          onClick={() => router.push('/dashboard/withdraw')}
          onMouseEnter={(e) => { if (activePage !== 'withdraw') e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          style={{
            ...styles.walletItem,
            ...(activePage === 'withdraw' ? styles.walletItemActive : {}),
          }}
        >
          <WithdrawIcon active={activePage === 'withdraw'} />
          Withdraw BTC
        </button>
      </div>

      <div style={styles.bottomSection}>
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
          <button
            style={styles.upgradeBtn}
            onClick={() => router.push('/dashboard/upgrade')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <StarIcon />
              Upgrade
            </div>
          </button>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'none',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'var(--font-inter)',
            fontWeight: 500,
            fontSize: 14,
            color: '#ef4444',
            textAlign: 'left' as const,
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @media (max-width: 768px) {
          .mobile-hamburger { display: flex !important; }
          .dash-content-pad { padding: 16px !important; }
          .dash-page-maxw { max-width: 100% !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          display: 'none',
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 30,
          width: 40,
          height: 40,
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        className="mobile-hamburger"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#101828" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {sidebar}
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
}
