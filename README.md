# @x-developer/x-logger

A thin wrapper around `logs-gateway` that adds Chronos-DB v2.0 persistence into a dedicated logs collection, with strict recursion safety and tenant/correlation propagation.

## What x-logger adds

- **Chronos persistence**: Writes each log to Chronos-DB v2.0 under `databaseType=logs` with configurable collections
- **AI Activity logging**: Specialized logging for AI requests/responses with job binding and status tracking
- **Multi-tenant metadata**: Optional `tenantId` propagation stored on each log record
- **Correlation + source**: First-class fields for `correlationId` and `source`, persisted with the log
- **Recursion safety**: Never persists logs that originate from `source='chronos-db'`; never re-log persistence errors to Chronos
- **Backward compatibility**: Same logger methods (`debug`, `info`, `warn`, `error`) and keeps your unified logger/console/file outputs from logs-gateway
- **JSON-only Chronos config**: Accept a `ChronosConfig` object or a pre-initialized instance—no envs
- **Configurable collections**: Separate collections for logs, activities, and errors with flexible unbound response handling

## Installation

```bash
npm install @x-developer/x-logger chronos-db logs-gateway
```

## Quick Start

```typescript
import { createXLogger } from '@x-developer/x-logger';

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

const xlogger = createXLogger(
  { packageName: 'web-app', envPrefix: 'WEB_APP' },
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
    collections: {
      logs: 'logs',
      activities: 'activities',
      errors: 'errors'
    },
    unboundResponseHandling: 'both', // store in activities (missingStart) and errors
    tenantIdResolver: (meta) => meta?.tenantId
  }
  }
);

// Use like any other logger
xlogger.info('Application boot', {
  source: 'application',
  correlationId: 'req-1234',
  tenantId: 'tenant-a',
  http: { method: 'GET', path: '/' }
});

// AI Activity logging
xlogger.logActivityRequest({
  jobId: 'job-42',
  request: { prompt: 'Summarize this text' },
  context: { userTier: 'pro' },
  model: 'gpt-4o-mini',
  provider: 'openai',
  userId: 'user-123'
}, {
  tenantId: 'tenant-a',
  correlationId: 'req-1'
});

// Later, when response arrives
xlogger.logActivityResponse({
  jobId: 'job-42',
  response: { text: 'Summary...' },
  cost: { inputTokens: 250, outputTokens: 120, usd: 0.0068 }
}, {
  tenantId: 'tenant-a',
  correlationId: 'req-1'
});
```

## API Reference

### `createXLogger(pkg, config)`

Creates a new x-logger instance.

**Parameters:**
- `pkg`: `LoggerPackageConfig` - Package configuration
- `config`: `XLoggerConfig` - Logger configuration including gateway and chronos options

**Returns:** `XLogger` - Logger instance with same methods as logs-gateway plus `getConfig()` and `flush()`

### Logger Methods

```typescript
// Standard logging methods (from logs-gateway)
xlogger.debug(message: string, data?: XLoggerLogMeta): void;
xlogger.info(message: string, data?: XLoggerLogMeta): void;
xlogger.warn(message: string, data?: XLoggerLogMeta): void;
xlogger.error(message: string, data?: XLoggerLogMeta): void;

// AI Activity logging methods
xlogger.logActivityRequest(req: AiActivityRequest, meta?: XLoggerLogMeta): void;
xlogger.logActivityResponse(res: AiActivityResponse, meta?: XLoggerLogMeta): void;

// Utility methods
xlogger.getConfig(): Readonly<XLoggerConfig>;
xlogger.isLevelEnabled(level: LogLevel): boolean;
xlogger.flush(opts?: { timeoutMs?: number }): Promise<void>;
```

### Configuration

#### `XLoggerConfig`

```typescript
interface XLoggerConfig {
  gateway: LoggingConfig; // logs-gateway configuration
  chronos: XLoggerChronosOptions;
}
```

#### `XLoggerChronosOptions`

