'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LearningPath {
  title: string;
  description: string;
  xp: string;
  lessons: string;
  level: string;
  progress: number;
  image: string;
}

const learningPaths: LearningPath[] = [
  {
    title: 'Bitcoin Basics',
    description: 'Learn the fundamentals of Bitcoin and cryptocurrency',
    xp: '+500 XP',
    lessons: '12 lessons',
    level: 'Beginner',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1518544884411-3a6cb9236aab?w=600&h=300&fit=crop&auto=format',
  },
  {
    title: 'Wallet Security',
    description: 'Master best practices for keeping your Bitcoin safe',
    xp: '+350 XP',
    lessons: '8 lessons',
    level: 'Beginner',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=300&fit=crop&auto=format',
  },
  {
    title: 'Blockchain 101',
    description: 'Understand how blockchain technology works',
    xp: '+450 XP',
    lessons: '10 lessons',
    level: 'Intermediate',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600&h=300&fit=crop&auto=format',
  },
  {
    title: 'Bitcoin Investing',
    description: 'Learn smart strategies for Bitcoin investment',
    xp: '+600 XP',
    lessons: '15 lessons',
    level: 'Intermediate',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop&auto=format',
  },
  {
    title: 'Lightning Network',
    description: 'Explore fast Bitcoin transactions with Lightning',
    xp: '+550 XP',
    lessons: '9 lessons',
    level: 'Advanced',
    progress: 0,
    image: 'https://images.unsplash.com/photo-1524673071433-b9997eeb6709?w=600&h=300&fit=crop&auto=format',
  },
];

interface EmptyStateProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export default function EmptyState({ inputValue, isLoading, onInputChange, onSend }: EmptyStateProps) {
  const suggestionChips = [
    { icon: '₿', text: 'What is Bitcoin?' },
    { icon: '🔗', text: 'How does Bitcoin work?' },
    { icon: '💰', text: 'Bitcoin Wallet Basics' },
    { icon: '⚡', text: 'How to earn Bitcoin' },
  ];

  return (
    <div className="dash-empty" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '72px 72px 0',
      backgroundColor: '#ffffff',
      overflow: 'auto',
    }}>
      <div className="dash-max-w" style={{
        maxWidth: 876,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {/* Heading section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <h1 className="dash-empty-title" style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 800,
            fontSize: 32,
            color: '#101828',
            margin: 0,
          }}>
            Start Your Journey
          </h1>
          <p style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 400,
            fontSize: 16,
            color: '#4A5565',
            margin: 0,
          }}>
            Ask the AI tutor anything about Bitcoin to get started
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Status Pills Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#00C950',
              }} />
              <span style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 500,
                fontSize: 13,
                color: '#364153',
              }}>
                AI Tutor Ready
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 500,
                fontSize: 13,
                color: '#364153',
              }}>
                GPT-4
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Input Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 4px 4px 16px',
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type your first question here... (e.g., 'What is Bitcoin?')"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-inter)',
                fontWeight: 400,
                fontSize: 15,
                color: '#0A0A0A',
                backgroundColor: 'transparent',
                padding: '14px 0',
              }}
            />
            <button
              onClick={onSend}
              disabled={!inputValue.trim() || isLoading}
              style={{
                width: 44,
                height: 44,
                backgroundColor: !inputValue.trim() || isLoading ? '#9CA3AF' : '#101828',
                border: 'none',
                borderRadius: 10,
                cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Suggestion Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
        >
          {suggestionChips.map((chip) => (
            <button
              key={chip.text}
              onClick={() => onInputChange(chip.text)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 9999,
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
                fontWeight: 500,
                fontSize: 14,
                color: '#364153',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8C4F00'; e.currentTarget.style.backgroundColor = '#FFFAF5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
            >
              <span style={{ fontSize: 16 }}>{chip.icon}</span>
              {chip.text}
            </button>
          ))}
        </motion.div>

        {/* Recommended Learning Paths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginTop: 16, marginBottom: 40 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 700,
              fontSize: 20,
              color: '#101828',
              margin: 0,
            }}>
              Recommended Learning Paths
            </h2>
            <span style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 400,
              fontSize: 14,
              color: '#6A7282',
            }}>
              Choose any path to start
            </span>
          </div>

          <div className="learning-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}>
            {learningPaths.map((path) => (
              <div
                key={path.title}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Image area */}
                <div style={{
                  height: 100,
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6',
                }}>
                  <img
                    src={path.image}
                    alt={path.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ padding: 14 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#101828',
                    margin: '0 0 6px',
                  }}>
                    {path.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 400,
                    fontSize: 13,
                    color: '#4A5565',
                    margin: '0 0 10px',
                    lineHeight: 1.4,
                  }}>
                    {path.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-inter)',
                      fontWeight: 700,
                      fontSize: 12,
                      color: '#F54900',
                      backgroundColor: '#FFF7ED',
                      padding: '3px 8px',
                      borderRadius: 9999,
                    }}>
                      {path.xp}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-inter)',
                      fontWeight: 400,
                      fontSize: 12,
                      color: '#6A7282',
                    }}>
                      {path.lessons}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-inter)',
                      fontWeight: 400,
                      fontSize: 12,
                      color: '#6A7282',
                    }}>
                      {path.level}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-inter)',
                      fontWeight: 400,
                      fontSize: 12,
                      color: '#6A7282',
                    }}>
                      {path.progress}% complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    height: 4,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 9999,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${path.progress}%`,
                      backgroundColor: '#D1D5DC',
                      borderRadius: 9999,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dash-empty-title { font-size: 24px !important; }
          .learning-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .learning-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
