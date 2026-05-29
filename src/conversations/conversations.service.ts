/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, MessageEvent, NotFoundException } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { CacheService } from 'src/cache.service';
import { PrismaService } from 'src/database/database.service';
import { Conversation, ConversationMode } from 'generated/prisma/client';

@Injectable()
export class ConversationsService {
  private readonly conversationSubjects = new Map<
    string,
    Subject<MessageEvent>
  >();

  constructor(
    private readonly cacheService: CacheService,
    private readonly prisma: PrismaService,
  ) {}

  async createConversation(
    userId: string,
    title?: string,
    topic?: string,
    currentLessonId?: string,
    conversationMode?: ConversationMode,
  ): Promise<Conversation> {
    return this.prisma.conversation.create({
      data: {
        userId,
        title,
        topic,
        currentLessonId,
        conversationMode,
      },
    });
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: { userId, isArchived: false },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getConversationById(
    conversationId: string,
    userId?: string,
  ): Promise<Conversation> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true, quizzes: true, rewards: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (userId && conversation.userId !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async updateConversation(
    conversationId: string,
    userId: string,
    data: Partial<Conversation>,
  ): Promise<Conversation> {
    await this.getConversationById(conversationId, userId);
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data,
    });
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await this.getConversationById(conversationId, userId);
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { isArchived: true },
    });
    await this.clearRecentMessagesCache(conversationId);
  }

  subscribeToConversationEvents(
    conversationId: string,
  ): Observable<MessageEvent> {
    let subject = this.conversationSubjects.get(conversationId);
    if (!subject) {
      subject = new Subject<MessageEvent>();
      this.conversationSubjects.set(conversationId, subject);
    }
    return subject.asObservable();
  }

  emitConversationEvent(conversationId: string, event: MessageEvent) {
    const subject = this.conversationSubjects.get(conversationId);
    if (subject) {
      subject.next(event);
    }
  }

  private getCacheKeyForRecentMessages(conversationId: string): string {
    return `recent_messages:${conversationId}`;
  }

  async getRecentMessagesFromCache(conversationId: string): Promise<any[]> {
    const key = this.getCacheKeyForRecentMessages(conversationId);
    const messages = await this.cacheService.getObjectArrayCacheKey(key);
    return messages || [];
  }

  async setRecentMessagesToCache(
    conversationId: string,
    messages: any[],
    ttl: number = 3600,
  ): Promise<void> {
    const key = this.getCacheKeyForRecentMessages(conversationId);
    await this.cacheService.setCacheKey(key, messages, ttl);
  }

  async clearRecentMessagesCache(conversationId: string): Promise<void> {
    const key = this.getCacheKeyForRecentMessages(conversationId);
    await this.cacheService.deleteCacheKey(key);
  }

  // Optional: Clean up subjects when a conversation ends or is archived/deleted
  // For now, subjects will persist until the application restarts or a more robust cleanup is implemented.
}
