export interface Conversation {
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

export interface Message {
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

export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer?: string;
  answer?: string;
  isCorrect?: boolean;
  xpEarned?: number;
  satoshiEarned?: number;
  encouragingMessage?: string;
}

export interface User {
  id: string;
  email: string;
  totalXp: number;
  totalSatoshiEarned: number;
  quizQuestionCount: number;
  passedQuizCount: number;
}

export interface QuizAttempt {
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
