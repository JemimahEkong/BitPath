/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */

import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from 'generated/prisma/client';
import { SessionGuard } from 'src/users/guards/session.guard';
import { Request } from 'express';

@Controller('conversations')
@UseGuards(SessionGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':conversationId/messages')
  async createMessage(
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request,
  ): Promise<Message> {
    const userId = (req as any).user.id;
    const message = await this.messageService.createMessage(
      conversationId,
      createMessageDto,
    );

    this.messageService.generateAiResponseStream(conversationId, userId);

    return message;
  }

  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ): Promise<Message[]> {
    return this.messageService.getMessages(
      conversationId,
      Number(limit),
      Number(offset),
    );
  }

  @Post(':conversationId/quiz/start')
  async startQuiz(
    @Param('conversationId') conversationId: string,
    @Body('topic') topic: string,
    @Body('difficulty') difficulty: string,
  ) {
    return this.messageService.generateQuizQuestion(
      conversationId,
      topic,
      difficulty,
    );
  }

  @Post(':conversationId/quiz/full')
  async startFullQuiz(
    @Param('conversationId') conversationId: string,
    @Body() body: { topic?: string; difficulty?: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.messageService.generateFullQuiz(
      conversationId,
      userId,
      body.topic || 'Bitcoin',
      body.difficulty || 'medium',
    );
  }

  @Post(':conversationId/quiz/:quizAttemptId/answer')
  async submitQuizAnswer(
    @Param('conversationId') conversationId: string,
    @Param('quizAttemptId') quizAttemptId: string,
    @Body() body: { answer: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.messageService.submitQuizAnswer(
      conversationId,
      quizAttemptId,
      body.answer,
      userId,
    );
  }
}
