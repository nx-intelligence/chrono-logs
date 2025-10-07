# nx-logging

A thin wrapper around `logs-gateway` that adds Chronos-DB v2.0 persistence into a dedicated logs collection, with strict recursion safety and tenant/correlation propagation.

## What nx-logging adds

- **Chronos persistence**: Writes each log to Chronos-DB v2.0 under `databaseType=logs` with configurable collections
- **AI Activity logging**: Specialized logging for AI requests/responses with job binding and status tracking
- **Audit logging**: Enterprise-grade audit trails with user activity tracking and compliance features
- **Real-time aggregations**: On-write aggregations for users, IPs, machines, domains, and activity types
- **Activity linking**: Automatic linking between audit events and AI activities via jobId/correlationId
- **Multi-tenant metadata**: Optional `tenantId` propagation stored on each log record
- **Correlation + source**: First-class fields for `correlationId` and `source`, persisted with the log
- **Recursion safety**: Never persists logs that originate from `source='chronos-db'`; never re-log persistence errors to Chronos
- **Backward compatibility**: Same logger methods (`debug`, `info`, `warn`, `error`) and keeps your unified logger/console/file outputs from logs-gateway
- **JSON-only Chronos config**: Accept a `ChronosConfig` object or a pre-initialized instance—no envs
- **Configurable collections**: Separate collections for logs, activities, errors, audit logs, and aggregations

## Installation

```bash
npm install nx-logging chronos-db logs-gateway
```

## Quick Start

```typescript
import { createXLogger } from 'nx-logging';

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
      errors: 'errors',
      auditlogs: 'auditlogs',
      users: 'users',
      ips: 'ips',
      machines: 'machines',
      domains: 'domains',
      activityTypes: 'activity_types'
    },
    unboundResponseHandling: 'both', // store in activities (missingStart) and errors
    aggregations: {
      enabled: true,
      resolvers: {
        ip: (event, meta) => event.data?.ip,
        machine: (event, meta) => event.data?.machine,
        domain: (event, meta) => event.data?.domain
      }
    },
    activityLinking: {
      enabled: true,
      strategy: 'both' // try jobId then correlationId
    },
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

// Audit logging for user actions
xlogger.logAudit({
  appId: 'web-app',
  userId: 'user-123',
  action: 'export',
  resource: 'report',
  target: { id: 'rep-123', type: 'report' },
  outcome: 'success',
  severity: 'info',
  tags: ['export', 'reporting'],
  context: ['EU', '2025Q4'],
  data: { format: 'csv', rows: 1203, ip: '203.0.113.4' },
  activityRef: { jobId: 'job-42' } // Link to AI activity
}, {
  tenantId: 'tenant-a',
  correlationId: 'req-1'
});
```

## MongoDB Integration

nx-logging integrates seamlessly with MongoDB through Chronos-DB v2.0. Here's how to configure it:

### Environment Variables

Set these environment variables for MongoDB connection:

```bash
export MONGO_URI="mongodb://localhost:27017"
export SPACE_ACCESS_KEY="your-access-key"
export SPACE_SECRET_KEY="your-secret-key"
export SPACE_END="your-space-endpoint"
```

### Configuration Example

```typescript
import { createXLogger } from 'nx-logging';

const config: XLoggerConfig = {
  gateway: {
    logToConsole: true,
    logLevel: 'info'
  },
  chronos: {
    chronosConfig: {
      databases: {
        logs: {
          dbConnRef: process.env.MONGO_URI!,
          spaceConnRef: process.env.MONGO_URI!,
          bucket: 'logs',
          dbName: 'my_app_logs'
        }
      }
    },
    collections: {
      logs: 'logs',
      activities: 'ai_activities',
      errors: 'ai_errors',
      auditlogs: 'audit_logs',
      users: 'user_aggregates',
      ips: 'ip_aggregates',
      machines: 'machine_aggregates',
      domains: 'domain_aggregates',
      activityTypes: 'activity_type_aggregates'
    },
    aggregations: {
      enabled: true,
      resolvers: {
        ip: (event) => event.data?.ip || event.data?.clientIp,
        machine: (event) => event.data?.machine || event.data?.hostname,
        domain: (event) => event.data?.domain || event.data?.host
      }
    },
    activityLinking: {
      enabled: true,
      strategy: 'both'
    }
  }
};

const logger = createXLogger({ packageName: 'my-app' }, config);
```

### MongoDB Collections

The package creates and manages these MongoDB collections:

- **logs**: Standard application logs
- **ai_activities**: AI request/response lifecycle
- **ai_errors**: AI activity errors
- **audit_logs**: Immutable audit trails
- **user_aggregates**: Real-time user activity summaries
- **ip_aggregates**: IP-based activity analytics
- **machine_aggregates**: Machine-level activity tracking
- **domain_aggregates**: Domain-based activity analysis
- **activity_type_aggregates**: Activity type statistics

### Performance Optimization

For high-throughput applications:

