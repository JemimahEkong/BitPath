import {
  Controller,
  Sse,
  MessageEvent,
  Req,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Conversation, ConversationMode } from 'generated/prisma/client';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async createConversation(
    @Body()
    body: {
      userId: string;
      title?: string;
      topic?: string;
      currentLessonId?: string;
      conversationMode?: ConversationMode;
    },
  ): Promise<Conversation> {
    return this.conversationsService.createConversation(
      body.userId,
      body.title,
      body.topic,
      body.currentLessonId,
      body.conversationMode,
    );
  }

  @Get()
  async getConversations(
    @Query('userId') userId: string,
  ): Promise<Conversation[]> {
    return this.conversationsService.getConversationsByUserId(userId);
  }

  @Get(':conversationId')
  async getConversation(
    @Param('conversationId') conversationId: string,
    @Query('userId') userId?: string,
  ): Promise<Conversation> {
    return this.conversationsService.getConversationById(
      conversationId,
      userId,
    );
  }

  @Put(':conversationId')
  async updateConversation(
    @Param('conversationId') conversationId: string,
    @Body() body: { userId: string; data: Partial<Conversation> },
  ): Promise<Conversation> {
    return this.conversationsService.updateConversation(
      conversationId,
      body.userId,
      body.data,
    );
  }

  @Delete(':conversationId')
  async deleteConversation(
    @Param('conversationId') conversationId: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    return this.conversationsService.deleteConversation(conversationId, userId);
  }

  @Sse('sse/stream/:conversationId')
  sseStream(@Req() req: Request): Observable<MessageEvent> {
    const conversationId = req.params.conversationId as string;
    // Implement authorization logic here to ensure the user has access to this conversation
    // For now, we'll assume it's authorized.
    return this.conversationsService.subscribeToConversationEvents(
      conversationId,
    );
  }
}
