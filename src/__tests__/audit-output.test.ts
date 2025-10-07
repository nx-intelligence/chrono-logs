import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditOutput } from '../outputs/audit-output';
import type { LoggerPackageConfig, XLoggerChronosOptions, XLoggerLogMeta, AuditEvent } from '../types';

// Mock chronos-db
const mockChronos = {
  with: vi.fn().mockReturnValue({
    create: vi.fn().mockResolvedValue({ id: 'audit-123' }),
    enrich: vi.fn().mockResolvedValue({}),
    listByMeta: vi.fn().mockResolvedValue([])
  })
};

vi.mock('chronos-db', () => ({
  initChronos: vi.fn().mockReturnValue(mockChronos)
}));

describe('AuditOutput', () => {
  const pkg: LoggerPackageConfig = {
    packageName: 'test-package',
    envPrefix: 'TEST'
  };

  const chronosConfig: XLoggerChronosOptions = {
    chronosConfig: {
      databases: {
        logs: {
          dbConnRef: 'test-db',
          spaceConnRef: 'test-space',
          bucket: 'test-bucket',
          dbName: 'test_db'
        }
      }
    },
    collections: {
      auditlogs: 'auditlogs',
      users: 'users',
      ips: 'ips',
      machines: 'machines',
      domains: 'domains',
      activityTypes: 'activity_types'
    },
    aggregations: {
      enabled: true,
      resolvers: {
        ip: (event) => event.data?.ip,
        machine: (event) => event.data?.machine,
        domain: (event) => event.data?.domain
      }
    },
    activityLinking: {
      enabled: true,
      strategy: 'both'
    }
  };

  let auditOutput: AuditOutput;

  beforeEach(() => {
    vi.clearAllMocks();
    auditOutput = new AuditOutput(pkg, chronosConfig);
  });

  it('should log audit event with correct structure', async () => {
    const event: AuditEvent = {
      appId: 'web-app',
      userId: 'user-123',
      action: 'login',
      resource: 'auth',
      outcome: 'success',
      severity: 'info',
      tags: ['authentication'],
      data: { ip: '203.0.113.4' }
    };

    const meta: XLoggerLogMeta = {
      tenantId: 'tenant-a',
      correlationId: 'req-123'
    };

    auditOutput.logAudit(event, meta);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockChronos.with).toHaveBeenCalledWith({
      databaseType: 'logs',
      collection: 'auditlogs'
    });

    const createCall = mockChronos.with().create;
    expect(createCall).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'audit',
        appId: 'web-app',
        userId: 'user-123',
        action: 'login',
        resource: 'auth',
        outcome: 'success',
        severity: 'info',
        tags: ['authentication'],
        service: 'test-package',
        tenantId: 'tenant-a',
        correlationId: 'req-123'
      }),
      'test-package',
      'audit:create'
    );
  });

  it('should skip audit logging when source is chronos-db', () => {
    const event: AuditEvent = {
      appId: 'web-app',
      userId: 'user-123',
      action: 'test'
    };

    auditOutput.logAudit(event, { source: 'chronos-db' });

    // Should not call chronos
    expect(mockChronos.with).not.toHaveBeenCalled();
  });

  it('should handle audit event with activity reference', async () => {
    const event: AuditEvent = {
      appId: 'web-app',
      userId: 'user-123',
      action: 'generate-report',
      activityRef: { jobId: 'job-42' }
    };

    auditOutput.logAudit(event, { tenantId: 'tenant-a' });

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 10));

    const createCall = mockChronos.with().create;
    expect(createCall).toHaveBeenCalledWith(
      expect.objectContaining({
        activityRef: { jobId: 'job-42' }
      }),
      'test-package',
      'audit:create'
    );
  });

  it('should support flush operation', async () => {
    const flushPromise = auditOutput.flush({ timeoutMs: 1000 });
    
    expect(flushPromise).toBeInstanceOf(Promise);
    await expect(flushPromise).resolves.toBeUndefined();
  });
});
