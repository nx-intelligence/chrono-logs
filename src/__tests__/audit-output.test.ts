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
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockChronos.with).toHaveBeenCalledWith({
      databaseType: 'logs',
      collection: 'auditlogs'
    });

    const createCall = mockChronos.with().create;
    
    // Should have 4 calls: 1 audit + 3 aggregations (user, ip, activity-type)
    expect(createCall).toHaveBeenCalledTimes(4);
    
    // Check audit record (first call)
    expect(createCall).toHaveBeenNthCalledWith(1,
      expect.objectContaining({
        type: 'audit',
        appId: 'web-app',
        userId: 'user-123',
        action: 'login',
        resource: 'auth',
        outcome: 'success',
        severity: 'info',
        tags: ['authentication'],
        context: [],
        data: { ip: '203.0.113.4' },
        activityRef: undefined,
        durationMs: undefined,
        endAt: undefined,
        service: 'test-package',
        tenantId: 'tenant-a',
        correlationId: 'req-123'
      }),
      'application',
      'audit:create'
    );
    
    // Check user aggregation (second call)
    expect(createCall).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        type: 'user-aggregate',
        appId: 'web-app',
        userId: 'user-123',
        tenantId: undefined,
        key: 'web-app:user-123:tenant-a'
      }),
      'test-package',
      'user:create'
    );
    
    // Check IP aggregation (third call)
    expect(createCall).toHaveBeenNthCalledWith(3,
      expect.objectContaining({
        type: 'ip-aggregate',
        ip: '203.0.113.4',
        tenantId: undefined,
        key: '203.0.113.4:tenant-a'
      }),
      'test-package',
      'ip:create'
    );
    
    // Check activity-type aggregation (fourth call)
    expect(createCall).toHaveBeenNthCalledWith(4,
      expect.objectContaining({
        type: 'activity-type-aggregate',
        activityType: 'login',
        tenantId: undefined,
        key: 'login:tenant-a'
      }),
      'test-package',
      'activity-type:create'
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
    await new Promise(resolve => setTimeout(resolve, 50));

    const createCall = mockChronos.with().create;
    
    // Should have 3 calls: 1 audit + 2 aggregations (user, activity-type)
    expect(createCall).toHaveBeenCalledTimes(3);
    
    // Check audit record (first call)
    expect(createCall).toHaveBeenNthCalledWith(1,
      expect.objectContaining({
        type: 'audit',
        appId: 'web-app',
        userId: 'user-123',
        action: 'generate-report',
        activityRef: { jobId: 'job-42' },
        tenantId: 'tenant-a'
      }),
      'application',
      'audit:create'
    );
    
    // Check user aggregation (second call)
    expect(createCall).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        type: 'user-aggregate',
        appId: 'web-app',
        userId: 'user-123',
        tenantId: undefined,
        key: 'web-app:user-123:tenant-a'
      }),
      'test-package',
      'user:create'
    );
    
    // Check activity-type aggregation (third call)
    expect(createCall).toHaveBeenNthCalledWith(3,
      expect.objectContaining({
        type: 'activity-type-aggregate',
        activityType: 'generate-report',
        tenantId: undefined,
        key: 'generate-report:tenant-a'
      }),
      'test-package',
      'activity-type:create'
    );
  });

  it('should support flush operation', async () => {
    const flushPromise = auditOutput.flush({ timeoutMs: 1000 });
    
    expect(flushPromise).toBeInstanceOf(Promise);
    await expect(flushPromise).resolves.toBeUndefined();
  });
});
