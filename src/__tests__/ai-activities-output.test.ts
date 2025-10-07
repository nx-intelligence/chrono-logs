import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiActivitiesOutput } from '../outputs/ai-activities-output';
import type { LoggerPackageConfig, XLoggerChronosOptions, XLoggerLogMeta, AiActivityRequest, AiActivityResponse } from '../types';

// Mock chronos-db
const mockChronos = {
  with: vi.fn().mockReturnValue({
    create: vi.fn().mockResolvedValue({ id: 'activity-123' }),
    enrich: vi.fn().mockResolvedValue({}),
    listByMeta: vi.fn().mockResolvedValue([])
  })
};

vi.mock('chronos-db', () => ({
  initChronos: vi.fn().mockReturnValue(mockChronos)
}));

describe('AiActivitiesOutput', () => {
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
      activities: 'activities',
      errors: 'errors'
    },
    unboundResponseHandling: 'both'
  };

  let aiActivitiesOutput: AiActivitiesOutput;

  beforeEach(() => {
    vi.clearAllMocks();
    aiActivitiesOutput = new AiActivitiesOutput(pkg, chronosConfig);
  });

  it('should log activity request with correct structure', async () => {
    const request: AiActivityRequest = {
      jobId: 'job-123',
      request: { prompt: 'Test prompt' },
      context: { userTier: 'pro' },
      model: 'gpt-4',
      provider: 'openai',
      userId: 'user-456',
      requestStatus: 'accepted'
    };

    const meta: XLoggerLogMeta = {
      tenantId: 'tenant-a',
      correlationId: 'req-123'
    };

    aiActivitiesOutput.logActivityRequest(request, meta);

    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockChronos.with).toHaveBeenCalledWith({
      databaseType: 'logs',
      collection: 'activities'
    });

    const createCall = mockChronos.with().create;
    expect(createCall).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ai-activity',
        jobId: 'job-123',
        status: 'in-progress',
        requestStatus: 'accepted',
        responseStatus: 'pending',
        request: { prompt: 'Test prompt' },
        context: { userTier: 'pro' },
        model: 'gpt-4',
        provider: 'openai',
        userId: 'user-456',
        service: 'test-package',
        tenantId: 'tenant-a',
        correlationId: 'req-123'
      }),
      'test-package',
      'ai:request'
    );
  });

  it('should log activity response and enrich existing request', async () => {
    const response: AiActivityResponse = {
      jobId: 'job-123',
      response: { text: 'Test response' },
      cost: { tokens: 100, usd: 0.01 }
    };

    // Mock the cache to have the job
    (aiActivities as any).jobCache.set('job-123', { id: 'activity-123', startMs: Date.now() - 1000 });

    aiActivitiesOutput.logActivityResponse(response, { tenantId: 'tenant-a' });

    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const enrichCall = mockChronos.with().enrich;
    expect(enrichCall).toHaveBeenCalledWith(
      'activity-123',
      expect.objectContaining({
        status: 'completed',
        responseStatus: 'completed',
        response: { text: 'Test response' },
        cost: { tokens: 100, usd: 0.01 }
      }),
      expect.objectContaining({
        functionId: 'x-logger@ai-activities',
        actor: 'test-package',
        reason: 'ai:response'
      })
    );
  });

  it('should handle unbound response by creating error and activity records', async () => {
    const response: AiActivityResponse = {
      jobId: 'job-456',
      response: { text: 'Test response' },
      cost: { tokens: 50, usd: 0.005 }
    };

    // No job in cache, should be treated as unbound
    aiActivitiesOutput.logActivityResponse(response, { tenantId: 'tenant-b' });

    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should create both activity and error records
    const createCall = mockChronos.with().create;
    expect(createCall).toHaveBeenCalledTimes(2);

    // Check activity record
    expect(createCall).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ai-activity',
        jobId: 'job-456',
        status: 'completed',
        requestStatus: 'unknown',
        responseStatus: 'completed',
        missingStart: true,
        response: { text: 'Test response' },
        cost: { tokens: 50, usd: 0.005 }
      }),
      'test-package',
      'ai:response-unbound'
    );

    // Check error record
    expect(createCall).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ai-activity-error',
        reason: 'unbound-response',
        jobId: 'job-456',
        responseStatus: 'completed',
        response: { text: 'Test response' },
        cost: { tokens: 50, usd: 0.005 }
      }),
      'test-package',
      'ai:response-unbound'
    );
  });

  it('should handle response with error', async () => {
    const response: AiActivityResponse = {
      jobId: 'job-789',
      error: {
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded',
        data: { retryAfter: 60 }
      },
      responseStatus: 'failed'
    };

    (aiActivities as any).jobCache.set('job-789', { id: 'activity-789', startMs: Date.now() - 2000 });

    aiActivitiesOutput.logActivityResponse(response, { tenantId: 'tenant-c' });

    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const enrichCall = mockChronos.with().enrich;
    expect(enrichCall).toHaveBeenCalledWith(
      'activity-789',
      expect.objectContaining({
        status: 'failed',
        responseStatus: 'failed',
        error: {
          code: 'RATE_LIMIT',
          message: 'Rate limit exceeded',
          data: { retryAfter: 60 }
        }
      }),
      expect.any(Object)
    );
  });

  it('should skip logging when source is chronos-db', () => {
    const request: AiActivityRequest = {
      jobId: 'job-123',
      request: { prompt: 'Test' }
    };

    aiActivitiesOutput.logActivityRequest(request, { source: 'chronos-db' });

    // Should not call chronos
    expect(mockChronos.with).not.toHaveBeenCalled();
  });

  it('should respect unboundResponseHandling configuration', async () => {
    const configWithDrop: XLoggerChronosOptions = {
      ...chronosConfig,
      unboundResponseHandling: 'drop'
    };

    const aiActivitiesDrop = new AiActivitiesOutput(pkg, configWithDrop);
    const response: AiActivityResponse = {
      jobId: 'job-drop',
      response: { text: 'Test' }
    };

    aiActivitiesDrop.logActivityResponse(response, { tenantId: 'tenant-a' });

    // Wait for async operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not create any records when set to 'drop'
    expect(mockChronos.with().create).not.toHaveBeenCalled();
  });

  it('should support flush operation', async () => {
    const flushPromise = aiActivities.flush({ timeoutMs: 1000 });
    
    expect(flushPromise).toBeInstanceOf(Promise);
    await expect(flushPromise).resolves.toBeUndefined();
  });
});
