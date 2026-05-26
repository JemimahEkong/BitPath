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

    // Update conversation total messages
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { totalMessages: { increment: 1 }, lastMessageAt: new Date() },
    });

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

      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { totalMessages: { increment: 1 }, lastMessageAt: new Date() },
      });

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
  ): Promise<QuizAttempt> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        currentLessonId: true,
        currentLesson: { select: { content: true } },
      },
    });

    const { question, correctAnswer } =
      await this.aiService.generateQuizQuestion(
        topic,
        difficulty,
        conversation?.currentLesson?.content,
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

  async submitQuizAnswer(
    conversationId: string,
    quizAttemptId: string,
    answer: string,
    userId: string,
  ): Promise<QuizAttempt> {
    const quizAttempt = await this.prisma.quizAttempt.findUnique({
      where: { id: quizAttemptId },
    });

    if (!quizAttempt) {
      throw new Error('Quiz attempt not found');
    }

    const isCorrect =
      quizAttempt.correctAnswer?.toLowerCase() === answer.toLowerCase();
    const xpEarned = isCorrect ? 10 : 0;

    const updatedQuizAttempt = await this.prisma.quizAttempt.update({
      where: { id: quizAttemptId },
      data: {
        answer,
        isCorrect,
        xpEarned,
      },
    });

    this.conversationsService.emitConversationEvent(conversationId, {
      data: { type: 'quiz_result', quiz: updatedQuizAttempt },
    });

    await this.queueService.addXpJob({
      userId,
      xpAmount: updatedQuizAttempt.xpEarned,
      reason: 'Quiz answer',
    });
    if (updatedQuizAttempt.xpEarned > 0) {
      await this.queueService.addRewardJob({
        userId,
        conversationId,
        xpEarned: updatedQuizAttempt.xpEarned,
        btcReward: updatedQuizAttempt.xpEarned * 0.000001,
        reason: 'Quiz correct answer',
      });
    }

    return updatedQuizAttempt;
  }
}
