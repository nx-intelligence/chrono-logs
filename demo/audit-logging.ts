import { createXLogger } from '../src';

/**
 * Audit Logging Demo
 * 
 * Demonstrates the audit logging capabilities of chrono-logs
 */

const logger = createXLogger(
  { packageName: 'audit-demo' },
  {
    gateway: {
      logToConsole: true,
      logLevel: 'info'
    },
    chronos: {
      chronosConfig: {
        databases: {
          logs: {
            dbConnRef: process.env.MONGO_URI || 'mongodb://localhost:27017',
            spaceConnRef: process.env.MONGO_URI || 'mongodb://localhost:27017',
            bucket: 'logs',
            dbName: 'chrono_logs_demo'
          }
        }
      },
      collections: {
        auditlogs: 'audit_logs',
        users: 'users',
        ips: 'ips'
      },
      aggregations: {
        enabled: true,
        resolvers: {
          ip: (event) => event.data?.ip
        }
      }
    }
  }
);

async function runAuditDemo() {
  console.log('\n=== Audit Logging Demo ===\n');

  // User login
  logger.logAudit({
    appId: 'web-app',
    userId: 'user-123',
    action: 'login',
    resource: 'auth',
    outcome: 'success',
    severity: 'info',
    data: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0' }
  }, { tenantId: 'tenant-a', correlationId: 'audit-001' });

  // Data access
  logger.logAudit({
    appId: 'web-app',
    userId: 'user-123',
    action: 'read',
    resource: 'customer-records',
    outcome: 'success',
    data: { recordCount: 50 }
  }, { tenantId: 'tenant-a', correlationId: 'audit-002' });

  // Data modification
  logger.logAudit({
    appId: 'admin-portal',
    userId: 'admin-456',
    action: 'update',
    resource: 'user-permissions',
    target: 'user-789',
    outcome: 'success',
    tags: ['security', 'permissions']
  }, { tenantId: 'tenant-a', correlationId: 'audit-003' });

  await logger.flush({ timeoutMs: 5000 });
  console.log('\n=== Audit Demo Complete ===\n');
}

runAuditDemo().catch(console.error);

export { logger };
