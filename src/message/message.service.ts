/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import { CacheService } from 'src/cache.service';

import {
  Message,
  MessageRole,
  MessageType,
  QuizAttempt,
} from 'generated/prisma/client';
import { AiService } from 'src/ai/ai.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { QueueService } from 'src/untils/bullProcessor/queue.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly conversationsService: ConversationsService,
    private readonly queueService: QueueService,
    private readonly cacheService: CacheService,
  ) {}

  async createMessage(
    conversationId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const { content, role, type } = createMessageDto;

    // 1. Save USER message to DB
    const newMessage = await this.prisma.message.create({
      data: {
        conversationId,
        content,
        role,
        type,
      },
    });

    // Update conversation total messages using ConversationsService
    await this.conversationsService.incrementMessageCount(conversationId);

    // 2. Load recent messages (from DB and cache for AI context)
    let recentMessages =
      await this.conversationsService.getRecentMessagesFromCache(
        conversationId,
      );

    if (recentMessages.length === 0) {
      const dbMessages = await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      recentMessages = dbMessages
        .reverse()
        .map((msg) => ({ role: msg.role, content: msg.content }));
    }

    const messagesForAi = [
      ...recentMessages,
      { role: newMessage.role, content: newMessage.content },
    ];
    await this.conversationsService.setRecentMessagesToCache(
      conversationId,
      messagesForAi,
    );

    return newMessage;
  }

  async generateAiResponseStream(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.cacheService.setStreamingState(conversationId, true);
      await this.cacheService.setTypingState(conversationId, true);

      const recentMessages =
        await this.conversationsService.getRecentMessagesFromCache(
          conversationId,
        );
      const messagesForAiPrompt = recentMessages.map((msg) => ({
        role: msg.role === MessageRole.USER ? 'user' : 'assistant',
        content: msg.content,
      }));

      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        select: {
          currentLessonId: true,
          currentLesson: { select: { content: true } },
        },
      });

      if (conversation?.currentLesson?.content) {
        messagesForAiPrompt.unshift({
          role: 'system',
          content: `You are an AI tutor. Your current lesson context is: ${conversation.currentLesson.content}`,
        });
      }

      this.conversationsService.emitConversationEvent(conversationId, {
        data: { type: 'typing', isTyping: true },
      });

      const stream =
        await this.aiService.generateChatCompletionStream(messagesForAiPrompt);

      let assistantResponseContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        assistantResponseContent += content;

        this.conversationsService.emitConversationEvent(conversationId, {
          data: { type: 'chunk', content: content },
        });
      }

      // AI is done typing!
      this.conversationsService.emitConversationEvent(conversationId, {
        data: { type: 'typing', isTyping: false },
      });

      const assistantMessage = await this.prisma.message.create({
        data: {
          conversationId,
          content: assistantResponseContent,
          role: MessageRole.ASSISTANT,
          type: MessageType.TEXT,
          isStreaming: false,
          isComplete: true,
        },
      });

      await this.conversationsService.incrementMessageCount(conversationId);

      const updatedMessagesForAi = [
        ...messagesForAiPrompt,
        { role: assistantMessage.role, content: assistantMessage.content },
      ];
      await this.conversationsService.setRecentMessagesToCache(
        conversationId,
        updatedMessagesForAi,
      );

      this.conversationsService.emitConversationEvent(conversationId, {
        data: { type: 'complete', message: assistantMessage },
      });

      // Check if this is the first message pair - generate a title
      const fullConversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });
      
      if (
        fullConversation &&
        fullConversation.messages.length <= 2 &&
        (!fullConversation.title || fullConversation.title === 'New Chat')
      ) {
        const firstUserMessage = fullConversation.messages.find(
          (m) => m.role === MessageRole.USER,
        );
        if (firstUserMessage) {
          const title = await this.aiService.generateConversationTitle(
            firstUserMessage.content,
          );
          await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { title },
          });
        }
      }

      this.aiService
        .generateSuggestions(updatedMessagesForAi)
        .then((suggestions) => {
          if (suggestions.length > 0) {
            this.conversationsService.emitConversationEvent(conversationId, {
              data: { type: 'suggestions', suggestions: suggestions },
            });
          }
        })
        .catch((error) =>
          this.logger.error('Error generating suggestions:', error),
        );

      const xpAmount = 5;
      await this.queueService.addXpJob({
        userId,
        xpAmount,
        reason: 'AI interaction',
      });
      await this.queueService.addRewardJob({
        userId,
        conversationId,
        xpEarned: xpAmount,
        btcReward: 0,
        reason: 'AI interaction',
      });
    } catch (error) {
      this.logger.error('Error generating AI response:', error);
      this.conversationsService.emitConversationEvent(conversationId, {
        data: {
          type: 'error',
          message: 'Failed to generate response. Please try again.',
        },
      });
    } finally {
      await this.cacheService.setStreamingState(conversationId, false);
      await this.cacheService.setTypingState(conversationId, false);
      this.conversationsService.emitConversationEvent(conversationId, {
        data: { type: 'typing', isTyping: false },
      });
    }
  }

  async getMessages(
    conversationId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit,
    });
  }

  async generateQuizQuestion(
    conversationId: string,
    topic: string,
    difficulty: string,
    conversationHistory?: any[],
    previousQuestions?: string[],
  ): Promise<QuizAttempt> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        currentLessonId: true,
        currentLesson: { select: { content: true } },
      },
    });

    // Get previous questions if not provided
    if (!previousQuestions) {
      const previousQuizAttempts = await this.prisma.quizAttempt.findMany({
        where: { conversationId },
        select: { question: true }
      });
      previousQuestions = previousQuizAttempts.map(qa => qa.question);
    }

    // Get conversation history if not provided
    if (!conversationHistory) {
      conversationHistory = await this.conversationsService.getRecentMessagesFromCache(conversationId);
      if (!conversationHistory || conversationHistory.length === 0) {
        const dbMessages = await this.prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          take: 30,
        });
        conversationHistory = dbMessages
          .reverse()
          .map((msg) => ({ role: msg.role, content: msg.content }));
      }
    }

    const { question, correctAnswer } =
      await this.aiService.generateQuizQuestion(
        topic,
        difficulty,
        conversation?.currentLesson?.content,
        conversationHistory,
        previousQuestions,
      );

    const quizAttempt = await this.prisma.quizAttempt.create({
      data: {
        conversationId,
        question,
        answer: '',
        correctAnswer,
        xpEarned: 0,
      },
    });

    await this.cacheService.setQuizState(conversationId, quizAttempt);

    this.conversationsService.emitConversationEvent(conversationId, {
      data: { type: 'quiz_question', quiz: quizAttempt },
    });

    return quizAttempt;
  }

  async generateFullQuiz(
    conversationId: string,
    userId: string,
    topic: string = 'Bitcoin',
    difficulty: string = 'medium',
  ): Promise<QuizAttempt[]> {
    try {
      // First check if quiz is ready (>=10 messages)
      const isReady = await this.conversationsService.isQuizReady(conversationId);
      if (!isReady) {
        throw new Error(
          'Not enough messages in conversation to take quiz. Need at least 10 messages.',
        );
      }

      // Check if quiz already passed for this conversation
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      if (conversation.quizPassed) {
        throw new Error('Quiz already passed for this conversation');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get ALL previously asked questions for this conversation to avoid duplicates!
      const previousQuizAttempts = await this.prisma.quizAttempt.findMany({
        where: { conversationId },
        select: { question: true }
      });
      
      const previousQuestions = previousQuizAttempts.map(qa => qa.question);

      // Get conversation history for quiz generation
      let conversationHistory = await this.conversationsService.getRecentMessagesFromCache(conversationId);
      if (!conversationHistory || conversationHistory.length === 0) {
        const dbMessages = await this.prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          take: 30,
        });
        conversationHistory = dbMessages
          .reverse()
          .map((msg) => ({ role: msg.role, content: msg.content }));
      }

      // Ensure conversationHistory is at least an empty array
      conversationHistory = conversationHistory || [];
      
      const numQuestions = user.quizQuestionCount;

      // Chunk conversation history for varied questions - each question uses a different chunk!
      const historyChunks: Array<Array<{ role: string; content: string }>> = [];
      const chunkSize = Math.max(1, Math.floor(conversationHistory.length / Math.max(2, Math.min(numQuestions, 5))));
      
      for (let i = 0; i < conversationHistory.length; i += chunkSize) {
        historyChunks.push(conversationHistory.slice(i, i + chunkSize));
      }

      if (historyChunks.length === 0 && conversationHistory.length > 0) {
        historyChunks.push(conversationHistory);
      }

      // Generate all quiz questions in parallel, rotating through chunks!
      const quizQuestionPromises: Promise<QuizAttempt>[] = [];
      for (let i = 0; i < numQuestions; i++) {
        const chunkIndex = i % historyChunks.length;
        const historyForQuestion = historyChunks[chunkIndex] || [];
        
        quizQuestionPromises.push(
          this.generateQuizQuestion(
            conversationId,
            topic,
            difficulty,
            historyForQuestion,
            previousQuestions,
          )
        );
      }

      const quizQuestions = await Promise.all(quizQuestionPromises);
      return quizQuestions;
    } catch (error) {
      this.logger.error('Error generating full quiz:', error);
      throw error;
    }
  }

  async submitQuizAnswer(
    conversationId: string,
    quizAttemptId: string,
    answer: string,
    userId: string,
  ): Promise<any> {
    const quizAttempt = await this.prisma.quizAttempt.findUnique({
      where: { id: quizAttemptId },
    });

    if (!quizAttempt) {
      throw new Error('Quiz attempt not found');
    }

    // Use AI to intelligently check if the answer is correct
    const { isCorrect, encouragingMessage } = await this.aiService.checkAnswerCorrectness(
      quizAttempt.question,
      answer,
      quizAttempt.correctAnswer || '',
    );
    
    const xpEarned = isCorrect ? 10 : 0;
    const satoshiEarned = isCorrect ? 5 : 0; // 5 satoshi per correct answer

    const updatedQuizAttempt = await this.prisma.quizAttempt.update({
      where: { id: quizAttemptId },
      data: {
        answer,
        isCorrect,
        xpEarned,
        satoshiEarned,
      },
    });

    this.conversationsService.emitConversationEvent(conversationId, {
      data: { type: 'quiz_result', quiz: updatedQuizAttempt },
    });

    // Check quiz completion NOW (not background!) to award total XP/satoshi only when all questions answered!
    await this.checkQuizCompletion(conversationId, userId);

    return {
      ...updatedQuizAttempt,
      encouragingMessage,
    };
  }

  private async checkQuizCompletion(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { user: true },
    });

    if (!conversation) {
      return;
    }

    // If quiz already passed for this conversation - check if there's a reward record!
    if (conversation.quizPassed) {
      const existingReward = await this.prisma.reward.findFirst({
        where: { conversationId, userId }
      });

      if (!existingReward) {
        // No reward exists! Create one for this completed quiz!
        const allQuizAttempts = await this.prisma.quizAttempt.findMany({
          where: { conversationId }
        });

        const totalXpEarned = allQuizAttempts.reduce((sum, q) => sum + (q.xpEarned || 0), 0);
        const totalSatoshiEarned = allQuizAttempts.reduce((sum, q) => sum + (q.satoshiEarned || 0), 0);
        const allCorrect = allQuizAttempts.every(q => q.isCorrect === true);

        await this.prisma.reward.create({
          data: {
            userId,
            conversationId,
            xp: totalXpEarned,
            satoshi: totalSatoshiEarned,
            reason: allCorrect ? 'Completed quiz perfectly! 🎉' : 'Completed quiz!',
          }
        });
      }
      return;
    }

    const userQuizQuestionCount = conversation.user.quizQuestionCount;
    const allQuizAttempts = await this.prisma.quizAttempt.findMany({
      where: { conversationId },
    });

    // Check if we have enough quiz attempts answered
    const answeredCount = allQuizAttempts.filter(
      (q) => q.answer && q.answer !== '',
    ).length;
    const allCorrect = allQuizAttempts.every((q) => q.isCorrect === true);

    // Only proceed if ALL questions are answered!
    if (answeredCount >= userQuizQuestionCount) {
      // Calculate total XP and satoshi earned from this quiz
      const totalXpEarned = allQuizAttempts.reduce((sum, q) => sum + (q.xpEarned || 0), 0);
      const totalSatoshiEarned = allQuizAttempts.reduce((sum, q) => sum + (q.satoshiEarned || 0), 0);

      // Only create reward if ALL answers are correct (quiz passed)!
      if (allCorrect) {
        // Create a Reward record for the user to claim!
        await this.prisma.reward.create({
          data: {
            userId,
            conversationId,
            xp: totalXpEarned,
            satoshi: totalSatoshiEarned,
            reason: 'Completed quiz perfectly! 🎉',
          },
        });

        // Increase quiz question count and mark quiz passed
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            quizQuestionCount: { increment: 5 },
            passedQuizCount: { increment: 1 },
          },
        });
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { quizPassed: true },
        });
      }

      this.conversationsService.emitConversationEvent(conversationId, {
        data: { type: 'quiz_completed', passed: allCorrect, totalXp: totalXpEarned, totalSatoshi: totalSatoshiEarned },
      });
    }
  }
}
