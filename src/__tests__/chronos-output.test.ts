import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChronosOutput } from '../outputs/chronos-output';
import type { LoggerPackageConfig, XLoggerChronosOptions, XLoggerLogMeta } from '../types';

// Mock chronos-db
const mockChronos = {
  with: vi.fn().mockReturnValue({
    create: vi.fn().mockResolvedValue({})
  })
};

vi.mock('chronos-db', () => ({
  initChronos: vi.fn().mockReturnValue(mockChronos)
}));

describe('ChronosOutput', () => {
  const pkg: LoggerPackageConfig = {
    packageName: 'test-package'
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
    collection: 'logs'
  };

  let chronosOutput: ChronosOutput;

  beforeEach(() => {
    vi.clearAllMocks();
    chronosOutput = new ChronosOutput(pkg, chronosConfig);
  });

  it('should create a record with correct structure', () => {
    const record = (chronosOutput as any).toRecord('info', 'test message', {
      source: 'application',
      correlationId: 'test-123',
      tenantId: 'tenant-a',
      customField: 'custom-value'
    });

    expect(record).toEqual({
      ts: expect.any(String),
      level: 'info',
      message: 'test message',
      package: 'test-package',
      service: 'test-package',
      env: process.env.NODE_ENV || 'production',
      source: 'application',
      correlationId: 'test-123',
      tenantId: 'tenant-a',
      meta: {
        source: 'application',
        correlationId: 'test-123',
        tenantId: 'tenant-a',
        customField: 'custom-value'
      }
    });
  });

  it('should skip writing when source is chronos-db', () => {
    const writeSpy = vi.spyOn(chronosOutput as any, 'ops').mockReturnValue({
      create: vi.fn()
    });

    chronosOutput.write('info', 'test message', { source: 'chronos-db' });

    expect(writeSpy).not.toHaveBeenCalled();
  });

  it('should write to chronos when source is not chronos-db', async () => {
    const mockOps = {
      create: vi.fn().mockResolvedValue({})
    };
    vi.spyOn(chronosOutput as any, 'ops').mockResolvedValue(mockOps);

    chronosOutput.write('info', 'test message', { source: 'application' });

    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockOps.create).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'test message',
        source: 'application',
        package: 'test-package',
        service: 'test-package'
      }),
      'application',
      'log:info'
    );
  });

  it('should handle tenantId resolution', () => {
    const tenantIdResolver = vi.fn().mockReturnValue('resolved-tenant');
    const configWithResolver = {
      ...chronosConfig,
      tenantIdResolver
    };

    const output = new ChronosOutput(pkg, configWithResolver);
    const record = (output as any).toRecord('info', 'test', { customField: 'value' });

    expect(tenantIdResolver).toHaveBeenCalledWith({ customField: 'value' });
    expect(record.tenantId).toBe('resolved-tenant');
  });

  it('should sanitize meta by removing _routing', () => {
    const record = (chronosOutput as any).toRecord('info', 'test', {
      _routing: { blockOutputs: ['console'] },
      customField: 'value'
    });

    expect(record.meta).toEqual({
      customField: 'value'
    });
  });

  it('should respect maxInFlight limit', async () => {
    const configWithLowLimit = {
      ...chronosConfig,
      maxInFlight: 1,
      fireAndForget: false
    };

    const output = new ChronosOutput(pkg, configWithLowLimit);
    const mockOps = {
      create: vi.fn().mockResolvedValue({})
    };
    vi.spyOn(output as any, 'ops').mockResolvedValue(mockOps);

    // First write should go through
    output.write('info', 'message1');
    
    // Second write should be dropped due to maxInFlight limit (before first completes)
    output.write('info', 'message2');
    
    // Wait for any async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Only the first write should have executed
    expect(mockOps.create).toHaveBeenCalledTimes(1);
    expect(mockOps.create).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'message1'
      }),
      expect.any(String),
      'log:info'
    );
  });
});
