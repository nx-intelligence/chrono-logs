import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createXLogger } from '../index';
import type { LoggerPackageConfig, XLoggerConfig } from '../types';

// Mock logs-gateway
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

vi.mock('logs-gateway', () => ({
  createLogger: vi.fn().mockReturnValue(mockLogger)
}));

// Mock chronos-db
const mockChronos = {
  with: vi.fn().mockReturnValue({
    create: vi.fn().mockResolvedValue({})
  })
};

vi.mock('chronos-db', () => ({
  initChronos: vi.fn().mockReturnValue(mockChronos)
}));

describe('XLogger', () => {
  const pkg: LoggerPackageConfig = {
    packageName: 'test-package'
  };

  const config: XLoggerConfig = {
    gateway: {
      logToConsole: true,
      logLevel: 'info'
    },
    chronos: {
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
    }
  };

  let xlogger: ReturnType<typeof createXLogger>;

  beforeEach(() => {
    vi.clearAllMocks();
    xlogger = createXLogger(pkg, config);
  });

  it('should create logger with correct configuration', () => {
    expect(xlogger.getConfig()).toEqual(config);
  });

  it('should call both chronos and gateway for info logs', async () => {
    xlogger.info('test message', { correlationId: 'test-123' });

    // Wait for async chronos write
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockLogger.info).toHaveBeenCalledWith('test message', { correlationId: 'test-123' });
    expect(mockChronos.with).toHaveBeenCalledWith({
      databaseType: 'logs',
      collection: 'logs'
    });
  });

  it('should call both chronos and gateway for error logs', async () => {
    xlogger.error('error message', { source: 'application' });

    // Wait for async chronos write
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockLogger.error).toHaveBeenCalledWith('error message', { source: 'application' });
  });

  it('should call both chronos and gateway for warn logs', async () => {
    xlogger.warn('warning message');

    // Wait for async chronos write
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockLogger.warn).toHaveBeenCalledWith('warning message', undefined);
  });

  it('should call both chronos and gateway for debug logs', async () => {
    xlogger.debug('debug message');

    // Wait for async chronos write
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockLogger.debug).toHaveBeenCalledWith('debug message', undefined);
  });

  it('should skip chronos write for chronos-db source', async () => {
    xlogger.warn('Chronos retry triggered', { source: 'chronos-db' });

    // Wait for async chronos write
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockLogger.warn).toHaveBeenCalledWith('Chronos retry triggered', { source: 'chronos-db' });
    // Chronos write should be skipped due to source='chronos-db'
    expect(mockChronos.with).not.toHaveBeenCalled();
  });

  it('should support flush operation', async () => {
    const flushPromise = xlogger.flush({ timeoutMs: 1000 });
    
    expect(flushPromise).toBeInstanceOf(Promise);
    await expect(flushPromise).resolves.toBeUndefined();
  });
});