```typescript
interface XLoggerChronosOptions {
  chronosInstance?: ChronosInstance; // Pre-initialized chronos instance
  chronosConfig?: ChronosConfig; // Chronos configuration object
  collection?: string; // Default: 'logs'
  tenantIdResolver?: (meta?: LogMeta) => string | undefined;
  fireAndForget?: boolean; // Default: true
  maxInFlight?: number; // Default: 100
  onError?: (err: unknown, record: any) => void;
}
```

## Data Shapes

### Standard Logs (logs collection)

```typescript
{
  ts: '2025-01-07T12:34:56.789Z',
  level: 'info',
  message: 'Application boot',
  package: 'web-app',
  service: 'web-app',
  env: 'production',
  source: 'application',
  correlationId: 'req-1234',
  tenantId: 'tenant-a',
  meta: {
    http: { method: 'GET', path: '/' },
    // ... any user-provided fields except _routing
  }
}
```

### AI Activities (activities collection)

**Request:**
```typescript
{
  type: 'ai-activity',
  jobId: 'job-123',
  status: 'in-progress',
  requestStatus: 'accepted',
  responseStatus: 'pending',
  startTs: '2025-01-07T12:00:00.000Z',
  startMs: 1696680000000,
  request: { prompt: 'Summarize this text' },
  context: { userTier: 'pro' },
  model: 'gpt-4o-mini',
  provider: 'openai',
  userId: 'user-123',
  service: 'web-app',
  env: 'production',
  source: 'application',
  tenantId: 'tenant-a',
  correlationId: 'req-abc'
}
```

**Response (enriched):**
```typescript
{
  // ... all request fields plus:
  endTs: '2025-01-07T12:00:00.450Z',
  endMs: 1696680000450,
  durationMs: 450,
  status: 'completed', // or 'failed'
  responseStatus: 'completed', // or 'failed'|'timeout'|'error'
  response: { text: 'Summary...' },
  cost: { inputTokens: 250, outputTokens: 120, usd: 0.0068 }
}
```

### AI Activity Errors (errors collection)

```typescript
{
  type: 'ai-activity-error',
  reason: 'unbound-response',
  jobId: 'job-123',
  responseStatus: 'completed',
  endTs: '2025-01-07T12:00:00.450Z',
  endMs: 1696680000450,
  response: { text: 'Summary...' },
  cost: { inputTokens: 250, outputTokens: 120, usd: 0.0068 },
  service: 'web-app',
  env: 'production',
  source: 'application',
  tenantId: 'tenant-a',
  correlationId: 'req-abc'
}
```

## Recursion Safety

x-logger automatically prevents infinite loops by:

1. **Source filtering**: Logs with `source='chronos-db'` are never persisted to Chronos
2. **Error isolation**: Chronos persistence errors never trigger additional Chronos writes
3. **Optional error handling**: Use `onError` callback to handle persistence failures

```typescript
// This will NOT be persisted to Chronos (recursion safety)
xlogger.warn('Chronos retry triggered', { 
  source: 'chronos-db',
  reason: 'backoff' 
});
```

## Multi-tenant Support

Set `tenantId` on log metadata or provide a `tenantIdResolver`:

```typescript
// Direct tenantId
xlogger.info('User action', { 
  tenantId: 'tenant-123',
  userId: 'user-456' 
});

// Or use resolver
const xlogger = createXLogger(pkg, {
  // ... config
  chronos: {
    // ... chronos config
    tenantIdResolver: (meta) => meta?.request?.tenantId || 'default'
  }
});
```

## Performance

- **Fire-and-forget writes**: Chronos persistence is non-blocking by default
- **In-flight limits**: Configurable `maxInFlight` prevents memory issues
- **Graceful degradation**: Drops writes when limits are exceeded
- **Optional flush**: Use `flush()` for graceful shutdown

```typescript
// Graceful shutdown
await xlogger.flush({ timeoutMs: 3000 });
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev

# Run tests
npm test

# Lint
npm run lint
```

## License

MIT
