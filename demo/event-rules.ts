import { createXLogger } from '../src';
import type { EventRule } from '../src/types';

/**
 * Event Rules Demo
 * 
 * Event rules operate on individual log/audit events and enrich them with:
 * - Risk objects: Security/compliance concerns with severity levels
 * - Insight objects: Informational enrichments without severity
 * 
 * Rules use conditions (AND/OR logic) to match events and automatically
 * add metadata that can be queried later.
 */

// Define event rules
const eventRules: EventRule[] = [
  // RISK RULE: Detect failed login attempts
  {
    id: 'failed-login-risk',
    name: 'Failed Login Attempt',
    description: 'Flags failed authentication attempts as security risks',
    enabled: true,
    conditions: [
      { field: 'action', operator: 'equals', value: 'login' },
      { field: 'outcome', operator: 'equals', value: 'failure' }
    ],
    conditionLogic: 'AND',
    output: {
      type: 'risk',
      severity: 'medium',
      text: 'Failed login attempt detected - possible brute force attack'
    }
  },

  // RISK RULE: Detect access to sensitive resources
  {
    id: 'sensitive-resource-access',
    name: 'Sensitive Resource Access',
    description: 'Flags access to sensitive resources for audit',
    enabled: true,
    conditions: [
      { field: 'resource', operator: 'in', value: ['user-pii', 'financial-data', 'admin-panel'] },
      { field: 'outcome', operator: 'equals', value: 'success' }
    ],
    conditionLogic: 'AND',
    output: {
      type: 'risk',
      severity: 'low',
      text: 'Access to sensitive resource - review for compliance'
    }
  },

  // RISK RULE: Detect unauthorized access attempts
  {
    id: 'unauthorized-access',
    name: 'Unauthorized Access Attempt',
    description: 'Flags unauthorized access attempts',
    enabled: true,
    conditions: [
      { field: 'outcome', operator: 'equals', value: 'failure' },
      { field: 'action', operator: 'in', value: ['access', 'read', 'write', 'delete'] }
    ],
    conditionLogic: 'AND',
    output: {
      type: 'risk',
      severity: 'high',
      text: 'Unauthorized access attempt - investigate immediately'
    }
  },

  // RISK RULE: Detect errors in critical operations
  {
    id: 'critical-operation-error',
    name: 'Critical Operation Error',
    description: 'Flags errors in critical system operations',
    enabled: true,
    conditions: [
      { field: 'level', operator: 'equals', value: 'error' },
      { field: 'message', operator: 'contains', value: 'critical' }
    ],
    conditionLogic: 'AND',
    output: {
      type: 'risk',
      severity: 'critical',
      text: 'Critical system error detected - immediate action required'
    }
  },

  // INSIGHT RULE: Track data exports
  {
    id: 'data-export-insight',
    name: 'Data Export Activity',
    description: 'Tracks data export operations for compliance reporting',
    enabled: true,
    conditions: [
      { field: 'action', operator: 'in', value: ['export', 'download', 'backup'] }
    ],
    output: {
      type: 'insight',
      text: 'Data export operation performed',
      metadata: {
        category: 'compliance',
        auditRequired: true
      }
    }
  },

  // INSIGHT RULE: Track admin actions
  {
    id: 'admin-action-insight',
    name: 'Administrative Action',
    description: 'Tracks all administrative actions for security review',
    enabled: true,
    conditions: [
      { field: 'resource', operator: 'startsWith', value: 'admin' }
    ],
    output: {
      type: 'insight',
      text: 'Administrative action performed',
      metadata: {
        category: 'security',
        reviewRequired: true
      }
    }
  },

  // INSIGHT RULE: Track high-value transactions
  {
    id: 'high-value-transaction',
    name: 'High Value Transaction',
    description: 'Tracks transactions over $10,000',
    enabled: true,
    conditions: [
      { field: 'data.amount', operator: 'gte', value: 10000 },
      { field: 'action', operator: 'equals', value: 'transaction' }
    ],
    conditionLogic: 'AND',
    output: {
      type: 'insight',
      text: 'High-value transaction processed',
      metadata: {
        category: 'finance',
        notifyCompliance: true
      }
    }
  },

  // RISK RULE: Detect suspicious IP addresses
  {
    id: 'suspicious-ip-risk',
    name: 'Suspicious IP Address',
    description: 'Flags activity from known suspicious IP ranges',
    enabled: true,
    conditions: [
      {
        field: 'data.ip',
        operator: 'regex',
        value: '^(192\\.0\\.2\\.|198\\.51\\.100\\.|203\\.0\\.113\\.)' // Example suspicious IPs
      }
    ],
    output: {
      type: 'risk',
      severity: 'high',
      text: 'Activity from suspicious IP address detected'
    }
  }
];

