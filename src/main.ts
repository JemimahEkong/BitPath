/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';

import { Request, Response, NextFunction } from 'express';
import { ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';
import toobusy from 'toobusy-js';
import cookieParser from 'cookie-parser';
import "dotenv/config";
import { AppModule } from './app.module';
import { PrismaService } from './database/database.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://BitPath.com'
    ],
    credentials: true,
  });

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: [
            `'self'`,
            'data:',
            'https:',
          ],
          scriptSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          connectSrc: [`'self'`, 'https:'],
        },
      },
    }),
  );

  app.use(function (req, res, next) {
    if (toobusy()) {
      res.status(503).send("I'm busy right now, sorry.");
    } else {
      next();
    }
  });

   app.get(PrismaService);
  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Add production error handling
  if (process.env.NODE_ENV === 'production') {
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Don't exit in production - log and continue
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit in production - log and continue
    });
  }

  // Swagger configuration for API documentation
  const config = new DocumentBuilder()
    .setTitle('BitPath API')
    .setDescription('The BitPath API description')
    .setVersion('0.1')
    .addTag('bitPath')
    .addBearerAuth()
    .addServer('http://localhost:3001')
    .addServer('https://bitPath.devcloud.urikaa.com')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the application on the specific port
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();