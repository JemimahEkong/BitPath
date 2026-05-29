import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { PrismaModule } from 'src/database/database.module';
import { QueueModule } from 'src/untils/bullProcessor/queue.module';
import { AuthModule } from 'src/auth.module';

@Module({
  imports: [PrismaModule, QueueModule, AuthModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