// Create logger with event rules
const logger = createXLogger(
  { packageName: 'event-rules-demo' },
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
        logs: 'logs',
        auditlogs: 'audit_logs'
      },
      rules: {
        eventRules
      }
    }
  }
);

// Demo function to test event rules
async function runEventRulesDemo() {
  console.log('\n=== Event Rules Demo ===\n');

  // Example 1: Failed login (should trigger RISK)
  console.log('1. Logging failed login attempt...');
  logger.logAudit({
    appId: 'web-app',
    userId: 'user-123',
    action: 'login',
    resource: 'auth',
    outcome: 'failure',
    data: { ip: '192.0.2.15', reason: 'invalid password' }
  }, {
    tenantId: 'tenant-a',
    correlationId: 'req-001'
  });

  // Example 2: Access to sensitive resource (should trigger RISK)
  console.log('2. Logging access to sensitive resource...');
  logger.logAudit({
    appId: 'web-app',
    userId: 'admin-456',
    action: 'access',
    resource: 'user-pii',
    outcome: 'success',
    data: { recordCount: 150 }
  }, {
    tenantId: 'tenant-a',
    correlationId: 'req-002'
  });

  // Example 3: Data export (should trigger INSIGHT)
  console.log('3. Logging data export...');
  logger.logAudit({
    appId: 'web-app',
    userId: 'user-789',
    action: 'export',
    resource: 'user-data',
    outcome: 'success',
    data: { format: 'csv', recordCount: 5000 }
  }, {
    tenantId: 'tenant-a',
    correlationId: 'req-003'
  });

  // Example 4: High-value transaction (should trigger INSIGHT)
  console.log('4. Logging high-value transaction...');
  logger.logAudit({
    appId: 'payment-app',
    userId: 'user-321',
    action: 'transaction',
    resource: 'payment',
    outcome: 'success',
    data: { amount: 25000, currency: 'USD', type: 'wire-transfer' }
  }, {
    tenantId: 'tenant-b',
    correlationId: 'req-004'
  });

  // Example 5: Critical error in logs (should trigger RISK)
  console.log('5. Logging critical error...');
  logger.error('Critical database connection failure - immediate action required', {
    tenantId: 'tenant-a',
    correlationId: 'req-005'
  });

  // Example 6: Admin action (should trigger INSIGHT)
  console.log('6. Logging admin action...');
  logger.logAudit({
    appId: 'admin-portal',
    userId: 'admin-001',
    action: 'update',
    resource: 'admin-settings',
    outcome: 'success',
    data: { setting: 'max_upload_size', newValue: '100MB' }
  }, {
    tenantId: 'tenant-a',
    correlationId: 'req-006'
  });

  // Example 7: Unauthorized access (should trigger HIGH RISK)
  console.log('7. Logging unauthorized access attempt...');
  logger.logAudit({
    appId: 'web-app',
    userId: 'unknown-user',
    action: 'delete',
    resource: 'user-account',
    outcome: 'failure',
    data: { reason: 'insufficient permissions', attemptedUserId: 'admin-001' }
  }, {
    tenantId: 'tenant-a',
    correlationId: 'req-007'
  });

  // Example 8: Activity from suspicious IP (should trigger RISK)
  console.log('8. Logging activity from suspicious IP...');
  logger.logAudit({
    appId: 'web-app',
    userId: 'user-999',
    action: 'login',
    resource: 'auth',
    outcome: 'success',
    data: { ip: '203.0.113.45', location: 'Unknown' }
  }, {
    tenantId: 'tenant-a',
    correlationId: 'req-008'
  });

  // Flush to ensure all logs are persisted
  console.log('\n9. Flushing logs to database...');
  await logger.flush({ timeoutMs: 5000 });

  console.log('\n=== Event Rules Demo Complete ===');
  console.log('Check your MongoDB for enriched audit logs with risks[] and insights[] arrays\n');
}

// Run the demo
runEventRulesDemo().catch(console.error);

export { logger, eventRules };
