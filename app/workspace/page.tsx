'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../Components/ThemeProvider';
import WorkspaceSidebar from '../Components/WorkspaceSidebar';
import { ChatInput, ChatMessages, WelcomeScreen, ChatMessage } from '../Components/ChatInterface';
import { CourseGrid, Course } from '../Components/CourseCard';

// ---------------------------------------------------------------------------
// Recommended learning paths
// ---------------------------------------------------------------------------
// Modular mock data; shape matches the `Course` type so it's a drop-in for a
// future API response (e.g. `GET /api/courses/recommended`).
const recommendedCourses: Course[] = [
  {
    id: 'bitcoin-basics',
    title: 'Bitcoin Basics',
    description: 'Learn the fundamentals of Bitcoin and cryptocurrency.',
    thumbnail: 'bitcoin',
    xpReward: 500,
    lessonCount: 12,
    difficulty: 'Beginner',
    progress: 0,
  },
  {
    id: 'wallet-security',
    title: 'Wallet Security',
    description: 'Master best practices for keeping your Bitcoin safe.',
    thumbnail: 'wallet',
    xpReward: 350,
    lessonCount: 8,
    difficulty: 'Beginner',
    progress: 0,
  },
  {
    id: 'blockchain-101',
    title: 'Blockchain 101',
    description: 'Understand how blockchain technology works.',
    thumbnail: 'blockchain',
    xpReward: 450,
    lessonCount: 10,
    difficulty: 'Intermediate',
    progress: 0,
  },
  {
    id: 'bitcoin-investing',
    title: 'Bitcoin Investing',
    description: 'Learn smart strategies for Bitcoin investment.',
    thumbnail: 'investing',
    xpReward: 600,
    lessonCount: 15,
    difficulty: 'Intermediate',
    progress: 0,
  },
  {
    id: 'lightning-network',
    title: 'Lightning Network',
    description: 'Explore fast Bitcoin transactions with Lightning.',
    thumbnail: 'lightning',
    xpReward: 550,
    lessonCount: 9,
    difficulty: 'Advanced',
    progress: 20,
  },
];

export default function WorkspacePage() {
  const { data: session } = useSession();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userName = session?.user?.name || undefined;

  // Handle new chat - clear messages
  const handleNewChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Handle sending a message
  // This is frontend-only - ready for API integration
  const handleSendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI thinking (placeholder - replace with actual API call)
    setIsLoading(true);

    // TODO: Replace this with actual API call
    // Example API integration:
    // const response = await fetch('/api/chat', {
    //   method: 'POST',
    //   body: JSON.stringify({ message: content, history: messages }),
    // });
    // const data = await response.json();

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm your AI tutor! I received your question: "${content}"\n\nThis is a placeholder response. The AI chat feature will be connected to a backend API soon. For now, you can explore the courses below or try different questions!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Handle selecting a suggested prompt
  const handleSelectPrompt = useCallback((prompt: string) => {
    handleSendMessage(prompt);
  }, [handleSendMessage]);

  // TODO: wire this to a router push to a course page once routes exist.
  const handleCourseClick = useCallback(() => {
    // no-op placeholder until course detail routes land
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
      {/* Sidebar */}
      <WorkspaceSidebar onNewChat={handleNewChat} />

      {/* Main Content */}
      <main className="lg:pl-72 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Chat Section */}
          <div className="mb-16">
            {messages.length === 0 ? (
              <WelcomeScreen userName={userName} onSelectPrompt={handleSelectPrompt} />
            ) : (
              <div
                className={`rounded-2xl border mb-4 ${
                  isDark ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white border-neutral-200'
                }`}
              >
                <ChatMessages messages={messages} isLoading={isLoading} />
              </div>
            )}

            {/* Chat Input - Always visible */}
            <div className="max-w-3xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>

          {/* Recommended Learning Paths */}
          <CourseGrid
            title="Recommended Learning Paths"
            subtitle="Choose any path to start"
            courses={recommendedCourses}
            onCourseClick={handleCourseClick}
          />
        </div>
      </main>
    </div>
  );
}
