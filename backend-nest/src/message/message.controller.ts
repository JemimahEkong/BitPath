/* eslint-disable @typescript-eslint/no-floating-promises */

import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from 'generated/prisma/client';

@Controller('conversations')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':conversationId/messages')
  async createMessage(
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto & { userId: string },
  ): Promise<Message> {
    const userId = createMessageDto.userId || 'some_user_id';
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

  @Post(':conversationId/quiz/:quizAttemptId/answer')
  async submitQuizAnswer(
    @Param('conversationId') conversationId: string,
    @Param('quizAttemptId') quizAttemptId: string,
    @Body() body: { answer: string; userId: string },
  ) {
    return this.messageService.submitQuizAnswer(
      conversationId,
      quizAttemptId,
      body.answer,
      body.userId || 'some_user_id',
    );
  }
}
