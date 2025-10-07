import { createXLogger } from 'chrono-logs';
import type { LoggerPackageConfig, XLoggerConfig } from 'chrono-logs';

// MongoDB Integration Example
// This example shows how to configure chrono-logs with MongoDB using Chronos-DB v2.0

const pkg: LoggerPackageConfig = {
  packageName: 'my-app',
  envPrefix: 'MY_APP'
};

const config: XLoggerConfig = {
  gateway: {
    logToConsole: true,
    logLevel: 'info',
    logToFile: false
  },
  chronos: {
    chronosConfig: {
      databases: {
        logs: {
          dbConnRef: 'mongodb://localhost:27017',
          spaceConnRef: 'mongodb://localhost:27017',
          bucket: 'logs',
          dbName: 'my_app_logs'
        }
      }
    },
    collection: 'logs',
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
    maxInFlight: 100,
    fireAndForget: true,
    aggregations: {
      enabled: true,
      resolvers: {
        ip: (event) => event.data?.ip || event.data?.clientIp,
        machine: (event) => event.data?.machine || event.data?.hostname,
        domain: (event) => event.data?.domain || event.data?.host
      },
      readModifyWriteCounters: true,
      limits: {
        maxSetSize: 1000
      }
    },
    activityLinking: {
      enabled: true,
      strategy: 'both' // 'jobId' | 'correlationId' | 'both'
    },
    transforms: {
      audit: (record, meta) => {
        // Custom transform for audit records
        return {
          ...record,
          customField: 'transformed',
          timestamp: new Date().toISOString()
        };
      }
    }
  }
};

// Create the logger
const logger = createXLogger(pkg, config);

// Example usage
async function example() {
  // Standard logging
  logger.info('Application started', { 
    tenantId: 'tenant-123',
    correlationId: 'req-456',
    source: 'application'
  });

  // AI Activity logging
  logger.logActivityRequest({
    jobId: 'job-789',
    request: { prompt: 'Generate a summary' },
    context: { userTier: 'premium' },
    model: 'gpt-4',
    provider: 'openai',
    userId: 'user-123',
    requestStatus: 'accepted'
  }, { 
    tenantId: 'tenant-123',
    correlationId: 'req-456'
  });

  // AI Activity response
  logger.logActivityResponse({
    jobId: 'job-789',
    response: { text: 'Generated summary...' },
    cost: { tokens: 150, usd: 0.02 },
    responseStatus: 'completed'
  }, { 
    tenantId: 'tenant-123',
    correlationId: 'req-456'
  });

  // Audit logging
  logger.logAudit({
    appId: 'my-app',
    userId: 'user-123',
    action: 'data-export',
    resource: 'user-data',
    outcome: 'success',
    severity: 'info',
    tags: ['data', 'export'],
    data: { 
      recordCount: 1000,
      ip: '203.0.113.4',
      machine: 'server-01'
    }
  }, { 
    tenantId: 'tenant-123',
    correlationId: 'req-456'
  });

  // Flush before shutdown
  await logger.flush({ timeoutMs: 5000 });
  console.log('All logs flushed successfully');
}

// Run example
example().catch(console.error);

export { logger, config };
