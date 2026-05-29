/* eslint-disable prettier/prettier */
/**
 * 🏭 Queue Configuration Factory
 * 
 * This utility makes it easy to create new queues with consistent configuration
 * while allowing for queue-specific customizations.
 */



// 🎯 Type definitions for better type safety
export interface QueueSettings {
  stalledInterval: number;
  maxStalledCount: number;
}

export interface QueueJobOptions {
  removeOnComplete: number;
  removeOnFail: number;
  attempts: number;
  backoff: {
    type: string;
    delay: number;
  };
  delay: number;
  priority: number;
}

export interface QueueConfig {
  name: string;
  settings: QueueSettings;
  defaultJobOptions: QueueJobOptions;
}

// 🎯 Base configuration for all queues
export const BASE_QUEUE_CONFIG: Omit<QueueConfig, 'name'> = {
  settings: {
    stalledInterval: 30 * 1000,
    maxStalledCount: 1,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    delay: 0,
    priority: 1,
  },
};

// 🎯 Queue-specific configurations
export const QUEUE_CONFIGS: Record<string, QueueConfig> = {

};

/**
 * 🏭 Factory function to create new queue configurations
 * 
 * @param queueName Name of the queue
 * @param overrides Optional configuration overrides
 * @returns Complete queue configuration
 */
export function createQueueConfig(
  queueName: string, 
  overrides: Partial<Omit<QueueConfig, 'name'>> = {}
): QueueConfig {
  return {
    name: queueName,
    settings: {
      ...BASE_QUEUE_CONFIG.settings,
      ...overrides.settings,
    },
    defaultJobOptions: {
      ...BASE_QUEUE_CONFIG.defaultJobOptions,
      ...overrides.defaultJobOptions,
    },
  };
}

/**
 * 🏭 Factory function for high-priority queues (like OTPs)
 */
export function createHighPriorityQueueConfig(queueName: string) {
  return createQueueConfig(queueName, {
    defaultJobOptions: {
      ...BASE_QUEUE_CONFIG.defaultJobOptions,
      priority: 10,
      removeOnComplete: 50,
      attempts: 5, // More retries for critical jobs
    },
  });
}

/**
 * 🏭 Factory function for low-priority queues (like notifications)
 */
export function createLowPriorityQueueConfig(queueName: string) {
  return createQueueConfig(queueName, {
    defaultJobOptions: {
      ...BASE_QUEUE_CONFIG.defaultJobOptions,
      priority: 5,
      removeOnComplete: 100,
      attempts: 2, // Fewer retries for non-critical jobs
    },
  });
}

/**
 * 🏭 Factory function for bulk processing queues
 */
export function createBulkProcessingQueueConfig(queueName: string) {
  return createQueueConfig(queueName, {
    defaultJobOptions: {
      ...BASE_QUEUE_CONFIG.defaultJobOptions,
      priority: 1,
      removeOnComplete: 200, // Keep more jobs for auditing
      attempts: 1, // No retries for bulk jobs (handle manually)
      delay: 1000, // Small delay to prevent overwhelming
    },
  });
}

/**
 * 🎯 Get all queue configurations for BullModule.registerQueue
 */
export function getAllQueueConfigs(): QueueConfig[] {
  return Object.values(QUEUE_CONFIGS);
}

/**
 * 🎯 Add a new queue configuration dynamically
 */
export function addQueueConfig(
  queueName: string, 
  config: Partial<Omit<QueueConfig, 'name'>> = {}
): QueueConfig {
  const newConfig = createQueueConfig(queueName, config);
  QUEUE_CONFIGS[queueName] = newConfig;
  return newConfig;
}

// Example usage:
/*
// Add a new email queue
addQueueConfig('emailQueue', createHighPriorityQueueConfig('emailQueue'));

// Add a new report generation queue
addQueueConfig('reportQueue', createBulkProcessingQueueConfig('reportQueue'));

// Add a custom queue with specific settings
addQueueConfig('customQueue', {
  defaultJobOptions: {
    priority: 15,
    removeOnComplete: 25,
    attempts: 10,
  },
});
*/
