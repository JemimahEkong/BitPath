/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/client-api';
import type { Conversation, Message, QuizQuestion, User } from '@/components/dashboard/types';
import Sidebar from '@/components/dashboard/Sidebar';
import ChatMessages from '@/components/dashboard/ChatMessages';
import InputArea from '@/components/dashboard/InputArea';
import QuizUI from '@/components/dashboard/QuizUI';
import EmptyState from '@/components/dashboard/EmptyState';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [unclaimedRewards, setUnclaimedRewards] = useState<any[]>([]);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [lastAnsweredQuestionIndex, setLastAnsweredQuestionIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pendingRetryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStreamingRef = useRef(false);
  const currentConvIdRef = useRef<string | null>(null);
  const sseActiveRef = useRef(false);

  // Refs to hold latest function references for SSE callbacks
  const loadUserProfileRef = useRef<() => Promise<void>>(async () => {});
  const loadUnclaimedRef = useRef<() => Promise<void>>(async () => {});
  const loadConversationsRef = useRef<() => Promise<void>>(async () => {});

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const cleanup = useCallback(() => {
    if (pendingRetryTimerRef.current) {
      clearTimeout(pendingRetryTimerRef.current);
      pendingRetryTimerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    sseActiveRef.current = false;
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
      }
    } catch {
      console.error('Error loading user profile');
    }
  }, []);

  // Rewards - endpoint may not exist yet, gracefully handle
  const loadUnclaimedRewards = useCallback(async () => {
    try {
      const response = await api.get('/rewards/unclaimed');
      setUnclaimedRewards(response.data?.rewards || response.data?.data || response.data || []);
    } catch {
      // rewards endpoint not available yet
    }
  }, []);

  const claimAllRewards = useCallback(async () => {
    setIsClaimingRewards(true);
    try {
      const response = await api.post('/rewards/claim-all');
      alert(response.data.message);
      loadUnclaimedRewards();
      loadUserProfile();
    } catch {
      // rewards endpoint not available yet
    } finally {
      setIsClaimingRewards(false);
    }
  }, [loadUnclaimedRewards, loadUserProfile]);

  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data?.conversations || response.data?.data || response.data || []);
    } catch {
      console.error('Error loading conversations');
    }
  }, []);

  const selectConversation = useCallback(async (conversation: Conversation) => {
    if (currentQuiz) {
      setCurrentQuiz(null);
      setCurrentQuestionIndex(0);
      setQuizAnswer('');
      setIsQuizLoading(false);
      setLastAnsweredQuestionIndex(null);
    }
    setMessages([]);
    setIsConversationLoading(true);
    cleanup();
    setCurrentConversation(conversation);

    try {
      const convResponse = await api.get(`/conversations/${conversation.id}`);
      const convData = convResponse.data?.conversation || convResponse.data?.data || convResponse.data;
      setCurrentConversation(convData);
      if (convData.totalMessages === 0) {
        setIsConversationLoading(false);
        return;
      }
      const messagesResponse = await api.get(`/conversations/${convData.id}/messages`);
      setMessages(messagesResponse.data?.messages || messagesResponse.data?.data || messagesResponse.data || []);
      setIsConversationLoading(false);
    } catch {
      console.error('Error loading conversation');
      setMessages([]);
      setIsConversationLoading(false);
    }
  }, [currentQuiz, cleanup]);

  // Keep refs up to date
  loadUserProfileRef.current = loadUserProfile;
  loadUnclaimedRef.current = loadUnclaimedRewards;
  loadConversationsRef.current = loadConversations;

  const setupSSE = useCallback((conversationId: string) => {
    if (sseActiveRef.current) return;
    cleanup();

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;

    const connect = () => {
      if (sseActiveRef.current) return;
      const eventSource = new EventSource(
        `/api/proxy/conversations/sse/stream/${conversationId}`,
        { withCredentials: true }
      );

      eventSource.onopen = () => {
        reconnectAttempts = 0;
        sseActiveRef.current = true;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'typing') {
            setIsTyping(data.isTyping);
          } else if (data.type === 'chunk') {
            isStreamingRef.current = true;
            setIsTyping(false);
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'ASSISTANT' && !lastMessage.isComplete) {
                return [...prev.slice(0, -1), { ...lastMessage, content: lastMessage.content + data.content }];
              }
              return [...prev, {
                id: Date.now().toString(),
                conversationId,
                role: 'ASSISTANT',
                type: 'TEXT',
                content: data.content,
                isStreaming: true,
                isComplete: false,
                createdAt: new Date().toISOString(),
                needsRetry: false,
              }];
            });
          } else if (data.type === 'complete') {
            isStreamingRef.current = false;
            setMessages(prev => {
              const updated = prev.map(m => ({ ...m, needsRetry: false, isError: false }));
              const last = updated[updated.length - 1];
              if (last && last.role === 'ASSISTANT') return [...updated.slice(0, -1), data.message];
              return [...updated, data.message];
            });
            setCurrentConversation(prev => prev ? { ...prev, totalMessages: prev.totalMessages + 1 } : prev);
          } else if (data.type === 'error') {
            isStreamingRef.current = false;
            setIsTyping(false);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              conversationId,
              role: 'ASSISTANT',
              type: 'TEXT',
              content: 'Sorry, I encountered an error. Please try again.',
              isStreaming: false,
              isComplete: true,
              createdAt: new Date().toISOString(),
              isError: true,
            }]);
          } else if (data.type === 'quiz_completed') {
            loadUserProfileRef.current();
            loadUnclaimedRef.current();
            (async () => {
              try {
                const convResponse = await api.get(`/conversations/${conversationId}`);
                const convData = convResponse.data?.conversation || convResponse.data?.data || convResponse.data;
                setCurrentConversation(convData);
                await loadConversationsRef.current();
                if (data.passed) {
                  setCurrentQuiz(null);
                  setCurrentQuestionIndex(0);
                  setQuizAnswer('');
                  setIsQuizLoading(false);
                  setLastAnsweredQuestionIndex(null);
                } else {
                  setLastAnsweredQuestionIndex(null);
                }
              } catch {
                console.error('Error updating conversation');
              }
            })();
          }
        } catch {
          console.error('SSE parse error');
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        sseActiveRef.current = false;
        isStreamingRef.current = false;
        setIsTyping(false);
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          setTimeout(connect, delay);
        }
      };

      eventSourceRef.current = eventSource;
    };

    currentConvIdRef.current = conversationId;
    connect();
  }, [cleanup]);

  const quizAttemptIdRef = useRef<string | null>(null);

  const startQuiz = useCallback(async () => {
    if (!currentConversation) return;
    try {
      setIsQuizLoading(true);
      quizAttemptIdRef.current = null;
      const response = await api.post(`/conversations/${currentConversation.id}/quiz/start`, {
        topic: 'Bitcoin',
        difficulty: 'medium',
      });
      const data = response.data?.data || response.data;
      quizAttemptIdRef.current = data?.quizAttemptId || data?.id || null;
      // Backend returns a single question object, wrap in array
      const raw = data?.questions || data?.quiz?.questions || data;
      if (Array.isArray(raw)) {
        setCurrentQuiz(raw);
      } else if (raw && typeof raw === 'object' && raw.question) {
        setCurrentQuiz([raw]);
      } else {
        setCurrentQuiz([]);
      }
      setCurrentQuestionIndex(0);
      setQuizAnswer('');
      setLastAnsweredQuestionIndex(null);
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      alert(`Failed to start quiz: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsQuizLoading(false);
    }
  }, [currentConversation]);

  const submitQuizAnswer = useCallback(async () => {
    if (!currentConversation || !currentQuiz || !quizAnswer.trim()) return;
    const attemptId = quizAttemptIdRef.current;
    if (!attemptId) {
      alert('Quiz session not found. Please restart the quiz.');
      return;
    }
    const answerText = quizAnswer;
    setQuizAnswer('');
    setIsQuizLoading(true);
    try {
      const response = await api.post(
        `/conversations/${currentConversation.id}/quiz/${attemptId}/answer`,
        { answer: answerText },
        { timeout: 60000 }
      );
      const result = response.data?.data || response.data;
      setCurrentQuiz(prev => {
        if (!prev) return prev;
        return prev.map((q, idx) => idx === currentQuestionIndex ? { ...q, ...result } : q);
      });
      setLastAnsweredQuestionIndex(currentQuestionIndex);
      if (currentQuestionIndex < currentQuiz.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      loadUserProfile();
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      if (error.code === 'ECONNABORTED') {
        alert('Answer evaluation is taking longer than expected. Please try again or send your answer as a regular message.');
      } else {
        alert('Failed to submit answer. Please try again.');
      }
    } finally {
      setIsQuizLoading(false);
    }
  }, [currentConversation, currentQuiz, currentQuestionIndex, quizAnswer, loadUserProfile]);

  const retryMessage = useCallback(async (userMsg: Message) => {
    if (!currentConversation) return;
    cleanup();
    setMessages(prev => prev.filter(m => !m.isError).map(m => m.id === userMsg.id ? { ...m, needsRetry: false } : m));
    try {
      setIsLoading(true);
      await api.post(`/conversations/${currentConversation.id}/messages`, {
        content: userMsg.content,
        role: 'USER',
        type: 'TEXT',
      });
      setupSSE(currentConversation.id);
    } catch {
      console.error('Retry error');
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, cleanup, setupSSE]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    cleanup();
    let conversationId: string;

    try {
      setIsLoading(true);
      setIsTyping(true);

      if (!currentConversation) {
        const convRes = await api.post('/conversations', {
          title: 'New Chat',
          topic: 'Bitcoin',
        });
        const convData = convRes.data?.conversation || convRes.data?.data || convRes.data;
        conversationId = convData.id;
        setCurrentConversation(convData);
        setConversations(prev => {
          if (prev.some(c => c.id === convData.id)) return prev;
          return [convData, ...prev];
        });
        setMessages([]);
      } else {
        conversationId = currentConversation.id;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        conversationId,
        role: 'USER',
        type: 'TEXT',
        content: inputValue,
        isStreaming: false,
        isComplete: true,
        createdAt: new Date().toISOString(),
        needsRetry: false,
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');

      pendingRetryTimerRef.current = setTimeout(() => {
        setMessages(prev => prev.map(m => {
          if (m.id === userMessage.id) {
            const userIndex = prev.findIndex(x => x.id === userMessage.id);
            const hasAiReply = prev.slice(userIndex + 1).some(x => x.role === 'ASSISTANT');
            return hasAiReply ? m : { ...m, needsRetry: true };
          }
          return m;
        }));
      }, 5000);

      await api.post(`/conversations/${conversationId}/messages`, {
        content: userMessage.content,
        role: 'USER',
        type: 'TEXT',
      });
      setupSSE(conversationId);
    } catch {
      if (pendingRetryTimerRef.current) {
        clearTimeout(pendingRetryTimerRef.current);
        pendingRetryTimerRef.current = null;
      }
      setMessages(prev => prev.map(m =>
        m.role === 'USER' && !prev.slice(prev.indexOf(m) + 1).some(x => x.role === 'ASSISTANT')
          ? { ...m, needsRetry: true }
          : m
      ));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [inputValue, isLoading, currentConversation, cleanup, setupSSE]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logOut', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    } catch {
      // proceed to redirect even if logout fails
    }
    window.location.href = '/login';
  }, []);

  const newChat = useCallback(() => {
    cleanup();
    sseActiveRef.current = false;
    currentConvIdRef.current = null;
    setCurrentConversation(null);
    setMessages([]);
    setIsTyping(false);
    isStreamingRef.current = false;
  }, [cleanup]);

  // Initial load
  useEffect(() => {
    loadUserProfile();
    loadConversations();
    loadUnclaimedRewards();
    return cleanup;
  }, []);

  // Session monitoring
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
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkSession();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // SSE connection - only connect when id changes, skip if SSE already active
  useEffect(() => {
    if (currentConversation && !sseActiveRef.current) {
      setupSSE(currentConversation.id);
    }
    return () => {
      if (!currentConversation) cleanup();
    };
  }, [currentConversation?.id]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#ffffff',
      fontFamily: 'var(--font-inter)',
      overflow: 'hidden',
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @media (max-width: 768px) {
          .dash-header { padding: 12px 16px !important; }
          .dash-content-pad { padding: 16px !important; }
          .dash-msg-area { padding: 16px 16px !important; }
          .dash-input-area { padding: 16px !important; }
          .dash-quiz-wrap { padding: 16px !important; }
          .dash-max-w { max-width: 100% !important; }
          .dash-empty { padding: 24px 16px !important; }
          .dash-quiz-btn { bottom: 100px !important; right: 16px !important; }
        }
        @media (max-width: 1024px) {
          .dash-header { padding: 16px 24px !important; }
          .dash-content-pad { padding: 24px !important; }
          .dash-msg-area { padding: 24px 24px !important; }
          .dash-input-area { padding: 20px 24px !important; }
          .dash-quiz-wrap { padding: 24px !important; }
        }
      `}</style>

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
      <style>{`
        @media (max-width: 768px) {
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>

      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        user={user}
        unclaimedRewards={unclaimedRewards}
        isClaimingRewards={isClaimingRewards}
        onSelectConversation={(conv) => { selectConversation(conv); setSidebarOpen(false); }}
        onNewChat={() => { newChat(); setSidebarOpen(false); }}
        onClaimRewards={claimAllRewards}
        onLogout={handleLogout}
        isMobileOpen={sidebarOpen}
        onToggleMobile={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentConversation && (
          <div className="dash-header" style={{
            padding: '20px 72px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
          }}>
            <div className="dash-max-w" style={{
              maxWidth: 876,
              margin: '0 auto',
              fontFamily: 'var(--font-inter)',
              fontSize: 20,
              fontWeight: 700,
              color: '#101828',
            }}>
              {currentConversation.title || 'New Chat'}
            </div>
          </div>
        )}

        {!currentConversation ? (
          <EmptyState
            inputValue={inputValue}
            isLoading={isLoading}
            onInputChange={setInputValue}
            onSend={sendMessage}
          />
        ) : currentQuiz ? (
          <QuizUI
            currentQuiz={currentQuiz}
            currentQuestionIndex={currentQuestionIndex}
            quizAnswer={quizAnswer}
            isQuizLoading={isQuizLoading}
            lastAnsweredQuestionIndex={lastAnsweredQuestionIndex}
            unclaimedRewards={unclaimedRewards}
            isClaimingRewards={isClaimingRewards}
            onAnswerChange={setQuizAnswer}
            onSubmitAnswer={submitQuizAnswer}
            onDismiss={() => {
              setCurrentQuiz(null);
              setCurrentQuestionIndex(0);
              setQuizAnswer('');
              setIsQuizLoading(false);
              setLastAnsweredQuestionIndex(null);
            }}
            onClaimRewards={claimAllRewards}
          />
        ) : (
          <>
            <ChatMessages
              messages={messages}
              currentConversation={currentConversation}
              isConversationLoading={isConversationLoading}
              isTyping={isTyping}
              onRetry={retryMessage}
              messagesEndRef={messagesEndRef}
            />

            <InputArea
              inputValue={inputValue}
              isLoading={isLoading}
              onInputChange={setInputValue}
              onSend={sendMessage}
            />

            {currentConversation && !currentConversation.quizPassed &&
              (currentConversation.totalMessages || 0) >= 10 && (
              <div className="dash-quiz-btn" style={{
                position: 'fixed',
                bottom: 120,
                right: 40,
                zIndex: 10,
              }}>
                <button
                  onClick={startQuiz}
                  disabled={isQuizLoading}
                  style={{
                    padding: '14px 28px',
                    backgroundColor: isQuizLoading ? '#9CA3AF' : '#8C4F00',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'var(--font-inter)',
                    cursor: isQuizLoading ? 'not-allowed' : 'pointer',
                    boxShadow: isQuizLoading ? 'none' : '0 6px 24px rgba(140,79,0,0.35)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isQuizLoading ? 'Starting...' : 'Start Quiz'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
