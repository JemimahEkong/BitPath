'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message, Conversation } from './types';

const styles = {
  avatar: (role: string) => ({
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    color: '#ffffff',
    margin: '0 16px',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    background: role === 'USER'
      ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
      : 'linear-gradient(135deg, #8C4F00, #6B3B00)',
  } as React.CSSProperties),
  bubble: (role: string) => ({
    backgroundColor: role === 'USER' ? '#8C4F00' : '#ffffff',
    color: role === 'USER' ? '#ffffff' : '#374151',
    padding: '24px 28px',
    borderRadius: role === 'USER' ? '18px 18px 6px 18px' : 18,
    fontSize: 15,
    lineHeight: 1.8,
    boxShadow: role === 'USER'
      ? '0 6px 24px rgba(140,79,0,0.25)'
      : '0 4px 20px rgba(0,0,0,0.06)',
    border: role === 'USER' ? 'none' : '1px solid #f3f4f6',
  } as React.CSSProperties),
  skeleton: {
    height: 18,
    borderRadius: 8,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite linear',
  },
};

const markdownStyles = `
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes typing {
    0%,60%,100% { transform: translateY(0); }
    30% { transform: translateY(-12px); }
  }
`;

interface ChatMessagesProps {
  messages: Message[];
  currentConversation: Conversation | null;
  isConversationLoading: boolean;
  isTyping: boolean;
  onRetry: (message: Message) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessages({
  messages,
  currentConversation,
  isConversationLoading,
  isTyping,
  onRetry,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <div className="dash-msg-area" style={{
      flex: 1,
      overflowY: 'auto',
      padding: '32px 72px',
      backgroundColor: '#ffffff',
    }}>
      <style>{markdownStyles}</style>

      {currentConversation && isConversationLoading && (
        <div style={{ maxWidth: 876, margin: '0 auto', padding: '32px 0' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="dash-max-w"
              style={{
                display: 'flex',
                marginBottom: 28,
                maxWidth: 876,
                marginLeft: 'auto',
                marginRight: 'auto',
                flexDirection: i === 2 ? 'row-reverse' : 'row',
              } as React.CSSProperties}
            >
              <div style={{
                ...styles.avatar(i === 2 ? 'USER' : 'ASSISTANT'),
                ...(i === 2 ? {} : styles.avatar('ASSISTANT')),
              } as React.CSSProperties}>
                {i === 2 ? 'U' : 'AI'}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ ...styles.skeleton, width: i === 1 ? '60%' : i === 2 ? '50%' : '70%' }} />
                <div style={{ ...styles.skeleton, width: i === 1 ? '80%' : '55%' }} />
                {i === 1 && <div style={{ ...styles.skeleton, width: '45%' }} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {currentConversation && !isConversationLoading && (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                marginBottom: 28,
                maxWidth: 876,
                marginLeft: 'auto',
                marginRight: 'auto',
                flexDirection: message.role === 'USER' ? 'row-reverse' : 'row',
              } as React.CSSProperties}
            >
              <div style={styles.avatar(message.role)}>
                {message.role === 'USER' ? 'U' : 'AI'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <div style={styles.bubble(message.role)}>
                  {message.role === 'ASSISTANT' && !message.isError ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
                {(message.isError || message.needsRetry) && (
                  <div style={{
                    display: 'flex',
                    justifyContent: message.role === 'USER' ? 'flex-end' : 'flex-start',
                  }}>
                    <button
                      onClick={() => {
                        if (message.isError) {
                          const userMsgs = messages.filter(m => m.role === 'USER');
                          const lastUserMsg = userMsgs[userMsgs.length - 1];
                          if (lastUserMsg) onRetry(lastUserMsg);
                        } else if (message.role === 'USER') {
                          onRetry(message);
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #8C4F00, #6B3B00)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(140,79,0,0.3)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Quiz Readiness Banner - shown when quiz is available */}
          {currentConversation && !currentConversation.quizPassed &&
            (currentConversation.totalMessages || 0) >= 10 && (
            <div className="dash-max-w" style={{
              maxWidth: 876,
              margin: '0 auto 28px',
              padding: 28,
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: 18,
              border: '1px solid #fbbf24',
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#92400e',
                marginBottom: 12,
                fontFamily: 'var(--font-inter)',
              }}>
                Quiz Time!
              </h3>
              <p style={{
                fontSize: 15,
                color: '#78350f',
                marginBottom: 16,
                fontFamily: 'var(--font-inter)',
              }}>
                You have enough messages to start the quiz! Click the button below to begin.
              </p>
            </div>
          )}

          {/* Quiz Passed Banner */}
          {currentConversation?.quizPassed && (
            <div className="dash-max-w" style={{
              maxWidth: 876,
              margin: '0 auto 28px',
              padding: 28,
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              borderRadius: 18,
              border: '1px solid #34d399',
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#065f46',
                marginBottom: 12,
                fontFamily: 'var(--font-inter)',
              }}>
                Quiz Completed!
              </h3>
              <p style={{
                fontSize: 15,
                color: '#064e3b',
                fontFamily: 'var(--font-inter)',
              }}>
                You&apos;ve successfully passed the quiz for this conversation! Keep learning or start a new conversation for your next quiz challenge!
              </p>
            </div>
          )}
        </>
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="dash-max-w" style={{
          display: 'flex',
          gap: 6,
          padding: '20px 24px',
          background: '#ffffff',
          borderRadius: 18,
          maxWidth: 876,
          margin: '0 auto 28px',
          border: '1px solid #f3f4f6',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                background: '#9CA3AF',
                borderRadius: '50%',
                animation: `typing 1.4s ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
