/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/axios';

// Types
interface Conversation {
  id: string;
  userId: string;
  title?: string;
  topic?: string;
  summary?: string;
  contextSummary?: string;
  currentLessonId?: string;
  conversationMode: string;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt?: string;
  totalMessages: number;
  quizPassed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  role: string;
  type: string;
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  tokensUsed?: number;
  modelUsed?: string;
  metadata?: any;
  createdAt: string;
  isError?: boolean;
  needsRetry?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer?: string;
  answer?: string;
  isCorrect?: boolean;
  xpEarned?: number;
  satoshiEarned?: number;
  encouragingMessage?: string;
}

interface User {
  id: string;
  email: string;
  totalXp: number;
  totalSatoshiEarned: number;
  quizQuestionCount: number;
  passedQuizCount: number;
}

interface QuizAttempt {
  id: string;
  userId?: string;
  conversationId?: string;
  topic?: string;
  difficulty?: string;
  question?: string;
  correctAnswer?: string;
  answer?: string;
  isCorrect?: boolean;
  xpEarned?: number;
  satoshiEarned?: number;
  questions?: QuizQuestion[];
  answers?: any[];
  totalCorrect?: number;
  totalSatoshiEarned?: number;
  isComplete?: boolean;
  isPassed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function DashboardPage() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [loadedConversations, setLoadedConversations] = useState<Set<string>>(new Set());
  const [unclaimedRewards, setUnclaimedRewards] = useState<any[]>([]);
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  
  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [lastAnsweredQuestionIndex, setLastAnsweredQuestionIndex] = useState<number | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pendingRetryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStreamingRef = useRef(false);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup timers and connections
  const cleanup = useCallback(() => {
    if (pendingRetryTimerRef.current) {
      clearTimeout(pendingRetryTimerRef.current);
      pendingRetryTimerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Load unclaimed rewards
  const loadUnclaimedRewards = async () => {
    try {
      const response = await api.get('/rewards/unclaimed');
      setUnclaimedRewards(response.data);
    } catch (error) {
      console.error('Error loading unclaimed rewards:', error);
    }
  };

  // Claim all unclaimed rewards
  const claimAllRewards = async () => {
    setIsClaimingRewards(true);
    try {
      const response = await api.post('/rewards/claim-all');
      alert(response.data.message);
      loadUnclaimedRewards();
      loadUserProfile();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert('Failed to claim rewards. Please try again.');
    } finally {
      setIsClaimingRewards(false);
    }
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
      
      // Auto-select the most recent conversation if none is selected
      if (response.data.length > 0 && !currentConversation) {
        const mostRecent = response.data[0];
        await selectConversation(mostRecent);
      }
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      if (error.response?.status === 401) {
        console.error('Please log in to use the dashboard');
      }
    }
  };

  // Select conversation
  const selectConversation = async (conversation: Conversation) => {
    cleanup();
    
    // Cancel the current quiz if we're in one!
    if (currentQuiz) {
      setCurrentQuiz(null);
      setCurrentQuestionIndex(0);
      setQuizAnswer('');
      setIsQuizLoading(false);
      setLastAnsweredQuestionIndex(null);
    }

    // FIRST: Clear EVERYTHING immediately - NO OLD DATA VISIBLE AT ALL!
    setMessages([]);
    setIsConversationLoading(true);
    
    // THEN set conversation
    setCurrentConversation(conversation);

    // Fetch FULL updated conversation from server!
    try {
      const convResponse = await api.get(`/conversations/${conversation.id}`);
      setCurrentConversation(convResponse.data);
      
      // If it's a new/empty conversation, done!
      if (convResponse.data.totalMessages === 0) {
        setIsConversationLoading(false);
        setLoadedConversations(prev => new Set(prev).add(convResponse.data.id));
        return;
      }
      
      // Fetch fresh messages - skeleton is already showing!
      const messagesResponse = await api.get(`/conversations/${convResponse.data.id}/messages`);
      
      setMessages(messagesResponse.data);
      setIsConversationLoading(false); // Stop loading immediately when messages arrive!
      setLoadedConversations(prev => new Set(prev).add(convResponse.data.id));
    } catch (error) {
      console.error('Error loading conversation:', error);
      setMessages([]);
      setIsConversationLoading(false);
    }
  };

  // Setup SSE with automatic reconnection
  const setupSSE = useCallback((conversationId: string) => {
    cleanup();

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;

    const connect = () => {
      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_SERVER_LOCAL_URL}/conversations/sse/stream/${conversationId}`,
        { withCredentials: true }
      );

      eventSource.onopen = () => {
        console.log('SSE connected');
        reconnectAttempts = 0;
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
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + data.content,
                  }
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: Date.now().toString(),
                    conversationId: conversationId,
                    role: 'ASSISTANT',
                    type: 'TEXT',
                    content: data.content,
                    isStreaming: true,
                    isComplete: false,
                    createdAt: new Date().toISOString(),
                    needsRetry: false,
                  }
                ];
              }
            });
          } else if (data.type === 'complete') {
            isStreamingRef.current = false;
            setMessages(prev => {
              // Clear retry flags on all user messages
              const updated = prev.map(m => ({ ...m, needsRetry: false, isError: false }));
              const last = updated[updated.length - 1];
              if (last && last.role === 'ASSISTANT') {
                return [...updated.slice(0, -1), data.message];
              }
              return [...updated, data.message];
            });
            
            // Increment total messages locally for immediate UI update
            setCurrentConversation(prev => prev ? { ...prev, totalMessages: prev.totalMessages + 1 } : prev);
          } else if (data.type === 'error') {
            isStreamingRef.current = false;
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                conversationId: conversationId,
                role: 'ASSISTANT',
                type: 'TEXT',
                content: 'Sorry, I encountered an error. Please try again.',
                isStreaming: false,
                isComplete: true,
                createdAt: new Date().toISOString(),
                isError: true,
              }
            ]);
          } else if (data.type === 'quiz_completed') {
            // Get the conversation ID from the event or use current - but first, immediately load everything!
            const conversationId = currentConversation?.id;
            
            loadUserProfile();
            loadUnclaimedRewards();
            
            if (conversationId) {
              // FIRST: Reload the conversation data IMMEDIATELY to get quizPassed update!
              const updateConversation = async () => {
                try {
                  const convResponse = await api.get(`/conversations/${conversationId}`);
                  setCurrentConversation(convResponse.data);
                  // Also reload conversations list to update sidebar
                  await loadConversations();
                  
                  // Only clear quiz state after we've updated the conversation!
                  if (data.passed) {
                    setCurrentQuiz(null);
                    setCurrentQuestionIndex(0);
                    setQuizAnswer('');
                    setIsQuizLoading(false);
                    setLastAnsweredQuestionIndex(null);
                  } else {
                    // If quiz completed but not passed, just clear the encouraging message index and keep quiz visible
                    setLastAnsweredQuestionIndex(null);
                  }
                } catch (error) {
                  console.error('Error updating conversation:', error);
                }
              };
              updateConversation();
            }
          }
        } catch (error) {
          console.error('SSE parse error:', error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        isStreamingRef.current = false;
        setIsTyping(false);
        
        // Try to reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          console.log(`SSE reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
          setTimeout(connect, delay);
        }
      };

      eventSourceRef.current = eventSource;
    };

    connect();
  }, [cleanup]);

  // Start Full Quiz
  const startQuiz = async () => {
    if (!currentConversation) return;
    try {
      setIsQuizLoading(true);
      const response = await api.post(`/conversations/${currentConversation.id}/quiz/full`, {
        topic: 'Bitcoin',
        difficulty: 'medium',
      });
      setCurrentQuiz(response.data);
      setCurrentQuestionIndex(0);
      setQuizAnswer('');
      setLastAnsweredQuestionIndex(null);
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      alert(`Failed to start quiz: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Submit Quiz Answer
  const submitQuizAnswer = async () => {
    if (!currentConversation || !currentQuiz || !quizAnswer.trim()) return;
    
    const currentQuestion = currentQuiz[currentQuestionIndex];
    if (!currentQuestion) return;

    setQuizAnswer('');
    setIsQuizLoading(true);

    try {
      const response = await api.post(`/conversations/${currentConversation.id}/quiz/${currentQuestion.id}/answer`, {
        answer: quizAnswer,
      });
      
      // Update quiz with the server response
      setCurrentQuiz(prev => {
        if (!prev) return prev;
        return prev.map((q, idx) => {
          if (idx === currentQuestionIndex) {
            return { ...q, ...response.data };
          }
          return q;
        });
      });
      
      // Track that we just answered this question
      setLastAnsweredQuestionIndex(currentQuestionIndex);
      
      // Move to next question if there are more
      if (currentQuestionIndex < currentQuiz.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }

      // Reload user profile to get updated satoshi/XP
      loadUserProfile();
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Retry a message
  const retryMessage = async (userMsg: Message) => {
    if (!currentConversation) return;

    cleanup();

    // Remove error messages and reset retry flags
    setMessages(prev => prev
      .filter(m => !m.isError)
      .map(m => m.id === userMsg.id ? { ...m, needsRetry: false } : m)
    );

    try {
      setIsLoading(true);
      await api.post(`/conversations/${currentConversation.id}/messages`, {
        content: userMsg.content,
        role: 'USER',
        type: 'TEXT',
      });
      setupSSE(currentConversation.id);
    } catch (error) {
      console.error('Retry error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
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
        conversationId = convRes.data.id;
        setCurrentConversation(convRes.data);
        setMessages([]);
        await loadConversations();
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
      
      // Increment total messages locally for immediate UI update
      setCurrentConversation(prev => prev ? { ...prev, totalMessages: prev.totalMessages + 1 } : prev);

      // Show retry button after 5 seconds if no AI response
      pendingRetryTimerRef.current = setTimeout(() => {
        setMessages(prev => prev.map(m => {
          if (m.id === userMessage.id) {
            const userIndex = prev.findIndex(x => x.id === userMessage.id);
            const hasAiReply = prev.slice(userIndex + 1).some(x => x.role === 'ASSISTANT');
            if (!hasAiReply) {
              return { ...m, needsRetry: true };
            }
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
    } catch (error) {
      console.error('Send error:', error);
      // Clear the retry timer since we got an error immediately
      if (pendingRetryTimerRef.current) {
        clearTimeout(pendingRetryTimerRef.current);
        pendingRetryTimerRef.current = null;
      }
      // Add an error message and mark the user message for retry
      setMessages(prev => [
        ...prev.map(m => m.id === userMessage.id ? { ...m, needsRetry: true } : m),
        {
          id: (Date.now() + 1).toString(),
          conversationId,
          role: 'ASSISTANT',
          type: 'TEXT',
          content: 'Sorry, I encountered an error. Please try again.',
          isStreaming: false,
          isComplete: true,
          createdAt: new Date().toISOString(),
          isError: true,
        }
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadUserProfile();
    loadConversations();
    loadUnclaimedRewards();
    return cleanup;
  }, [cleanup]);

  // Session monitoring - check if session is still valid periodically and on visibility change
  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.get('/auth/check');
      } catch (error: any) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Session invalid - redirect to login!
          window.location.href = '/login';
        }
      }
    };

    // Check session every 60 seconds
    const intervalId = setInterval(checkSession, 60000);

    // Check session when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (currentConversation) {
      setupSSE(currentConversation.id);
    }
    return cleanup;
  }, [currentConversation?.id, setupSSE, cleanup]);

  return (
    <div className="dashboard-container">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .dashboard-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: 300px;
          min-width: 300px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }

        .new-chat-btn {
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
        }

        .new-chat-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .conversation-item {
          padding: 16px 20px;
          margin-bottom: 10px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
          border: 2px solid transparent;
        }

        .conversation-item:hover {
          background-color: #f8fafc;
          color: #1f2937;
          transform: translateX(2px);
          border-color: #e5e7eb;
        }

        .conversation-item.active {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
          border-color: transparent;
        }

        .conversation-title {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
        }

        /* Main chat */
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        .chat-header {
          padding: 20px 28px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }

        .chat-header-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 32px 28px;
          background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
        }

        .message {
          display: flex;
          margin-bottom: 28px;
          max-width: 850px;
          margin-left: auto;
          margin-right: auto;
        }

        .message.user { flex-direction: row-reverse; }

        .message-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: white;
          margin: 0 16px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .message-avatar.user {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        }

        .message-avatar.assistant {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
        }

        .message-content {
          background-color: #ffffff;
          padding: 24px 28px;
          border-radius: 18px;
          font-size: 15px;
          line-height: 1.8;
          color: #374151;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #f3f4f6;
        }

        .message.user .message-content {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          box-shadow: 0 6px 24px rgba(109, 40, 217, 0.35);
        }

        /* Markdown */
        .message-content :global(h1),
        .message-content :global(h2),
        .message-content :global(h3) {
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          font-weight: 700;
          color: #111827;
        }

        .message.user .message-content :global(h1),
        .message.user .message-content :global(h2),
        .message.user .message-content :global(h3) {
          color: #ffffff;
        }

        .message-content :global(p) { margin-bottom: 1.25em; }
        .message-content :global(ul), .message-content :global(ol) {
          margin-left: 1.75em;
          margin-bottom: 1.25em;
        }
        .message-content :global(li) { margin-bottom: 0.65em; }
        .message-content :global(strong) {
          font-weight: 700;
          color: #111827;
        }
        .message.user .message-content :global(strong) { color: #ffffff; }

        .message-content :global(code) {
          background-color: #f3f4f6;
          padding: 0.3em 0.6em;
          border-radius: 8px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 0.875rem;
        }

        .message.user .message-content :global(code) {
          background-color: rgba(255,255,255,0.2);
        }

        .message-content :global(pre) {
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 1.5em;
          border-radius: 14px;
          overflow-x: auto;
          margin-bottom: 1.25em;
        }

        .message-content :global(pre code) {
          background: none;
          padding: 0;
          color: inherit;
        }

        /* Retry button */
        .retry-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }

        /* Input */
        .input-area {
          padding: 24px 28px;
          border-top: 1px solid #e2e8f0;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }

        .input-wrapper {
          max-width: 850px;
          margin: 0 auto;
          display: flex;
          gap: 16px;
          align-items: flex-end;
        }

        .input-field {
          flex: 1;
          padding: 16px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 15px;
          resize: none;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .input-field:focus {
          border-color: #8B5CF6;
          box-shadow: 0 0 0 4px rgba(139,92,246,0.15);
        }

        .send-btn {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(139,92,246,0.35);
        }

        .send-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(139,92,246,0.45); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Typing indicator */
        .typing-indicator {
          display: flex;
          gap: 6px;
          padding: 20px 24px;
          background: white;
          border-radius: 18px;
          max-width: 850px;
          margin: 0 auto 28px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .typing-dot {
          width: 10px;
          height: 10px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-12px); }
        }

        /* Skeleton Loader */
        .skeleton-line {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite linear;
        }

        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) { .sidebar { display: none; } }
      `}</style>

      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={() => {
            cleanup();
            setCurrentConversation(null);
            setMessages([]);
            setIsTyping(false);
            isStreamingRef.current = false;
          }}>
            + New Chat
          </button>
        </div>

        {/* User Stats Section */}
        {user && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Total XP</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#8B5CF6' }}>{user.totalXp}</div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Total Satoshi</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#F59E0B' }}>₿ {user.totalSatoshiEarned} sat</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Quizzes Passed</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>{user.passedQuizCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Next Quiz</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#7C3AED' }}>{user.quizQuestionCount} Qs</div>
              </div>
            </div>

            {/* Claim Rewards Button */}
            {unclaimedRewards.length > 0 && (
              <button
                onClick={claimAllRewards}
                disabled={isClaimingRewards}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: isClaimingRewards ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: isClaimingRewards ? 'not-allowed' : 'pointer',
                  boxShadow: isClaimingRewards ? 'none' : '0 6px 20px rgba(245,158,11,0.4)',
                  transition: 'all 0.3s ease',
                  marginBottom: '4px'
                }}
              >
                {isClaimingRewards ? 'Claiming...' : `🎉 Claim ${unclaimedRewards.length} Reward${unclaimedRewards.length > 1 ? 's' : ''}!`}
              </button>
            )}
          </div>
        )}

        <div className="sidebar-content">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => selectConversation(conv)}
            >
              <div className="conversation-title">
                {conv.title || 'New Chat'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-header">
          <div className="chat-header-title">
            {currentConversation ? currentConversation.title || 'New Chat' : 'BitPath AI Tutor'}
          </div>
        </div>

        <div className="chat-messages" ref={chatMessagesRef}>
          {!currentConversation && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6B7280' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '16px', color: '#111827', fontWeight: '800' }}>
                Start Your Journey
              </h2>
              <p style={{ fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
                Ask the AI tutor anything about Bitcoin to get started
              </p>
            </div>
          )}

          {currentConversation && isConversationLoading && (
            <div style={{ maxWidth: '850px', margin: '0 auto', padding: '32px 28px' }}>
              {/* Skeleton message 1 (AI) */}
              <div className="message" style={{ marginBottom: '28px' }}>
                <div className="message-avatar assistant" style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
                  AI
                </div>
                <div className="skeleton-loader" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton-line" style={{ height: '18px', width: '60%', borderRadius: '8px' }}></div>
                  <div className="skeleton-line" style={{ height: '18px', width: '80%', borderRadius: '8px' }}></div>
                  <div className="skeleton-line" style={{ height: '18px', width: '45%', borderRadius: '8px' }}></div>
                </div>
              </div>

              {/* Skeleton message 2 (User) */}
              <div className="message user" style={{ flexDirection: 'row-reverse', marginBottom: '28px' }}>
                <div className="message-avatar user" style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                  U
                </div>
                <div className="skeleton-loader" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton-line" style={{ height: '18px', width: '50%', borderRadius: '8px' }}></div>
                </div>
              </div>

              {/* Skeleton message 3 (AI) */}
              <div className="message" style={{ marginBottom: '28px' }}>
                <div className="message-avatar assistant" style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
                  AI
                </div>
                <div className="skeleton-loader" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton-line" style={{ height: '18px', width: '70%', borderRadius: '8px' }}></div>
                  <div className="skeleton-line" style={{ height: '18px', width: '55%', borderRadius: '8px' }}></div>
                </div>
              </div>
            </div>
          )}

          {currentConversation && !isConversationLoading && !currentQuiz && (
            <>
              {/* Normal Messages */}
              {messages.map(message => (
                <div key={message.id} className={`message ${message.role.toLowerCase()}`}>
                  <div className={`message-avatar ${message.role.toLowerCase()}`}>
                    {message.role === 'USER' ? 'U' : 'AI'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <div className="message-content">
                      {message.role === 'ASSISTANT' && !message.isError ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                    {(message.isError || message.needsRetry) && (
                      <div style={{ display: 'flex', justifyContent: message.role === 'USER' ? 'flex-end' : 'flex-start' }}>
                        <button
                          className="retry-btn"
                          onClick={() => {
                            if (message.isError) {
                              const userMsgs = messages.filter(m => m.role === 'USER');
                              const lastUserMsg = userMsgs[userMsgs.length - 1];
                              if (lastUserMsg) {
                                retryMessage(lastUserMsg);
                              }
                            } else if (message.role === 'USER') {
                              retryMessage(message);
                            }
                          }}
                        >
                          🔄 Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Quiz Readiness Check & Start Button - After all messages, quiz not passed, and ≤3 messages remaining */}
              {!currentConversation?.quizPassed && (10 - (currentConversation?.totalMessages || 0)) <= 3 && (
                <div style={{ maxWidth: '850px', margin: '0 auto 28px', padding: '28px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '18px', border: '1px solid #fbbf24' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#92400e', marginBottom: '12px' }}>
                    📚 Quiz Time!
                  </h3>
                  <p style={{ fontSize: '15px', color: '#78350f', marginBottom: '16px' }}>
                    You need {Math.max(0, 10 - (currentConversation?.totalMessages || 0))} more messages before you can start the quiz!
                  </p>
                  <button
                    onClick={startQuiz}
                    disabled={(currentConversation?.totalMessages || 0) < 10 || isQuizLoading}
                    style={{
                      padding: '12px 24px',
                      background: (currentConversation?.totalMessages || 0) < 10 ? '#9CA3AF' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: (currentConversation?.totalMessages || 0) < 10 ? 'not-allowed' : 'pointer',
                      boxShadow: (currentConversation?.totalMessages || 0) < 10 ? 'none' : '0 4px 14px rgba(139, 92, 246, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isQuizLoading ? 'Starting Quiz...' : 'Start Quiz'}
                  </button>
                </div>
              )}

              {/* Quiz Passed Message - Show if quiz has been passed for this conversation */}
              {currentConversation?.quizPassed && (
                <div style={{ maxWidth: '850px', margin: '0 auto 28px', padding: '28px', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderRadius: '18px', border: '1px solid #34d399' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#065f46', marginBottom: '12px' }}>
                    🎉 Quiz Completed!
                  </h3>
                  <p style={{ fontSize: '15px', color: '#064e3b', marginBottom: '16px' }}>
                    You've successfully passed the quiz for this conversation! Keep learning or start a new conversation for your next quiz challenge!
                  </p>
                  {/* Claim Reward Button in Quiz Completed Modal - Only show if there are unclaimed rewards! */}
                  {currentConversation?.quizPassed && unclaimedRewards.length > 0 && (
                    <button
                      onClick={claimAllRewards}
                      disabled={isClaimingRewards}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        background: isClaimingRewards ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: isClaimingRewards ? 'not-allowed' : 'pointer',
                        boxShadow: isClaimingRewards ? 'none' : '0 6px 20px rgba(245,158,11,0.4)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isClaimingRewards ? 'Claiming...' : `🎉 Claim ${unclaimedRewards.length} Reward${unclaimedRewards.length > 1 ? 's' : ''}!`}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Quiz UI */}
          {currentConversation && currentQuiz && (
            <div style={{ maxWidth: '850px', margin: '0 auto', padding: '32px 28px' }}>
              {(() => {
                // Check if quiz is complete (all questions answered)
                const answeredCount = currentQuiz.filter(q => q.answer && q.answer !== '').length;
                const isComplete = answeredCount === currentQuiz.length;
                const allCorrect = currentQuiz.every(q => q.isCorrect === true);
                const totalCorrect = currentQuiz.filter(q => q.isCorrect === true).length;
                const totalSatoshi = currentQuiz.reduce((sum, q) => sum + (q.satoshiEarned || 0), 0);

                if (!isComplete) {
                  const currentQuestion = currentQuiz[currentQuestionIndex];
                  return (
                    <>
                      {/* Quiz Progress Header */}
                      <div style={{ 
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', 
                        color: 'white', 
                        padding: '20px 24px', 
                        borderRadius: '18px', 
                        marginBottom: '24px',
                        boxShadow: '0 6px 24px rgba(109,40,217,0.35)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                              Quiz in Progress!
                            </h3>
                            <p style={{ fontSize: '14px', opacity: 0.9 }}>
                              Question {currentQuestionIndex + 1} of {currentQuiz.length}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '28px', fontWeight: '800' }}>
                              {totalCorrect} ✔️
                            </div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>
                              {totalSatoshi} satoshi earned
                            </div>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height: '10px', background: 'rgba(255,255,255,0.25)', borderRadius: '10px', overflow: 'hidden', marginTop: '16px' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              background: 'white', 
                              width: `${((currentQuestionIndex + (answeredCount > 0 ? 1 : 0)) / currentQuiz.length) * 100}%`,
                              borderRadius: '10px',
                              transition: 'width 0.4s ease'
                            }} 
                          />
                        </div>
                      </div>

                      {/* Encouraging Message from Previous Answer - only show right after submitting */}
                      {lastAnsweredQuestionIndex !== null && 
                       lastAnsweredQuestionIndex === currentQuestionIndex - 1 && 
                       currentQuiz && 
                       currentQuiz[lastAnsweredQuestionIndex]?.encouragingMessage && (
                        <div style={{ 
                          background: currentQuiz[lastAnsweredQuestionIndex]?.isCorrect 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                          color: 'white', 
                          padding: '24px 28px', 
                          borderRadius: '18px', 
                          marginBottom: '24px',
                          boxShadow: currentQuiz[lastAnsweredQuestionIndex]?.isCorrect 
                            ? '0 6px 24px rgba(16,185,129,0.35)' 
                            : '0 6px 24px rgba(245,158,11,0.35)'
                        }}>
                          <p style={{ fontSize: '16px', fontWeight: '500', lineHeight: 1.7 }}>
                            {currentQuiz[lastAnsweredQuestionIndex].encouragingMessage}
                          </p>
                        </div>
                      )}

                      {/* Current Question */}
                      <div style={{ 
                        background: '#ffffff', 
                        padding: '28px 32px', 
                        borderRadius: '18px', 
                        marginBottom: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        border: '1px solid #f3f4f6'
                      }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                          {currentQuestion?.question}
                        </h4>
                        
                        <textarea
                          value={quizAnswer}
                          onChange={(e) => setQuizAnswer(e.target.value)}
                          placeholder="Type your answer here..."
                          disabled={isQuizLoading}
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '16px 20px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '16px',
                            fontSize: '15px',
                            resize: 'vertical',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            background: 'white'
                          }}
                        />

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={submitQuizAnswer}
                            disabled={!quizAnswer.trim() || isQuizLoading}
                            style={{
                              padding: '14px 32px',
                              background: !quizAnswer.trim() || isQuizLoading ? '#9CA3AF' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '14px',
                              fontSize: '15px',
                              fontWeight: '600',
                              cursor: !quizAnswer.trim() || isQuizLoading ? 'not-allowed' : 'pointer',
                              boxShadow: !quizAnswer.trim() || isQuizLoading ? 'none' : '0 6px 20px rgba(139, 92, 246, 0.4)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {isQuizLoading ? 'Submitting...' : 'Submit Answer'}
                          </button>
                        </div>
                      </div>
                    </>
                  );
                } else {
                  return (
                    // Quiz Complete
                    <div style={{ 
                      background: allCorrect ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                      color: 'white', 
                      padding: '40px 36px', 
                      borderRadius: '22px', 
                      marginBottom: '24px',
                      textAlign: 'center',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.25)'
                    }}>
                      <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>
                        {allCorrect ? '🎉 Quiz Passed!' : '📚 Quiz Complete'}
                      </h2>
                      <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '28px' }}>
                        {allCorrect 
                          ? 'Excellent job! Your next quiz will have more questions!' 
                          : 'Keep practicing! Try again to master the material!'}
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '48px', 
                        flexWrap: 'wrap'
                      }}>
                        <div>
                          <div style={{ fontSize: '40px', fontWeight: '800' }}>{totalCorrect}/{currentQuiz.length}</div>
                          <div style={{ fontSize: '14px', opacity: 0.9 }}>Correct Answers</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '40px', fontWeight: '800' }}>{totalSatoshi}</div>
                          <div style={{ fontSize: '14px', opacity: 0.9 }}>Satoshi Earned</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        {/* Show claim button when quiz is passed AND there are unclaimed rewards */}
                        {allCorrect && unclaimedRewards.length > 0 && (
                          <button
                            onClick={claimAllRewards}
                            disabled={isClaimingRewards}
                            style={{
                              padding: '16px 40px',
                              background: isClaimingRewards ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '16px',
                              fontSize: '16px',
                              fontWeight: '700',
                              cursor: isClaimingRewards ? 'not-allowed' : 'pointer',
                              boxShadow: isClaimingRewards ? 'none' : '0 6px 20px rgba(245,158,11,0.4)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {isClaimingRewards ? 'Claiming...' : `🎉 Claim ${unclaimedRewards.length} Reward${unclaimedRewards.length > 1 ? 's' : ''}!`}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setCurrentQuiz(null);
                            setCurrentQuestionIndex(0);
                          }}
                          style={{
                            padding: '16px 40px',
                            background: 'white',
                            color: allCorrect ? '#059669' : '#dc2626',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Return to Chat
                        </button>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              className="input-field"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
