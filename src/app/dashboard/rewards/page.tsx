'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function RewardsPage() {
  return (
    <DashboardLayout activePage="rewards">
      <div style={{
        flex: 1,
        padding: '40px 72px',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} className="dash-content-pad">
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 600,
            fontFamily: 'var(--font-geist)',
            color: '#191c1d',
            marginBottom: 12,
          }}>
            Rewards
          </h1>
          <p style={{
            fontSize: 16,
            color: '#575e70',
            fontFamily: 'var(--font-inter)',
          }}>
            Your rewards and earnings will appear here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
