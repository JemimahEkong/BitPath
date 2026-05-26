'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Trophy, 
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface Message {
  id: number;
  type: 'bot' | 'user';
  content: string;
  isTyping?: boolean;
}

const mockResponses: Record<string, string> = {
  'nostr': "Great question! Nostr (Notes and Other Stuff Transmitted by Relays) is a decentralized protocol for social media and communication. Unlike traditional platforms, your identity is controlled by cryptographic keys YOU own - no company can ban or censor you. It's the foundation for a truly free internet! 🔐",
  'sats': "Sats (short for Satoshis) are the smallest unit of Bitcoin - named after Bitcoin's creator, Satoshi Nakamoto. 1 Bitcoin = 100,000,000 sats. Think of them like cents to dollars, but way smaller! On BitPath, you earn sats for completing lessons and quizzes. Stack sats, gain knowledge! ⚡",
  'private keys': "A private key is like the master password to your Bitcoin wallet - it's a long string of characters that proves ownership of your funds. NEVER share it with anyone! If someone has your private key, they control your Bitcoin. That's why we say: \"Not your keys, not your coins!\" 🔑",
  'lightning': "The Lightning Network is a \"Layer 2\" solution built on top of Bitcoin. It enables instant, nearly-free transactions by creating payment channels between users. Instead of recording every transaction on the blockchain, Lightning batches them - making micropayments (like earning sats on BitPath) possible! ⚡",
  'bitcoin': "Bitcoin is the world's first decentralized digital currency, created in 2009 by the pseudonymous Satoshi Nakamoto. It operates on a peer-to-peer network with no central authority. Bitcoin's fixed supply of 21 million coins makes it a deflationary asset - often called \"digital gold.\" 🌟",
  'wallet': "A Bitcoin wallet is software or hardware that stores your private keys and lets you send/receive Bitcoin. Types include: hot wallets (connected to internet, convenient), cold wallets (offline, most secure), and custodial wallets (third party holds keys). For best security, use a hardware wallet for large amounts! 💼",
};

