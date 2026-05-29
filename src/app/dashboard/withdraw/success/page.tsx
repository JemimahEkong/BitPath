'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const colors = {
  amber: '#8C4F00',
  text: '#191c1d',
  textMuted: '#575e70',
  border: '#dbc2ae',
  warning: '#554335',
  green: '#00c950',
  darkMuted: '#a1a1aa',
};

export default function WithdrawSuccessPage() {
  const router = useRouter();

  return (
    <DashboardLayout activePage="withdraw">
      <div style={{
        flex: 1,
        padding: '40px 72px',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }} className="dash-content-pad">
        <div style={{
          maxWidth: 640,
          width: '100%',
          marginTop: 40,
        }} className="dash-page-maxw">

          {/* Celebratory Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e1e3e4',
            borderRadius: 24,
            padding: 48,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>

            {/* Success Animation - decorative circles */}
            <div style={{
              position: 'relative',
              width: 120,
              height: 120,
              margin: '0 auto 32px',
            }}>
              {/* Orbiting circle */}
              <div style={{
                position: 'absolute',
                inset: -12,
                borderRadius: '50%',
                border: '2px solid #f7931a',
                opacity: 0.3,
              }} />
              {/* Particle dots */}
              <div style={{
                position: 'absolute',
                top: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#f7931a',
                opacity: 0.5,
              }} />
              <div style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#a4abba',
                opacity: 0.4,
              }} />
              <div style={{
                position: 'absolute',
                top: 8,
                right: -4,
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#a4abba',
                opacity: 0.3,
              }} />
              {/* Green check circle */}
              <div style={{
                position: 'absolute',
                inset: 8,
                borderRadius: '50%',
                background: colors.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,201,80,0.3)',
              }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 style={{
              fontSize: 32,
              fontWeight: 600,
              fontFamily: 'var(--font-geist)',
              color: colors.text,
              marginBottom: 12,
            }}>
              Bitcoin Sent Successfully!
            </h1>
            <p style={{
              fontSize: 18,
              fontWeight: 400,
              fontFamily: 'var(--font-geist)',
              color: colors.warning,
              marginBottom: 32,
              lineHeight: 1.6,
            }}>
              Your withdrawal of 0.000005 BTC has been processed and is currently on its way to your external wallet.
            </p>

            {/* Transaction Details Card */}
            <div style={{
              background: '#ffffff',
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
              textAlign: 'left',
            }}>
              <DetailRow label="Transaction ID" value="0x7d...a9e2" mono />
              <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />
              <DetailRow label="Estimated Arrival" value="~10-30 minutes" />
              <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />
              <DetailRow label="Network Fee" value="0.00000001 BTC" />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'center',
            }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  width: '100%',
                  maxWidth: 320,
                  padding: '16px 32px',
                  background: colors.amber,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 500,
                  fontFamily: 'var(--font-geist)',
                  cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(140,79,0,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Continue Learning
              </button>

              <button
                onClick={() => {/* TODO: view receipt */}}
                style={{
                  width: '100%',
                  maxWidth: 320,
                  padding: '16px 32px',
                  background: '#ffffff',
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 500,
                  fontFamily: 'var(--font-geist)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.amber; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.warning} strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                View Receipt
              </button>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 32,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-geist)',
              color: colors.warning,
              opacity: 0.7,
            }}>
              Secured by BitPath Institutional Custody
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span style={{
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'var(--font-geist)',
        color: '#575e70',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 14,
        fontWeight: 500,
        fontFamily: mono ? 'var(--font-geist-mono), monospace' : 'var(--font-geist)',
        color: '#191c1d',
      }}>
        {value}
      </span>
    </div>
  );
}
