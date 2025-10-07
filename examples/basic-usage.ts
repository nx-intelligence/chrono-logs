import { createXLogger } from 'chrono-logs';

// Example Chronos configuration for centralized logs database
const chronosConfig = {
  dbConnections: {
    'mongo-logs': {
      mongoUri: 'mongodb+srv://user:pass@logs.mongodb.net/?retryWrites=true&w=majority'
    }
  },
  spacesConnections: {
    's3-logs': {
      endpoint: 'https://s3.amazonaws.com',
      region: 'us-east-1',
      accessKey: 'AKIA...',
      secretKey: 'SECRET...'
    }
  },
  databases: {
    logs: {
      dbConnRef: 'mongo-logs',
      spaceConnRef: 's3-logs',
      bucket: 'chronos-logs',
      dbName: 'chronos_logs'
    }
  },
  // Optional but recommended for search and compliance
  collectionMaps: {
    logs: {
      indexedProps: ['tenantId', 'level', 'service', 'env', 'correlationId', 'ts'],
      validation: {
        requiredIndexed: ['level', 'service', 'ts']
      }
    }
  },
  logicalDelete: { enabled: true },
  versioning: { enabled: true },
  transactions: { enabled: true }
};

// Create x-logger instance
const xlogger = createXLogger(
  { 
    packageName: 'web-app', 
    envPrefix: 'WEB_APP' 
  },
  {
    gateway: {
      enableUnifiedLogger: true,
      unifiedLogger: {
        service: 'web-app',
        env: 'production',
        transports: { papertrail: true },
        level: 'info'
      },
      logToConsole: true,
      logLevel: 'info'
    },
    chronos: {
      chronosConfig,
      collection: 'logs',
      tenantIdResolver: (meta) => meta?.tenantId // or derive from request context
    }
  }
);

// Example usage
async function example() {
  // Basic logging
  xlogger.info('Application started', {
    source: 'application',
    correlationId: 'startup-123',
    tenantId: 'tenant-a'
  });

  // HTTP request logging
  xlogger.info('HTTP request processed', {
    source: 'application',
    correlationId: 'req-456',
    tenantId: 'tenant-b',
    http: {
      method: 'GET',
      path: '/api/users',
      statusCode: 200,
      responseTime: 150
    }
  });

  // AI Activity logging - Request
  xlogger.logActivityRequest({
    jobId: 'job-42',
    request: { 
      prompt: 'Summarize this text: "The quick brown fox..."',
      maxTokens: 100
    },
    context: { 
      userTier: 'pro',
      feature: 'summarization'
    },
    activityMeta: { 
      feature: 'summarization',
      complexity: 'simple'
    },
    model: 'gpt-4o-mini',
    provider: 'openai',
    userId: 'user-123',
    requestStatus: 'accepted'
  }, {
    tenantId: 'tenant-a',
    correlationId: 'req-1'
  });

  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 100));

  // AI Activity logging - Response
  xlogger.logActivityResponse({
    jobId: 'job-42',
    response: { 
      text: 'A quick brown fox jumps over a lazy dog.',
      usage: { promptTokens: 15, completionTokens: 12 }
    },
    cost: { 
      inputTokens: 15, 
      outputTokens: 12, 
      usd: 0.0003 
    }
  }, {
    tenantId: 'tenant-a',
    correlationId: 'req-1'
  });

  // AI Activity with error
  xlogger.logActivityRequest({
    jobId: 'job-43',
    request: { prompt: 'Generate code' },
    model: 'gpt-4',
    provider: 'openai',
    requestStatus: 'accepted'
  }, { tenantId: 'tenant-b' });

  // Simulate error response
  xlogger.logActivityResponse({
    jobId: 'job-43',
    error: {
      code: 'RATE_LIMIT',
      message: 'Rate limit exceeded',
      data: { retryAfter: 60 }
    },
    responseStatus: 'failed'
  }, { tenantId: 'tenant-b' });

  // Error logging
  xlogger.error('Database connection failed', {
    source: 'application',
    correlationId: 'req-789',
    tenantId: 'tenant-c',
    error: {
      code: 'DB_CONNECTION_ERROR',
      message: 'Connection timeout',
      stack: 'Error: Connection timeout\n    at ...'
    }
  });

  // Recursion safety example - this will NOT be persisted to Chronos
  xlogger.warn('Chronos retry triggered', {
    source: 'chronos-db', // This prevents Chronos persistence
    reason: 'backoff',
    retryCount: 3
  });

  // Graceful shutdown
  await xlogger.flush({ timeoutMs: 3000 });
  console.log('Logger flushed successfully');
}

// Run example
example().catch(console.error);