```typescript
const config: XLoggerConfig = {
  chronos: {
    maxInFlight: 1000,        // Increase concurrent writes
    fireAndForget: true,      // Non-blocking writes
    aggregations: {
      enabled: true,
      readModifyWriteCounters: true,  // Optimize aggregation updates
      limits: {
        maxSetSize: 5000      // Increase aggregation limits
      }
    }
  }
};
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

// Audit logging method
xlogger.logAudit(event: AuditEvent, meta?: XLoggerLogMeta): void;

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

### Audit Logs (auditlogs collection)

```typescript
{
  type: 'audit',
  appId: 'web-app',
  userId: 'user-42',
  action: 'export',
  resource: 'report',
  target: { id: 'rep-123', type: 'report' },
  outcome: 'success',
  severity: 'info',
  tags: ['export', 'reporting'],
  context: ['EU', '2025Q4'],
  data: { format: 'csv', rows: 1203, ip: '203.0.113.4' },
  occurredAt: '2025-01-07T12:34:56.789Z',
  endAt: '2025-01-07T12:35:02.000Z',
  durationMs: 5211,
  activityRef: { id: 'act_abc', jobId: 'job-42' },
  service: 'web-app',
  env: 'production',
  source: 'application',
  correlationId: 'req-999',
  tenantId: 'tenant-a'
}
```

### Aggregations (users, ips, machines, domains, activity_types collections)

**User Aggregates:**
```typescript
{
  type: 'user-aggregate',
  key: 'web-app:user-42:tenant-a',
  appId: 'web-app',
  userId: 'user-42',
  tenantId: 'tenant-a',
  totalEvents: 156,
  firstSeen: '2025-01-01T00:00:00.000Z',
  lastSeen: '2025-01-07T12:34:56.789Z',
  counts: {
    byAction: { 'login': 45, 'export': 12, 'delete': 3 }
  },
  tags: ['export', 'reporting', 'admin'],
  context: ['EU', '2025Q4', 'premium'],
  ips: ['203.0.113.4', '203.0.113.5'],
  machines: ['machine-001', 'machine-002']
}
```

**IP Aggregates:**
```typescript
{
  type: 'ip-aggregate',
  key: '203.0.113.4:tenant-a',
  ip: '203.0.113.4',
  tenantId: 'tenant-a',
  totalEvents: 89,
  firstSeen: '2025-01-01T00:00:00.000Z',
  lastSeen: '2025-01-07T12:34:56.789Z',
  counts: {
    byAction: { 'login': 23, 'export': 8 }
  },
  users: ['web-app:user-42', 'web-app:user-43'],
  apps: ['web-app', 'api-service']
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

## Audit Logging

x-logger provides comprehensive audit logging capabilities for enterprise security and compliance:

### Basic Audit Logging

```typescript
// Log user actions
xlogger.logAudit({
  appId: 'web-app',
  userId: 'user-123',
  action: 'login',
  resource: 'auth',
  outcome: 'success',
  severity: 'info',
  tags: ['authentication'],
  data: { ip: '203.0.113.4', userAgent: 'Mozilla/5.0...' }
}, {
  tenantId: 'tenant-a',
  correlationId: 'req-123'
});

// Log administrative actions
xlogger.logAudit({
  appId: 'admin-panel',
  userId: 'admin-456',
  action: 'delete',
  resource: 'user',
  target: { id: 'user-789', type: 'user' },
  outcome: 'success',
  severity: 'high',
  tags: ['admin', 'user-management'],
  data: { reason: 'policy-violation' }
}, {
  tenantId: 'tenant-a',
  correlationId: 'admin-req-456'
});
```

### Activity Linking

Link audit events to AI activities for end-to-end traceability:

```typescript
// AI activity request
xlogger.logActivityRequest({
  jobId: 'job-42',
  request: { prompt: 'Generate report' },
  model: 'gpt-4',
  provider: 'openai'
}, { tenantId: 'tenant-a', correlationId: 'req-42' });

// Audit event linked to AI activity
xlogger.logAudit({
  appId: 'web-app',
  userId: 'user-123',
  action: 'generate-report',
  resource: 'ai-service',
  outcome: 'success',
  activityRef: { jobId: 'job-42' } // Links to AI activity
}, {
  tenantId: 'tenant-a',
  correlationId: 'req-42' // Same correlation ID
});
```

### Real-time Aggregations

x-logger automatically maintains real-time aggregations for analytics:

```typescript
const xlogger = createXLogger(pkg, {
  // ... config
  chronos: {
    // ... chronos config
    aggregations: {
      enabled: true,
      resolvers: {
        ip: (event, meta) => event.data?.ip,
        machine: (event, meta) => event.data?.machine,
        domain: (event, meta) => event.data?.domain,
        activityType: (event, meta) => event.action
      },
      limits: {
        maxSetSize: 1000 // Prevent unbounded array growth
      }
    }
  }
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

## Recommended Chronos Collection Maps

For optimal performance and compliance, configure these indexes in your Chronos collectionMaps:

```typescript
const chronosConfig = {
  // ... your config
  collectionMaps: {
    logs: {
      indexedProps: ['tenantId', 'level', 'service', 'env', 'correlationId', 'ts'],
      validation: { requiredIndexed: ['level', 'service', 'ts'] }
    },
    activities: {
      indexedProps: ['jobId', 'correlationId', 'status', 'startTs', 'endTs', 'tenantId'],
      validation: { requiredIndexed: ['jobId', 'status'] }
    },
    errors: {
      indexedProps: ['jobId', 'responseStatus', 'reason', 'endTs', 'tenantId'],
      validation: { requiredIndexed: ['jobId', 'reason'] }
    },
    auditlogs: {
      indexedProps: ['appId', 'userId', 'action', 'occurredAt', 'tenantId', 'service', 'env', 'correlationId'],
      validation: { requiredIndexed: ['appId', 'userId', 'occurredAt'] }
    },
    users: {
      indexedProps: ['key.appId', 'key.userId', 'tenantId', 'lastSeen', 'firstSeen'],
      validation: { requiredIndexed: ['key.appId', 'key.userId'] }
    },
    ips: {
      indexedProps: ['ip', 'appId', 'tenantId', 'lastSeen'],
      validation: { requiredIndexed: ['ip', 'tenantId'] }
    },
    machines: {
      indexedProps: ['machine', 'appId', 'tenantId', 'lastSeen'],
      validation: { requiredIndexed: ['machine', 'tenantId'] }
    },
    domains: {
      indexedProps: ['domain', 'tenantId', 'lastSeen'],
      validation: { requiredIndexed: ['domain', 'tenantId'] }
    },
    activity_types: {
      indexedProps: ['activityType', 'tenantId', 'lastSeen'],
      validation: { requiredIndexed: ['activityType', 'tenantId'] }
    }
  }
};
```

## Security and Compliance

### Data Privacy
- **No PII processing**: x-logger performs no content transformation or PII detection
- **Application responsibility**: Teams must ensure sensitive content compliance
- **Tenant isolation**: All reads/writes scoped by tenantId for proper isolation

### Audit Trail Requirements
- **Immutable history**: Chronos-DB versioning and logical deletes enabled
- **Retention policies**: Set collection-specific retention (e.g., auditlogs: 365-730 days)
- **Access controls**: Separate IAM for writers vs. BI/compliance readers

### Compliance Features
- **Correlation tracking**: Full request tracing across services
- **Activity linking**: End-to-end visibility from user action to AI response
- **Real-time aggregations**: Immediate analytics for security monitoring
- **Bounded arrays**: Prevents unbounded growth in aggregate collections

## Deployment Guide

### 1. Chronos Configuration
```typescript
// Ensure databases.logs exists with S3 and Mongo connections
const chronosConfig = {
  dbConnections: { /* MongoDB connections */ },
  spacesConnections: { /* S3 connections */ },
  databases: {
    logs: {
      dbConnRef: 'mongo-logs',
      spaceConnRef: 's3-logs',
      bucket: 'chronos-logs',
      dbName: 'chronos_logs'
    }
  },
  collectionMaps: { /* indexes as shown above */ },
  logicalDelete: { enabled: true },
  versioning: { enabled: true },
  transactions: { enabled: true }
};
```

### 2. Install and Initialize
```bash
npm install nx-logging chronos-db logs-gateway
```

```typescript
import { createXLogger } from 'nx-logging';

const xlogger = createXLogger(
  { packageName: 'your-app', envPrefix: 'YOUR_APP' },
  {
    gateway: { /* logs-gateway config */ },
    chronos: {
      chronosConfig,
      collections: { /* collection names */ },
      aggregations: { /* aggregation config */ },
      activityLinking: { /* linking config */ },
      tenantIdResolver: (meta) => meta?.tenantId
    }
  }
);
```

### 3. Instrument Applications
```typescript
// Adopt shared action taxonomy
const ACTIONS = {
  LOGIN: 'login',
  EXPORT: 'export',
  DELETE: 'delete',
  AI_GENERATE: 'ai-generate'
} as const;

// Emit audit events at user-visible operations
xlogger.logAudit({
  appId: 'web-app',
  userId: user.id,
  action: ACTIONS.EXPORT,
  resource: 'report',
  target: { id: report.id, type: 'report' },
  outcome: 'success',
  severity: 'info',
  tags: ['export', 'reporting'],
  data: { format: 'pdf', pages: report.pages }
}, { tenantId: user.tenantId, correlationId: req.id });

// For AI flows, include jobId or correlationId
xlogger.logActivityRequest({
  jobId: generateJobId(),
  request: { prompt: userPrompt },
  model: 'gpt-4',
  provider: 'openai'
}, { tenantId: user.tenantId, correlationId: req.id });
```

### 4. Rollout Strategy
- **Phase 1**: auditlogs only (linking/aggregates disabled)
- **Phase 2**: enable activity linking
- **Phase 3**: enable aggregations; tune limits.maxSetSize

### 5. Monitoring
- Monitor write latency, error rate, dropped fan-outs
- Establish runbooks for dead-letter replay and aggregate backfill
- Set up alerting on auditlogs for unusual patterns

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
