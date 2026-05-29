/* eslint-disable prettier/prettier */
 

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, { ttl } as any);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async setCacheKey(key: string, value: any, ttl: number): Promise<void> {
    await this.set(key, value, ttl);
  }

  async getObjectArrayCacheKey(key: string): Promise<any> {
    return this.get(key);
  }

  async getCacheKey(key: string): Promise<string> {
    const data = await this.get(key);
    return data as string;
  }

  async deleteCacheKey(key: string): Promise<void> {
    await this.delete(key);
  }

  async setStreamingState(conversationId: string, isStreaming: boolean): Promise<void> {
    await this.set(`streaming:${conversationId}`, isStreaming, 300);
  }

  async getStreamingState(conversationId: string): Promise<boolean | undefined> {
    return this.get<boolean>(`streaming:${conversationId}`);
  }

  async setTypingState(conversationId: string, isTyping: boolean): Promise<void> {
    await this.set(`typing:${conversationId}`, isTyping, 30);
  }

  async getTypingState(conversationId: string): Promise<boolean | undefined> {
    return this.get<boolean>(`typing:${conversationId}`);
  }

  async setQuizState(conversationId: string, state: any): Promise<void> {
    await this.set(`quiz:${conversationId}`, state, 3600);
  }

  async getQuizState(conversationId: string): Promise<any> {
    return this.get(`quiz:${conversationId}`);
  }
}
