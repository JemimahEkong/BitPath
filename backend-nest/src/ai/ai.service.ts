/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AiService.name);
  private readonly SYSTEM_PROMPT = `You are BitPath, an expert Bitcoin and blockchain tutor. Your purpose is to help users learn about Bitcoin, blockchain technology, wallets, security, and financial literacy related to cryptocurrency.

Key Guidelines:
1. Be friendly, encouraging, and educational
2. Explain complex topics in simple, easy-to-understand language
3. Use examples and analogies when helpful
4. After teaching a topic, offer to quiz the user to reinforce learning
5. Keep responses focused on Bitcoin and blockchain topics
6. If asked about unrelated topics, politely redirect to Bitcoin/blockchain learning

Common questions you should be prepared to answer:
- "What is Bitcoin?"
- "How does Bitcoin work?"
- "How to earn Bitcoin?"
- "What is blockchain?"
- "How do Bitcoin wallets work?"
- "Bitcoin security best practices"
- "How to buy Bitcoin"

Always maintain a professional yet approachable tone, like a knowledgeable personal tutor.`;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  private addSystemPrompt(messages: any[]): any[] {
    const hasSystemPrompt = messages.some((msg) => msg.role === 'system');
    if (hasSystemPrompt) {
      return messages;
    }
    return [{ role: 'system', content: this.SYSTEM_PROMPT }, ...messages];
  }

  // Method to generate chat completions (streaming)
  async generateChatCompletionStream(messages: any[]) {
    try {
      const messagesWithSystem = this.addSystemPrompt(messages);
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo', // Or gpt-3.5-turbo
        messages: messagesWithSystem,
        stream: true,
      });
      return stream;
    } catch (error) {
      this.logger.error('Error generating chat completion stream:', error);
      throw error;
    }
  }

  // Method to generate chat completions (non-streaming for suggestions/quizzes)
  async generateChatCompletion(messages: any[]) {
    try {
      const messagesWithSystem = this.addSystemPrompt(messages);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo', // Or gpt-3.5-turbo
        messages: messagesWithSystem,
        stream: false,
      });
      return completion.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error generating chat completion:', error);
      throw error;
    }
  }

  // Method to generate suggestions (example)
  async generateSuggestions(conversationHistory: any[]): Promise<string[]> {
    const prompt = `Based on the following conversation history, suggest 3-5 concise follow-up questions or actions for the user about Bitcoin/blockchain learning:
${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}
Suggestions:`;
    const response = await this.generateChatCompletion([
      { role: 'user', content: prompt },
    ]);
    return response ? response.split('\n').filter((s) => s.trim() !== '') : [];
  }

  // Method to generate a quiz question based on lesson content
  async generateQuizQuestion(
    topic: string,
    difficulty: string,
    lessonContent?: string,
  ): Promise<{ question: string; correctAnswer: string }> {
    let prompt = '';

    if (lessonContent) {
      prompt = `Based on the following lesson content, generate a ${difficulty} level quiz question that tests understanding of this specific material. Provide the question and the correct answer.

Lesson Content:
${lessonContent}

Question:
Correct Answer:`;
    } else {
      prompt = `Generate a ${difficulty} level quiz question about ${topic} related to Bitcoin or blockchain. Provide the question and the correct answer.
Question:
Correct Answer:`;
    }

    const response = await this.generateChatCompletion([
      { role: 'user', content: prompt },
    ]);

    if (response) {
      const lines = response.split('\n').filter((s) => s.trim() !== '');
      let question = '';
      let correctAnswer = '';

      for (const line of lines) {
        if (line.toLowerCase().startsWith('question:')) {
          question = line.replace(/question:/i, '').trim();
        } else if (line.toLowerCase().startsWith('correct answer:')) {
          correctAnswer = line.replace(/correct answer:/i, '').trim();
        } else if (!question) {
          question = line.trim();
        } else if (!correctAnswer) {
          correctAnswer = line.trim();
        }
      }

      return {
        question: question || 'Could not generate question.',
        correctAnswer: correctAnswer || '',
      };
    }

    return { question: 'Could not generate question.', correctAnswer: '' };
  }

  // Method to generate multiple quiz questions for a lesson
  async generateLessonQuiz(
    lessonContent: string,
    difficulty: string = 'medium',
    numQuestions: number = 3,
  ): Promise<Array<{ question: string; correctAnswer: string }>> {
    const quiz: Array<{ question: string; correctAnswer: string }> = [];

    for (let i = 0; i < numQuestions; i++) {
      const question = await this.generateQuizQuestion(
        'lesson review',
        difficulty,
        lessonContent,
      );
      if (
        question.question &&
        question.question !== 'Could not generate question.'
      ) {
        quiz.push(question);
      }
    }

    return quiz;
  }
}
