/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  private readonly SYSTEM_PROMPT = `You are BitPath, an expert Bitcoin and blockchain tutor. Your purpose is to help users learn about Bitcoin, blockchain technology, wallets, security, and financial literacy related to cryptocurrency.

Key Guidelines:
1. Be friendly, encouraging, and educational
2. Explain complex topics in simple, easy-to-understand language
3. Use examples and analogies when helpful
4. After teaching a topic, offer to quiz the user to reinforce learning
5. Keep responses focused on Bitcoin and blockchain topics
6. If asked about unrelated topics, politely redirect to Bitcoin/blockchain learning
7. **SPECIAL WALLET GUIDE**:
   - **ALWAYS mention Lightning Wallet FIRST as the primary example** whenever you talk about Bitcoin wallets in ANY context
   - **ALSO mention other types of wallets** (software wallets, hardware wallets, etc.) as additional options - don't neglect them!
   - Whenever the user mentions ANY of these keywords:
     - "Lighting Network"
     - "Lighting Wallet" 
     - "Wallet"
     - "I don't have wallet"
     - "BitcoinWallet"
     - "I dont have wallet"
   **IMMEDIATELY provide a comprehensive guide on Lightning wallets, including how to install and use one.**
8. **FORMAT EVERY RESPONSE IN CLEAN, PROFESSIONAL MARKDOWN**:
   - Use **bold text** for key terms and important concepts
   - Use headings (##, ###) to organize content into sections
   - Use bullet points (- ) or numbered lists (1.) for better readability
   - Use short paragraphs with clear line breaks
   - Structure responses with a logical flow (introduction, main points, conclusion)

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
      timeout: 60000, // 60 seconds timeout
      maxRetries: 0, // We'll handle retries ourselves
    });
  }

  private addSystemPrompt(messages: any[]): any[] {
    const hasSystemPrompt = messages.some((msg) => msg.role === 'system');
    if (hasSystemPrompt) {
      return messages;
    }
    return [{ role: 'system', content: this.SYSTEM_PROMPT }, ...messages];
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Method to generate chat completions (streaming) with retries
  async generateChatCompletionStream(messages: any[], attempt: number = 0) {
    try {
      const messagesWithSystem = this.addSystemPrompt(messages);
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo', // Or gpt-3.5-turbo
        messages: messagesWithSystem,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      });
      return stream;
    } catch (error) {
      this.logger.error(
        `Error generating chat completion stream (attempt ${attempt + 1}):`,
        error,
      );

      if (attempt < this.MAX_RETRIES) {
        this.logger.warn(`Retrying in ${this.RETRY_DELAY_MS}ms...`);
        await this.sleep(this.RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
        return this.generateChatCompletionStream(messages, attempt + 1);
      }

      throw error;
    }
  }

  // Method to generate chat completions (non-streaming for suggestions/quizzes) with retries
  async generateChatCompletion(messages: any[], attempt: number = 0, useFastModel: boolean = false, temperature: number = 0.7) {
    try {
      const messagesWithSystem = this.addSystemPrompt(messages);
      const completion = await this.openai.chat.completions.create({
        model: useFastModel ? 'gpt-3.5-turbo' : 'gpt-4-turbo', // Use faster model for quizzes
        messages: messagesWithSystem,
        stream: false,
        temperature: temperature,
        max_tokens: useFastModel ? 1024 : 4096, // Smaller token limit for quiz questions
      });
      return completion.choices[0].message.content;
    } catch (error) {
      this.logger.error(
        `Error generating chat completion (attempt ${attempt + 1}):`,
        error,
      );

      if (attempt < this.MAX_RETRIES) {
        this.logger.warn(`Retrying in ${this.RETRY_DELAY_MS}ms...`);
        await this.sleep(this.RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
        return this.generateChatCompletion(messages, attempt + 1, useFastModel, temperature);
      }

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

  // Method to generate a quiz question based on lesson content or conversation history
  async generateQuizQuestion(
    topic: string,
    difficulty: string,
    lessonContent?: string,
    conversationHistory?: any[],
    previousQuestions?: string[],
  ): Promise<{ question: string; correctAnswer: string }> {
    let prompt = '';
    
    let previousQuestionsSection = '';
    if (previousQuestions && previousQuestions.length > 0) {
      previousQuestionsSection = `\n\nIMPORTANT: DO NOT REPEAT ANY OF THESE PREVIOUSLY ASKED QUESTIONS:\n${previousQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}\n\n`;
    }

    if (lessonContent) {
      prompt = `Based on the following lesson content, generate a UNIQUE ${difficulty} level quiz question that tests understanding of THIS SPECIFIC material. Do NOT repeat generic questions - focus on unique details. DO NOT ask about Lightning Network or Lightning wallets unless the content specifically mentions it!

Lesson Content:
${lessonContent}
${previousQuestionsSection}
Format your response EXACTLY as:
Question: [your question here]
Correct Answer: [your correct answer here]`;
    } else if (conversationHistory && conversationHistory.length > 0) {
      prompt = `Based on the following conversation history, generate a UNIQUE ${difficulty} level quiz question about ${topic} that tests understanding of the SPECIFIC topics discussed in THIS conversation segment. Do NOT repeat generic questions like "What is a Bitcoin transaction?" - ask about something specific mentioned in the chat. Be CREATIVE and UNPREDICTABLE! DO NOT ask about Lightning Network or Lightning wallets unless the conversation specifically mentions it!

