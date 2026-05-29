'use client';

import React from 'react';

interface InputAreaProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export default function InputArea({ inputValue, isLoading, onInputChange, onSend }: InputAreaProps) {
  return (
    <div style={{
      padding: '24px 72px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
    }}>
      <div style={{
        maxWidth: 876,
        margin: '0 auto',
        display: 'flex',
        gap: 16,
        alignItems: 'flex-end',
      }}>
        <textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Ask a question..."
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            padding: '16px 20px',
            border: '2px solid #e5e7eb',
            borderRadius: 16,
            fontSize: 15,
            resize: 'none',
            outline: 'none',
            fontFamily: 'var(--font-inter)',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.3s',
            color: '#0A0A0A',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#8C4F00';
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(140,79,0,0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
        />
        <button
          onClick={onSend}
          disabled={!inputValue.trim() || isLoading}
          style={{
            width: 52,
            height: 52,
            backgroundColor: !inputValue.trim() || isLoading ? '#9CA3AF' : '#101828',
            color: '#ffffff',
            border: 'none',
            borderRadius: 14,
            cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: !inputValue.trim() || isLoading ? 'none' : '0 4px 14px rgba(16,24,40,0.35)',
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
