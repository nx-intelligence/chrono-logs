import { createXLogger } from '@x-developer/x-logger';

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