Conversation History:
${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}
${previousQuestionsSection}
Format your response EXACTLY as:
Question: [your question here]
Correct Answer: [your correct answer here]`;
    } else {
      prompt = `Generate a UNIQUE ${difficulty} level quiz question about ${topic} related to Bitcoin or blockchain. Be creative and avoid common generic questions. Be UNPREDICTABLE! DO NOT ask about Lightning Network or Lightning wallets!
${previousQuestionsSection}
Format your response EXACTLY as:
Question: [your question here]
Correct Answer: [your correct answer here]`;
    }

    const response = await this.generateChatCompletion([
      { role: 'user', content: prompt },
    ], 0, true, 0.9); // Higher temperature (0.9) for more variability!

    if (response) {
      const lines = response.split('\n').filter((s) => s.trim() !== '');
      let question = '';
      let correctAnswer = '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.toLowerCase().startsWith('question:')) {
          question = trimmedLine.replace(/question:/i, '').trim();
        } else if (trimmedLine.toLowerCase().startsWith('correct answer:')) {
          correctAnswer = trimmedLine.replace(/correct answer:/i, '').trim();
        }
      }

      // If we couldn't find labels, try to find the question and answer by position
      if (!question && lines.length >= 1) {
        question = lines[0].trim();
        // Remove any leading numbers or labels
        question = question.replace(/^\d+\.\s*/, '').replace(/^\*\s*/, '').replace(/^Q:\s*/, '');
      }
      if (!correctAnswer && lines.length >= 2) {
        correctAnswer = lines[1].trim();
        correctAnswer = correctAnswer.replace(/^\d+\.\s*/, '').replace(/^\*\s*/, '').replace(/^A:\s*/, '');
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
    const generatedQuestions: string[] = [];

    for (let i = 0; i < numQuestions; i++) {
      const question = await this.generateQuizQuestion(
        'lesson review',
        difficulty,
        lessonContent,
        undefined,
        generatedQuestions,
      );
      if (
        question.question &&
        question.question !== 'Could not generate question.'
      ) {
        quiz.push(question);
        generatedQuestions.push(question.question);
      }
    }

    return quiz;
  }

  // Method to generate a meaningful conversation title
  async generateConversationTitle(
    firstMessage: string,
  ): Promise<string> {
    const prompt = `Generate a concise, descriptive title (max 8 words) for a conversation that starts with: "${firstMessage}". Only return the title, no extra text.`;
    const response = await this.generateChatCompletion([
      { role: 'user', content: prompt },
    ]);
    return response ? response.trim() : 'New Chat';
  }

  // Method to intelligently check if a quiz answer is correct
  async checkAnswerCorrectness(
    question: string,
    userAnswer: string,
    correctAnswer: string,
  ): Promise<{ isCorrect: boolean; explanation?: string; encouragingMessage?: string }> {
    const prompt = `Check if the user's answer is correct for the given question. BE EXTREMELY LENIENT AND ENCOURAGING!

Evaluation Rules:
1. Allow user opinions and different ways of expressing the same idea
2. If the user's answer contains ANY of the key concepts from the correct answer, mark it as true
3. If the user's answer is in the same ballpark or on the right track, mark it as true
4. Only mark as false if the answer is completely wrong or unrelated
5. Don't worry about perfect wording - focus on the meaning and understanding

Question: ${question}
Correct Answer: ${correctAnswer}
User's Answer: ${userAnswer}

Respond with JSON in this exact format:
{
  "isCorrect": true or false,
  "encouragingMessage": "A PERSONALIZED encouraging message! If correct, praise their specific answer and connect it to the correct answer. If incorrect, give a gentle hint."
}

Example for correct answer:
{
  "isCorrect": true,
  "encouragingMessage": "Excellent answer! 🎉 You've got it! Bitcoin mining block rewards are indeed crucial because they incentivize miners to secure the network, validate transactions, and introduce new Bitcoin into circulation. Great job!"
}

Only return the JSON, no other text.`;

    try {
      const response = await this.generateChatCompletion([
        { role: 'user', content: prompt },
      ], 0, true);

      // Try to parse JSON response
      try {
        const result = JSON.parse(response || '{}');
        return {
          isCorrect: result.isCorrect || false,
          encouragingMessage: result.encouragingMessage
        };
      } catch {
        // If JSON parsing fails, fall back to checking for "true"
        const isCorrect = response?.toLowerCase().includes('true') || false;
        return {
          isCorrect,
          encouragingMessage: isCorrect ? 'Excellent answer! 🎉' : 'Keep trying! You\'re on the right track!'
        };
      }
    } catch (error) {
      this.logger.error('Error checking answer correctness:', error);
      // Fall back to very lenient partial match if AI fails
      const userLower = userAnswer.toLowerCase().trim();
      const correctLower = correctAnswer.toLowerCase().trim();
      
      // Check for any overlap in key words (3+ characters)
      const userWords = userLower.split(/\s+/).filter(w => w.length >= 3);
      const correctWords = correctLower.split(/\s+/).filter(w => w.length >= 3);
      
      let overlapCount = 0;
      for (const userWord of userWords) {
        if (correctWords.includes(userWord)) {
          overlapCount++;
        }
      }
      
      // If at least 2 key words match, consider it correct
      const isCorrect = overlapCount >= 2 || userLower.includes(correctLower.substring(0, 20)) || correctLower.includes(userLower.substring(0, 20));
      return {
        isCorrect,
        encouragingMessage: isCorrect ? 'Excellent answer! 🎉' : 'Keep trying! You\'re on the right track!'
      };
    }
  }
}
