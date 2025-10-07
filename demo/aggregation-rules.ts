import { createXLogger } from '../src';
import type { AggregationRule, EventRule } from '../src/types';

/**
 * Aggregation Rules Demo
 * 
 * Aggregation rules analyze event patterns over time for specific entities:
 * - Track how many events occurred for a user/IP/machine/domain in a time period
 * - Trigger alerts when thresholds are exceeded
 * - Use event rule output (risks/insights) as input for more sophisticated analysis
 * 
 * This enables detection of:
 * - Brute force attacks (multiple failed logins)
 * - Data exfiltration (excessive exports by one user)
 * - Distributed attacks (many requests from one IP)
 * - Compliance violations (repeated access to sensitive data)
 */

// Event rules that feed into aggregation rules
const eventRules: EventRule[] = [
  {
    id: 'failed-login',
    name: 'Failed Login',
    enabled: true,
    conditions: [
      { field: 'action', operator: 'equals', value: 'login' },
      { field: 'outcome', operator: 'equals', value: 'failure' }
    ],
    output: {
      type: 'risk',
      severity: 'medium',
      text: 'Failed login attempt'
    }
  },
  {
    id: 'data-export',
    name: 'Data Export',
    enabled: true,
    conditions: [
      { field: 'action', operator: 'equals', value: 'export' }
    ],
    output: {
      type: 'insight',
      text: 'Data export performed'
    }
  }
];

// Aggregation rules for pattern detection
const aggregationRules: AggregationRule[] = [
  // Detect brute force attacks: 5+ failed logins in 1 minute
  {
    id: 'brute-force-detection',
    name: 'Brute Force Attack Detection',
    description: 'Detects multiple failed login attempts from same user',
    enabled: true,
    entityProperty: 'userId',
    period: 'minute',
    threshold: 5,
    conditions: [
      { field: 'risks', operator: 'exists' },
      { field: 'action', operator: 'equals', value: 'login' }
    ],
    output: {
      type: 'risk',
      severity: 'critical',
      text: 'BRUTE FORCE ATTACK: {count} failed login attempts for user {entity} in last {period}'
    }
  },

  // Detect data exfiltration: 10+ exports in 1 hour
  {
    id: 'data-exfiltration-detection',
    name: 'Data Exfiltration Detection',
    description: 'Detects excessive data exports by single user',
    enabled: true,
    entityProperty: 'userId',
    period: 'hour',
    threshold: 10,
    conditions: [
      { field: 'action', operator: 'equals', value: 'export' }
    ],
    output: {
      type: 'risk',
      severity: 'high',
      text: 'POSSIBLE DATA EXFILTRATION: {count} exports by user {entity} in last {period}'
    }
  },

  // Detect DDoS: 100+ requests from same IP in 1 minute
  {
    id: 'ddos-detection',
    name: 'DDoS Attack Detection',
    description: 'Detects excessive requests from single IP',
    enabled: true,
    entityProperty: 'data.ip',
    period: 'minute',
    threshold: 100,
    output: {
      type: 'risk',
      severity: 'critical',
      text: 'POSSIBLE DDOS: {count} requests from IP {entity} in last {period}'
    }
  },

  // Track high-frequency user activity (insight, not risk)
  {
    id: 'high-activity-user',
    name: 'High Activity User',
    description: 'Tracks users with high activity for capacity planning',
    enabled: true,
    entityProperty: 'userId',
    period: 'hour',
    threshold: 50,
    output: {
      type: 'insight',
      text: 'High activity user: {count} actions by {entity} in last {period}',
      metadata: {
        category: 'capacity-planning'
      }
    }
  },

  // Detect repeated sensitive access: 20+ sensitive resource accesses in 1 day
  {
    id: 'excessive-sensitive-access',
    name: 'Excessive Sensitive Resource Access',
    description: 'Detects repeated access to sensitive resources',
    enabled: true,
    entityProperty: 'userId',
    period: 'day',
    threshold: 20,
    conditions: [
      { field: 'resource', operator: 'contains', value: 'sensitive' }
    ],
    output: {
      type: 'risk',
      severity: 'medium',
      text: 'COMPLIANCE ALERT: {count} accesses to sensitive resources by {entity} in last {period}'
    }
  }
];

// Create logger with both event and aggregation rules
const logger = createXLogger(
  { packageName: 'aggregation-rules-demo' },
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
      rules: {
        eventRules,
        aggregationRules,
        entityPropertyMap: {
          userId: 'users',
          'data.ip': 'ips'
        }
      }
    }
  }
);

// Demo function
async function runAggregationRulesDemo() {
  console.log('\n=== Aggregation Rules Demo ===\n');

  // Simulate brute force attack: 6 failed logins in quick succession
  console.log('1. Simulating brute force attack (6 failed logins)...');
  for (let i = 0; i < 6; i++) {
    logger.logAudit({
      appId: 'web-app',
      userId: 'attacker-user',
      action: 'login',
      resource: 'auth',
      outcome: 'failure',
      data: { ip: '192.0.2.100', attempt: i + 1 }
    }, {
      tenantId: 'tenant-a',
      correlationId: `brute-force-${i}`
    });
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between attempts
  }

  // Simulate data exfiltration: 12 exports
  console.log('\n2. Simulating data exfiltration (12 exports)...');
  for (let i = 0; i < 12; i++) {
    logger.logAudit({
      appId: 'data-app',
      userId: 'suspicious-user',
      action: 'export',
      resource: 'customer-data',
      outcome: 'success',
      data: { recordCount: 1000 + i * 100 }
    }, {
      tenantId: 'tenant-a',
      correlationId: `export-${i}`
    });
  }

  // Simulate high-frequency normal user
  console.log('\n3. Simulating high-activity user (60 actions)...');
  for (let i = 0; i < 60; i++) {
    logger.logAudit({
      appId: 'web-app',
      userId: 'power-user',
      action: 'read',
      resource: 'documents',
      outcome: 'success'
    }, {
      tenantId: 'tenant-a',
      correlationId: `high-activity-${i}`
    });
  }

  // Flush and wait for aggregation processing
  console.log('\n4. Flushing logs and processing aggregations...');
  await logger.flush({ timeoutMs: 10000 });

  console.log('\n=== Aggregation Rules Demo Complete ===');
  console.log('Check MongoDB collections:');
  console.log('- audit_logs: Contains enriched events with risks/insights');
  console.log('- users: Contains aggregation alerts for brute-force and exfiltration');
  console.log('- ips: Contains aggregation alerts for DDoS patterns\n');
}

// Run the demo
runAggregationRulesDemo().catch(console.error);

export { logger, eventRules, aggregationRules };
