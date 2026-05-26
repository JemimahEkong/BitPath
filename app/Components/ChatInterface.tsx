'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';

// Types for chat messages - ready for API integration
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

// Chat Input Component
export function ChatInput({ onSendMessage, isLoading = false, placeholder = "Ask me anything about Bitcoin..." }: ChatInputProps) {
  const { isDark } = useTheme();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`flex items-end gap-3 p-3 rounded-2xl border transition-all duration-200 ${
          isDark
            ? 'bg-neutral-800/50 border-neutral-700 focus-within:border-[#8C4F00]'
            : 'bg-white border-neutral-200 focus-within:border-[#8C4F00] shadow-lg shadow-neutral-200/50'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className={`flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed ${
            isDark
              ? 'text-neutral-100 placeholder-neutral-500'
              : 'text-neutral-900 placeholder-neutral-400'
          } disabled:opacity-50`}
          style={{ maxHeight: '150px' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            input.trim() && !isLoading
              ? 'bg-[#8C4F00] text-white hover:bg-[#A65D00]'
              : isDark
                ? 'bg-neutral-700 text-neutral-500'
                : 'bg-neutral-100 text-neutral-400'
          } disabled:cursor-not-allowed`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

// Chat Messages Component
export function ChatMessages({ messages, isLoading = false }: ChatMessagesProps) {
  const { isDark } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message when content changes
  useEffect(() => {
    const list = listRef.current;
    if (!list || messages.length === 0) return;

    const isNearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 200;
    if (isNearBottom) {
      requestAnimationFrame(() => {
        list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [messages.length, isLoading]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      ref={listRef}
      className="max-h-[min(60vh,500px)] overflow-y-auto px-4 py-6 space-y-4"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(140, 79, 0, 0.15)' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#8C4F00' }} />
            </div>
          )}
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-[#8C4F00] text-white'
                : isDark
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'bg-neutral-100 text-neutral-900'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          {message.role === 'user' && (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-neutral-700' : 'bg-neutral-200'
              }`}
            >
              <User className={`w-4 h-4 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`} />
            </div>
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(140, 79, 0, 0.15)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#8C4F00' }} />
          </div>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isDark ? 'bg-neutral-800' : 'bg-neutral-100'
            }`}
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#8C4F00] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#8C4F00] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#8C4F00] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Suggested Prompts Component
interface SuggestedPromptsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export function SuggestedPrompts({ prompts, onSelectPrompt }: SuggestedPromptsProps) {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelectPrompt(prompt)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
            isDark
              ? 'bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:border-[#8C4F00] hover:text-[#8C4F00]'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-[#8C4F00] hover:text-[#8C4F00]'
          }`}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

// Welcome Screen Component
interface WelcomeScreenProps {
  userName?: string;
  onSelectPrompt: (prompt: string) => void;
}

export function WelcomeScreen({ userName, onSelectPrompt }: WelcomeScreenProps) {
  const { isDark } = useTheme();

  const suggestedPrompts = [
    "What is Bitcoin?",
    "How do I set up a wallet?",
    "Explain blockchain simply",
    "What are satoshis?",
    "How do transactions work?",
    "What is the Lightning Network?",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      {/* Welcome Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(140, 79, 0, 0.15)' }}
      >
        <Sparkles className="w-8 h-8" style={{ color: '#8C4F00' }} />
      </div>

      {/* Welcome Text */}
      <h1 className={`text-2xl sm:text-3xl font-bold text-center mb-3 ${
        isDark ? 'text-white' : 'text-neutral-900'
      }`}>
        Hi{userName ? `, ${userName.split(' ')[0]}` : ''}! I&apos;m your AI Tutor
      </h1>
      <p className={`text-center max-w-md mb-8 ${
        isDark ? 'text-neutral-400' : 'text-neutral-500'
      }`}>
        Ask me anything about Bitcoin, blockchain, or cryptocurrency. I&apos;m here to help you learn and earn rewards!
      </p>

      {/* Suggested Prompts */}
      <div className="w-full max-w-2xl">
        <p className={`text-sm font-medium text-center mb-4 ${
          isDark ? 'text-neutral-500' : 'text-neutral-400'
        }`}>
          Try asking:
        </p>
        <SuggestedPrompts prompts={suggestedPrompts} onSelectPrompt={onSelectPrompt} />
      </div>
    </div>
  );
}
