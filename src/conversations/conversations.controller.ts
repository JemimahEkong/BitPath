/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { Conversation, ConversationMode } from 'generated/prisma/client';
import { SessionGuard } from 'src/users/guards/session.guard';

@Controller('conversations')
@UseGuards(SessionGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async createConversation(
    @Req() req: Request,
    @Body()
    body: {
      title?: string;
      topic?: string;
      currentLessonId?: string;
      conversationMode?: ConversationMode;
    },
  ): Promise<Conversation> {
    const userId = (req as any).user.id;
    return this.conversationsService.createConversation(
      userId,
      body.title,
      body.topic,
      body.currentLessonId,
      body.conversationMode,
    );
  }

  @Get()
  async getConversations(@Req() req: Request): Promise<Conversation[]> {
    const userId = (req as any).user.id;
    return this.conversationsService.getConversationsByUserId(userId);
  }

  @Get(':conversationId')
  async getConversation(
    @Param('conversationId') conversationId: string,
    @Req() req: Request,
  ): Promise<Conversation> {
    const userId = (req as any).user.id;
    return this.conversationsService.getConversationById(
      conversationId,
      userId,
    );
  }

  @Put(':conversationId')
  async updateConversation(
    @Param('conversationId') conversationId: string,
    @Body() body: { data: Partial<Conversation> },
    @Req() req: Request,
  ): Promise<Conversation> {
    const userId = (req as any).user.id;
    return this.conversationsService.updateConversation(
      conversationId,
      userId,
      body.data,
    );
  }

  @Delete(':conversationId')
  async deleteConversation(
    @Param('conversationId') conversationId: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = (req as any).user.id;
    return this.conversationsService.deleteConversation(conversationId, userId);
  }

  @Sse('sse/stream/:conversationId')
  async sseStream(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Observable<MessageEvent>> {
    const conversationId = req.params.conversationId as string;
    const userId = (req as any).user.id;

    // Verify that the user has access to this conversation
    const conversation = await this.conversationsService.getConversationById(
      conversationId,
      userId,
    );

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // Set proper SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx

    return this.conversationsService.subscribeToConversationEvents(
      conversationId,
    );
  }
}
