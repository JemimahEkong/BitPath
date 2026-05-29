import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { AiModule } from 'src/ai/ai.module';
import { QueueModule } from 'src/untils/bullProcessor/queue.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [ConversationsModule, AiModule, QueueModule],
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
  exports: [MessageService],
})
export class MessageModule {}