export default function ChatShowcase() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: 'bot', content: "Welcome to Bitcoin 101! 👋 Today we're learning about the Lightning Network - Bitcoin's solution for fast, cheap payments." },
    { id: 2, type: 'bot', content: "The Lightning Network is a \"Layer 2\" payment protocol built on top of Bitcoin. It enables instant transactions with minimal fees." },
    { id: 3, type: 'user', content: "How does it work exactly?" },
    { id: 4, type: 'bot', content: "Great question! Lightning creates payment channels between users. Instead of recording every transaction on the main blockchain, it batches multiple transactions together for final settlement. This makes it perfect for small, frequent payments - like earning sats while learning! ⚡" },
  ]);

  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [totalSats, setTotalSats] = useState(0);
  const [showRewardBadge, setShowRewardBadge] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuizAnswer = (isCorrect: boolean) => {
    setQuizAnswered(true);
    setQuizCorrect(isCorrect);
    
    if (isCorrect) {
      setTotalSats(prev => prev + 100);
      setShowRewardBadge(true);
      setInputEnabled(true);
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: "🎉 Correct! Lightning batches transactions for settlement, not recording every single one on-chain. You've earned +100 Sats! Now you can ask me anything about Nostr, Sats, or Private Keys!"
      }]);

      setTimeout(() => setShowRewardBadge(false), 3000);
    } else {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: "Not quite! The Lightning Network actually batches transactions for later settlement on the main blockchain. This is what makes it so fast and cheap. Try again!"
      }]);
      setTimeout(() => {
        setQuizAnswered(false);
        setQuizCorrect(null);
      }, 2000);
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim() || !inputEnabled) return;

    const userMessage = userInput.trim();
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      type: 'user',
      content: userMessage
    }]);
    setUserInput('');
    setIsTyping(true);

    // Find matching response
    setTimeout(() => {
      let response = "That's an interesting topic! As you progress through BitPath, you'll learn more about this. For now, try asking about Nostr, Sats, Private Keys, Lightning, Bitcoin, or Wallets!";
      
      const lowerInput = userMessage.toLowerCase();
      for (const [key, value] of Object.entries(mockResponses)) {
        if (lowerInput.includes(key)) {
          response = value;
          setTotalSats(prev => prev + 50);
          setShowRewardBadge(true);
          setTimeout(() => setShowRewardBadge(false), 2000);
          break;
        }
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: response
      }]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className={isDark ? 'text-white' : 'text-neutral-900'}>Experience </span>
            <span style={{ background: 'linear-gradient(to right, #A65D00, #703F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Interactive Learning
            </span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
            Try our AI tutor below - answer the quiz correctly to unlock the chat!
          </p>
        </div>

        {/* Browser Frame */}
        <div className="relative">
          {/* Floating Reward Badge */}
          <div className={`absolute -top-4 -right-4 z-20 transition-all duration-500 ${showRewardBadge ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg" style={{ background: 'linear-gradient(to right, #8C4F00, #703F00)' }}>
              <Trophy className="w-5 h-5 text-black" />
              <span className="font-bold text-black">REWARD EARNED: +{quizCorrect ? '100' : '50'} Sats</span>
            </div>
          </div>

          {/* Browser Window */}
          <div className={`rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-white border-neutral-200'}`}>
            {/* Browser Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'bg-[#0d0d0d] border-[#262626]' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                <Bot className="w-4 h-4" style={{ color: '#8C4F00' }} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>AI Tutor: Bitcoin 101</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-neutral-400'}`}>Total:</span>
                <span className="font-mono font-bold" style={{ color: '#A65D00' }}>{totalSats} sats</span>
              </div>
            </div>

            {/* Chat Area */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div 
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'bot' ? '' : isDark ? 'bg-[#262626]' : 'bg-neutral-200'
                    }`}
                    style={message.type === 'bot' ? { backgroundColor: 'rgba(140, 79, 0, 0.2)' } : undefined}
                  >
                    {message.type === 'bot' ? (
                      <Bot className="w-5 h-5" style={{ color: '#8C4F00' }} />
                    ) : (
                      <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`} />
                    )}
                  </div>
                  <div 
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      message.type === 'bot' 
                        ? `${isDark ? 'bg-[#262626] text-gray-200' : 'bg-neutral-200 text-neutral-800'} rounded-tl-none` 
                        : 'text-black rounded-tr-none'
                    }`}
                    style={message.type === 'user' ? { backgroundColor: '#8C4F00' } : undefined}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(140, 79, 0, 0.2)' }}>
                    <Bot className="w-5 h-5" style={{ color: '#8C4F00' }} />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl rounded-tl-none ${isDark ? 'bg-[#262626]' : 'bg-neutral-200'}`}>
                    <div className="flex gap-1">
                      <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-gray-400' : 'bg-neutral-400'}`} style={{ animationDelay: '0ms' }} />
                      <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-gray-400' : 'bg-neutral-400'}`} style={{ animationDelay: '150ms' }} />
                      <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-gray-400' : 'bg-neutral-400'}`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Block */}
              {!quizAnswered && (
                <div className={`rounded-xl p-5 mt-4 border ${isDark ? 'bg-gradient-to-br from-[#1a1a1a] to-[#262626]' : 'bg-gradient-to-br from-white to-neutral-100'}`} style={{ borderColor: 'rgba(140, 79, 0, 0.3)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5" style={{ color: '#8C4F00' }} />
                    <span className="font-bold" style={{ color: '#A65D00' }}>Pop Quiz! ⚡</span>
                  </div>
                  <p className={`mb-4 ${isDark ? 'text-gray-200' : 'text-neutral-800'}`}>
                    Does the Lightning Network record every transaction on the main Bitcoin blockchain?
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleQuizAnswer(false)}
                      disabled={quizAnswered}
                      className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg transition-all text-left group ${
                        isDark 
                          ? 'bg-[#0d0d0d] hover:bg-[#262626] border-[#404040]' 
                          : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-300'
                      }`}
                      style={{ ['--hover-border-color' as string]: 'rgba(140, 79, 0, 0.5)' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.5)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#404040' : '#d4d4d4'}
                    >
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${isDark ? 'bg-[#262626] text-gray-400' : 'bg-neutral-200 text-neutral-500'}`} style={{ ['--hover-color' as string]: '#A65D00' }}>A</span>
                      <span className={isDark ? 'text-gray-300' : 'text-neutral-700'}>Yes, every single one.</span>
                    </button>
                    <button
                      onClick={() => handleQuizAnswer(true)}
                      disabled={quizAnswered}
                      className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg transition-all text-left group ${
                        isDark 
                          ? 'bg-[#0d0d0d] hover:bg-[#262626] border-[#404040]' 
                          : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-300'
                      }`}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(140, 79, 0, 0.5)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#404040' : '#d4d4d4'}
                    >
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${isDark ? 'bg-[#262626] text-gray-400' : 'bg-neutral-200 text-neutral-500'}`}>B</span>
                      <span className={isDark ? 'text-gray-300' : 'text-neutral-700'}>No, it batches them for settlement.</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz Result */}
              {quizAnswered && quizCorrect !== null && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                  quizCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                }`}>
                  {quizCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">Correct! +100 Sats earned</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-400">Not quite - try again!</span>
                    </>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`px-4 py-3 border-t ${isDark ? 'bg-[#0d0d0d] border-[#262626]' : 'bg-neutral-50 border-neutral-200'}`}>
              <div 
                className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
                  inputEnabled 
                    ? isDark 
                      ? 'bg-[#1a1a1a] border-[#404040]' 
                      : 'bg-white border-neutral-300'
                    : isDark 
                      ? 'bg-[#1a1a1a]/50 border-[#262626]' 
                      : 'bg-neutral-100/50 border-neutral-200'
                }`}
                style={inputEnabled ? { ['--focus-border-color' as string]: 'rgba(140, 79, 0, 0.5)' } : undefined}
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!inputEnabled}
                  placeholder={inputEnabled ? "Ask about Nostr, Sats, Private Keys..." : "Complete the quiz to unlock chat..."}
                  className={`flex-1 bg-transparent outline-none text-sm disabled:cursor-not-allowed ${isDark ? 'text-white placeholder-gray-500' : 'text-neutral-900 placeholder-neutral-400'}`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputEnabled || !userInput.trim()}
                  className={`p-2 rounded-lg transition-all ${
                    inputEnabled && userInput.trim()
                      ? 'text-black hover:opacity-90'
                      : isDark 
                        ? 'bg-[#262626] text-gray-500 cursor-not-allowed' 
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  }`}
                  style={inputEnabled && userInput.trim() ? { backgroundColor: '#8C4F00' } : undefined}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {inputEnabled && (
                <p className={`text-xs mt-2 text-center ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>
                  Try asking: &quot;What is Nostr?&quot; • &quot;Tell me about sats&quot; • &quot;What are private keys?&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
