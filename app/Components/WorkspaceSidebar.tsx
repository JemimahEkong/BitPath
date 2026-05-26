'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Wallet,
  Gift,
  ArrowDownToLine,
  History,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Clock
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import ChatHistoryPanel from './ChatHistoryPanel';

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

// Placeholder chat history
const chatHistory: ChatHistoryItem[] = [
  { id: '1', title: 'What is Bitcoin?', timestamp: '2 hours ago' },
  { id: '2', title: 'How do wallets work?', timestamp: 'Yesterday' },
  { id: '3', title: 'Explain blockchain', timestamp: '3 days ago' },
];

interface WorkspaceSidebarProps {
  onNewChat: () => void;
}

interface SidebarContentProps {
  isDark: boolean;
  onNewChat: () => void;
  onCloseMobile: () => void;
  isWalletOpen: boolean;
  onToggleWallet: () => void;
  user: { name?: string | null; email?: string | null; image?: string | null } | undefined;
  handleSignOut: () => Promise<void>;
  onOpenHistory: () => void;
  chatHistory: ChatHistoryItem[];
}

function SidebarContent({
  isDark, onNewChat, onCloseMobile, isWalletOpen, onToggleWallet, user, handleSignOut, onOpenHistory, chatHistory
}: SidebarContentProps) {
  const { toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-col h-full">
      {/* Logo & New Chat */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <span
              className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Bit<span style={{ color: '#8C4F00' }}>Path</span>
            </span>
          </Link>
          <button
            onClick={toggleTheme}
            className={`relative rounded-full p-1 cursor-pointer flex items-center justify-between transition-all duration-200 ${
              isDark
                ? 'bg-neutral-800 border border-neutral-700 hover:border-neutral-600'
                : 'bg-neutral-100 border border-neutral-200 hover:border-neutral-300'
            }`}
            style={{ width: '4.5rem', height: '2.25rem' }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                !isDark
                  ? 'text-white shadow-sm'
                  : isDark ? 'text-neutral-500' : 'text-neutral-400'
              }`}
              style={!isDark ? { backgroundColor: '#8C4F00' } : {}}
            >
              <Sun className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                isDark
                  ? 'bg-neutral-700 shadow-sm'
                  : 'text-neutral-400'
              }`}
              style={isDark ? { color: '#8C4F00' } : {}}
            >
              <Moon className="w-4 h-4" strokeWidth={2.5} />
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200"
          style={{ backgroundColor: '#8C4F00', color: 'white' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A65D00')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8C4F00')}
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>

        <button
          onClick={onOpenHistory}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
            isDark
              ? 'border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300'
              : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
          }`}
        >
          <Clock className="w-4 h-4" style={{ color: '#8C4F00' }} />
          <span className="text-sm font-medium">Chat History</span>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-500'}`}>
            {chatHistory.length}
          </span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Wallet & Rewards Section */}
      <div className={`border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <button
          onClick={onToggleWallet}
          className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
            isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5" style={{ color: '#8C4F00' }} />
            <span className={`font-medium ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
              Wallet & Rewards
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isWalletOpen ? 'rotate-180' : ''} ${
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          />
        </button>

        {isWalletOpen && (
          <div className="px-4 pb-3 space-y-1">
            <button
              onClick={() => { router.push('/workspace'); onCloseMobile(); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/workspace')
                  ? isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-900'
                  : isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span className="text-sm">Rewards</span>
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(140, 79, 0, 0.15)', color: '#8C4F00' }}
              >
                2,450 sats
              </span>
            </button>
            <button
              onClick={() => { router.push('/workspace/transactions'); onCloseMobile(); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/workspace/transactions')
                  ? isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-900'
                  : isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-sm">Transactions</span>
            </button>
            <button
              onClick={() => { router.push('/workspace/withdraw'); onCloseMobile(); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/workspace/withdraw')
                  ? isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-900'
                  : isDark ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="text-sm">Withdraw BTC</span>
            </button>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className={`border-t p-4 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <div className="flex items-center gap-3">
          {user?.image ? (
            <Image src={user.image} alt={user.name || 'Profile'} width={40} height={40} className="rounded-full" />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              isDark ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-600'
            }`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
              {user?.name || 'User'}
            </p>
            <p className={`text-xs truncate ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {user?.email || ''}
            </p>
          </div>
          <button onClick={handleSignOut} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'}`} title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceSidebar({ onNewChat }: WorkspaceSidebarProps) {
  const { data: session } = useSession();
  const { isDark } = useTheme();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const user = session?.user;

  const chatHistory: ChatHistoryItem[] = [
    { id: '1', title: 'What is Bitcoin?', timestamp: '2 hours ago' },
    { id: '2', title: 'How do wallets work?', timestamp: 'Yesterday' },
    { id: '3', title: 'Explain blockchain', timestamp: '3 days ago' },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleSelectChat = (id: string) => {
    // Placeholder - will connect to chat API later
  };

  return (
    <>
      {/* Chat History Panel */}
      <ChatHistoryPanel
        isOpen={isChatHistoryOpen}
        onClose={() => setIsChatHistoryOpen(false)}
        onSelectChat={handleSelectChat}
        chats={chatHistory}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl border transition-colors ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
            : 'bg-white border-neutral-200 text-neutral-600'
        }`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-neutral-900' : 'bg-white'}`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent
          isDark={isDark}
          onNewChat={onNewChat}
          onCloseMobile={() => setIsMobileOpen(false)}
          isWalletOpen={isWalletOpen}
          onToggleWallet={() => setIsWalletOpen((v) => !v)}
          user={user}
          handleSignOut={handleSignOut}
          onOpenHistory={() => setIsChatHistoryOpen(true)}
          chatHistory={chatHistory}
        />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 w-72 border-r ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <SidebarContent
          isDark={isDark}
          onNewChat={onNewChat}
          onCloseMobile={() => {}}
          isWalletOpen={isWalletOpen}
          onToggleWallet={() => setIsWalletOpen((v) => !v)}
          user={user}
          handleSignOut={handleSignOut}
          onOpenHistory={() => setIsChatHistoryOpen(true)}
          chatHistory={chatHistory}
        />
      </aside>
    </>
  );
}
