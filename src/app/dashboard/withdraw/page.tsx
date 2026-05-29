'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const colors = {
  amber: '#8C4F00',
  amberLight: '#F5E6D3',
  bg: '#ffffff',
  text: '#191c1d',
  textMuted: '#575e70',
  textPlaceholder: '#6b7280',
  border: '#dbc2ae',
  inputBorder: '#887362',
  darkBg: '#8C4F00',
  darkText: '#e5e2e3',
  darkMuted: '#a1a1aa',
  accent: '#ffb874',
  warning: '#554335',
  green: '#00c950',
};

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('0.00');
  const [address, setAddress] = useState('');

  const handleMax = () => {
    setAmount('0.000005');
  };

  const handleWithdraw = () => {
    router.push('/dashboard/withdraw/success');
  };

  const cardStyle: React.CSSProperties = {
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 20,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 16,
    fontFamily: 'var(--font-inter)',
    color: colors.text,
    outline: 'none',
    background: colors.bg,
  };

  return (
    <DashboardLayout activePage="withdraw">
      <div style={{
        flex: 1,
        padding: '40px 72px',
        overflow: 'auto',
      }} className="dash-content-pad">
        <div style={{ maxWidth: 1100, margin: '0 auto' }} className="dash-page-maxw">

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 600,
              fontFamily: 'var(--font-geist)',
              color: colors.text,
              marginBottom: 8,
            }}>
              Withdraw Your Rewards
            </h1>
            <p style={{
              fontSize: 18,
              fontWeight: 400,
              fontFamily: 'var(--font-geist)',
              color: colors.textMuted,
            }}>
              Choose your preferred method to receive your sats.
            </p>
          </div>

          {/* Balance Card */}
          <div style={{
            ...cardStyle,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            marginBottom: 28,
          }}>
            <div>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-geist)',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
                Available Balance
              </div>
              <div style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: 'var(--font-geist)',
                color: colors.amber,
                marginBottom: 4,
              }}>
                +0.000005 BTC
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 400,
                fontFamily: 'var(--font-geist)',
                color: colors.textMuted,
              }}>
                Approx. $3.84 USD
              </div>
            </div>

            <div style={{
              width: 1,
              height: 60,
              backgroundColor: colors.border,
            }} />

            <div style={{
              background: '#f3f4f5',
              borderRadius: 14,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: colors.amber,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-geist)',
                  color: colors.text,
                }}>
                  Top Learner Status
                </div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 400,
                  fontFamily: 'var(--font-geist)',
                  color: colors.textMuted,
                }}>
                  Zero-fee withdrawals enabled
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Form + Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 28,
            alignItems: 'start',
          }}>
            {/* Left Column - Withdrawal Form */}
            <div style={{
              ...cardStyle,
              padding: 28,
            }}>
              {/* Amount Input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-geist)',
                  color: colors.warning,
                  display: 'block',
                  marginBottom: 8,
                }}>
                  Amount to Withdraw
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: 12,
                  padding: '4px 4px 4px 16px',
                  background: colors.bg,
                }}>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: 24,
                      fontWeight: 600,
                      fontFamily: 'var(--font-geist)',
                      color: colors.textPlaceholder,
                      background: 'transparent',
                    }}
                  />
                  <button
                    onClick={handleMax}
                    style={{
                      padding: '6px 14px',
                      background: colors.amber,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      fontFamily: 'var(--font-inter)',
                      cursor: 'pointer',
                    }}
                  >
                    MAX
                  </button>
                  <span style={{
                    padding: '0 12px',
                    fontSize: 16,
                    fontWeight: 400,
                    fontFamily: 'var(--font-geist)',
                    color: colors.warning,
                  }}>
                    BTC
                  </span>
                </div>
              </div>

              {/* Address Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-geist)',
                  color: colors.warning,
                  display: 'block',
                  marginBottom: 8,
                }}>
                  Destination Address
                </label>
                <div style={{
                  position: 'relative',
                }}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter Bitcoin Address"
                    style={{
                      ...inputStyle,
                      paddingRight: 44,
                    }}
                  />
                  <svg
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                    }}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.warning}
                    strokeWidth="2"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                  </svg>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '12px 14px',
                background: '#fef9f4',
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.amber} strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-geist)',
                  color: colors.warning,
                  lineHeight: 1.5,
                }}>
                  Double-check the address. BTC transfers are irreversible.
                </span>
              </div>
            </div>

            {/* Right Column - Transaction Summary */}
            <div style={{
              background: colors.darkBg,
              borderRadius: 20,
              padding: 32,
              color: colors.darkText,
            }}>
              <h3 style={{
                fontSize: 24,
                fontWeight: 600,
                fontFamily: 'var(--font-geist)',
                color: colors.darkText,
                marginBottom: 24,
              }}>
                Transaction Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SummaryRow
                  label="Transfer Speed"
                  value="Instant Transfer"
                  valueColor={colors.accent}
                />
                <SummaryRow
                  label="Network Fee"
                  value="Minimal Fees"
                  valueColor={colors.accent}
                />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 400,
                    fontFamily: 'var(--font-inter)',
                    color: colors.darkMuted,
                  }}>
                    Protocol
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: 'var(--font-inter)',
                      color: colors.darkText,
                    }}>
                      LIGHTNING NETWORK
                    </span>
                    <div style={{
                      background: colors.accent,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'var(--font-inter)',
                      color: colors.amber,
                    }}>
                      FASTEST
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                height: 1,
                background: '#ffffff',
                opacity: 0.2,
                margin: '20px 0',
              }} />

              <div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: 'var(--font-inter)',
                  color: colors.darkText,
                  marginBottom: 12,
                }}>
                  Total to Receive
                </div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 500,
                  fontFamily: 'var(--font-geist)',
                  color: '#ffffff',
                }}>
                  0.00005 BTC
                </div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--font-inter)',
                  color: colors.accent,
                  marginTop: 4,
                }}>
                  LIGHTNING NETWORK
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 400,
                  fontFamily: 'var(--font-inter)',
                  color: '#ddddf3',
                  marginTop: 2,
                }}>
                  ≈ $3.84 USD
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Button + Security Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 28,
          }}>
            <button
              onClick={handleWithdraw}
              style={{
                padding: '16px 48px',
                background: colors.amber,
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                fontSize: 24,
                fontWeight: 600,
                fontFamily: 'var(--font-geist)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 6px 24px rgba(140,79,0,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Withdraw Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: '#f3f4f5',
              borderRadius: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.darkMuted} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span style={{
                fontSize: 10,
                fontWeight: 400,
                fontFamily: 'var(--font-inter)',
                color: colors.darkMuted,
                letterSpacing: '0.05em',
              }}>
                BANK-GRADE SECURITY PROTOCOL ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'var(--font-inter)',
        color: '#a1a1aa',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'var(--font-inter)',
        color: valueColor || '#e5e2e3',
      }}>
        {value}
      </span>
    </div>
  );
}
