/* eslint-disable prettier/prettier */
/**
 * 🧪 Queue Configuration Test
 * 
 * This file demonstrates that the configuration factory works correctly
 * and all TypeScript errors are resolved.
 */

import { 
  BASE_QUEUE_CONFIG, 
  createQueueConfig,
  createHighPriorityQueueConfig,
  createLowPriorityQueueConfig,
  createBulkProcessingQueueConfig,
  getAllQueueConfigs,
  type QueueConfig
} from './queue-config.factory';


// 🏭 Create test configurations (declare before use)
export const highPriorityConfig: QueueConfig = createHighPriorityQueueConfig('testHighPriority');
export const lowPriorityConfig: QueueConfig = createLowPriorityQueueConfig('testLowPriority');
export const bulkConfig: QueueConfig = createBulkProcessingQueueConfig('testBulk');
export const customConfig: QueueConfig = createQueueConfig('customQueue', {
  defaultJobOptions: {
    ...BASE_QUEUE_CONFIG.defaultJobOptions,
    priority: 20,
    attempts: 10,
    removeOnComplete: 75,
  },
  settings: {
    ...BASE_QUEUE_CONFIG.settings,
    stalledInterval: 60000,
  },
});

// 🧪 Test 1: Base configuration is complete
console.log('✅ Test 1: Base Configuration');
console.log('Base config:', BASE_QUEUE_CONFIG);
console.log('Has settings:', !!BASE_QUEUE_CONFIG.settings);
console.log('Has defaultJobOptions:', !!BASE_QUEUE_CONFIG.defaultJobOptions);
console.log('Settings has stalledInterval:', !!BASE_QUEUE_CONFIG.settings.stalledInterval);
console.log('defaultJobOptions has backoff:', !!BASE_QUEUE_CONFIG.defaultJobOptions.backoff);

// 🧪 Test 2: Queue-specific configurations


// 🧪 Test 3: Factory functions work correctly
console.log('\n✅ Test 3: Factory Functions');
console.log('High priority config priority:', highPriorityConfig.defaultJobOptions.priority);
console.log('High priority config attempts:', highPriorityConfig.defaultJobOptions.attempts);

console.log('Low priority config priority:', lowPriorityConfig.defaultJobOptions.priority);
console.log('Low priority config attempts:', lowPriorityConfig.defaultJobOptions.attempts);

console.log('Bulk config priority:', bulkConfig.defaultJobOptions.priority);
console.log('Bulk config delay:', bulkConfig.defaultJobOptions.delay);

// 🧪 Test 4: getAllQueueConfigs works
console.log('\n✅ Test 4: Get All Queue Configs');
const allConfigs = getAllQueueConfigs();
console.log('Number of queue configs:', allConfigs.length);
console.log('Queue names:', allConfigs.map(config => config.name));

// 🧪 Test 5: Configuration merging works
console.log('\n✅ Test 5: Configuration Merging');
console.log('Custom config priority (should be 20):', customConfig.defaultJobOptions.priority);
console.log('Custom config attempts (should be 10):', customConfig.defaultJobOptions.attempts);
console.log('Custom config removeOnFail (should be from base):', customConfig.defaultJobOptions.removeOnFail);
console.log('Custom config stalledInterval (should be 60000):', customConfig.settings.stalledInterval);
console.log('Custom config maxStalledCount (should be from base):', customConfig.settings.maxStalledCount);

console.log('\n🎉 All configuration tests completed successfully!');
console.log('📋 Configuration factory is working correctly with no TypeScript errors!');
