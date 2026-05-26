'use client';

import { MessageSquare, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (id: string) => void;
  chats: ChatHistoryItem[];
}

export default function ChatHistoryPanel({ isOpen, onClose, onSelectChat, chats }: ChatHistoryPanelProps) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 lg:pt-0 lg:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-md mx-4 rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Chat History
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-1">
          {chats.length === 0 ? (
            <p className={`text-center text-sm py-12 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              No chat history yet
            </p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => { onSelectChat(chat.id); onClose(); }}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                  isDark
                    ? 'hover:bg-neutral-800 text-neutral-300'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
              >
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8C4F00' }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                    {chat.title}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {chat.timestamp}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
