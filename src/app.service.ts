/* eslint-disable @typescript-eslint/require-await */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueueService } from './untils/bullProcessor/queue.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly queueService: QueueService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    console.log('AppModule initialized - QueueService injected!');
  }
}
