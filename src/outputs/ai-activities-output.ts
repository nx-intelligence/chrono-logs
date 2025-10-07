import type { LoggerPackageConfig, XLoggerChronosOptions, XLoggerLogMeta, AiActivityRequest, AiActivityResponse } from '../types';

// Import chronos-db dynamically to avoid circular dependencies
let initChronos: any;

async function loadChronos() {
  if (initChronos) return initChronos;
  
  try {
    const chronosDb = await import('chronos-db');
    initChronos = chronosDb.initChronos;
    return initChronos;
  } catch (err) {
    // Handle case where chronos-db is not available
    initChronos = () => {
      throw new Error('chronos-db is not available. Please install chronos-db@^2.0.0');
    };
    return initChronos;
  }
}

type ChronosLike = any; // Will be properly typed when chronos-db is loaded
type ActivityStatus = 'in-progress' | 'completed' | 'failed' | 'unbound' | 'unknown';

export class AiActivitiesOutput {
  private chronos: ChronosLike;
  private collActivities: string;
  private collErrors: string;
  private unbound: 'errors' | 'activities' | 'both' | 'drop';
  private fireAndForget: boolean;
  private maxInFlight: number;
  private inFlight = 0;
  private tenantIdResolver?: (m?: XLoggerLogMeta) => string | undefined;
  private onError?: (err: unknown, record: any) => void;

  // Memory cache for quick lookups (jobId -> { id, startMs })
  private jobCache = new Map<string, { id: string; startMs: number }>();

  constructor(
    private readonly pkg: LoggerPackageConfig,
    private readonly cfg: XLoggerChronosOptions
  ) {
    if (!cfg.chronosInstance && !cfg.chronosConfig) {
      throw new Error('x-logger: either chronosInstance or chronosConfig must be provided');
    }
    
    // Initialize chronos synchronously if instance provided, otherwise defer to async
    if (cfg.chronosInstance) {
      this.chronos = cfg.chronosInstance;
    } else {
      // For config-based initialization, we'll need to handle this asynchronously
      this.chronos = null as any; // Will be set in first write call
    }
    
    this.collActivities = cfg.collections?.activities ?? cfg.activityCollection ?? 'activities';
    this.collErrors = cfg.collections?.errors ?? cfg.errorCollection ?? 'errors';
    this.unbound = cfg.unboundResponseHandling ?? 'both';
    this.fireAndForget = cfg.fireAndForget ?? true;
    this.maxInFlight = cfg.maxInFlight ?? 100;
    this.tenantIdResolver = cfg.tenantIdResolver;
    this.onError = cfg.onError;
  }

  private async ensureChronos() {
    if (this.chronos) return this.chronos;
    
    const initChronos = await loadChronos();
    this.chronos = initChronos(this.cfg.chronosConfig!);
    return this.chronos;
  }

  private opsActivities() {
    return this.chronos.with({ 
      databaseType: 'logs', 
      collection: this.collActivities 
    } as any);
  }

  private opsErrors() {
    return this.chronos.with({ 
      databaseType: 'logs', 
      collection: this.collErrors 
    } as any);
  }

  private commonMeta(meta?: XLoggerLogMeta) {
    const tenantId = meta?.tenantId ?? this.tenantIdResolver?.(meta);
    return {
      service: this.pkg.packageName,
      env: process.env.NODE_ENV ?? 'production',
      source: meta?.source ?? 'application',
      correlationId: meta?.correlationId,
      tenantId,
      // Flatten known keys to top-level for indexing, keep rest in meta
      meta: this.sanitizeMeta(meta)
    };
  }

  private sanitizeMeta(meta?: XLoggerLogMeta) {
    if (!meta) return undefined;
    
    // Drop internal routing hints to keep stored docs clean
    // Keep other metadata intact
    const { _routing, ...rest } = meta;
    return Object.keys(rest).length ? rest : undefined;
  }

  logActivityRequest(req: AiActivityRequest, meta?: XLoggerLogMeta) {
    if (!req?.jobId) return;
    if (meta?.source === 'chronos-db') return;

    const startMs = Date.now();
    const record = {
      type: 'ai-activity' as const,
      jobId: req.jobId,
      status: 'in-progress' as ActivityStatus,
      requestStatus: req.requestStatus ?? 'accepted',
      responseStatus: 'pending',
      startTs: new Date(startMs).toISOString(),
      startMs,
      request: req.request,
      context: req.context,
      activityMeta: req.activityMeta,
      model: req.model,
      provider: req.provider,
      userId: req.userId,
      ...this.commonMeta(meta)
    };

    const exec = async () => {
      try {
        const ops = await this.opsActivities();
        const result = await ops.create(record, record.source || this.pkg.packageName, 'ai:request');
        
        // Cache the job for quick lookup on response
        if (result?.id) {
          this.jobCache.set(req.jobId, { id: result.id, startMs });
        }
      } catch (err) {
        try {
          this.onError?.(err, record);
        } catch {}
      } finally {
        this.inFlight = Math.max(this.inFlight - 1, 0);
      }
    };

    if (this.inFlight >= this.maxInFlight) {
      return;
    }

    this.inFlight++;
    if (this.fireAndForget) {
      queueMicrotask(exec);
    } else {
      void exec();
    }
  }

  logActivityResponse(res: AiActivityResponse, meta?: XLoggerLogMeta) {
    if (!res?.jobId) return;
    if (meta?.source === 'chronos-db') return;

    const endMs = Date.now();
    const endTs = new Date(endMs).toISOString();
    const responseStatus = res.responseStatus ?? (res.error ? 'failed' : 'completed');

    const tryEnrich = async (id: string, startMs?: number) => {
      const durationMs = typeof startMs === 'number' ? Math.max(endMs - startMs, 0) : undefined;
      const status: ActivityStatus = res.error ? 'failed' : 'completed';
      
      try {
        const ops = await this.opsActivities();
        await ops.enrich(id, {
          endTs,
          endMs,
          durationMs,
          status,
          responseStatus,
          response: res.response,
          cost: res.cost,
          error: res.error
        }, {
          functionId: 'x-logger@ai-activities',
          actor: this.pkg.packageName,
          reason: 'ai:response'
        });
      } catch (err) {
        try {
          this.onError?.(err, { jobId: res.jobId, response: res.response });
        } catch {}
      }
    };

    const onUnbound = async () => {
      // activities missing-start
      if (this.unbound === 'activities' || this.unbound === 'both') {
        const status: ActivityStatus = res.error ? 'failed' : 'completed';
        const durationMs = undefined; // No start time available
        
        try {
          const ops = await this.opsActivities();
          await ops.create({
            type: 'ai-activity',
            jobId: res.jobId,
            status,
            requestStatus: 'unknown',
            responseStatus,
            endTs,
            endMs,
            durationMs,
            missingStart: true,
            response: res.response,
            cost: res.cost,
            error: res.error,
            ...this.commonMeta(meta)
          }, this.pkg.packageName, 'ai:response-unbound');
        } catch (err) {
          try {
            this.onError?.(err, { jobId: res.jobId, response: res.response });
          } catch {}
        }
      }

      // errors doc
      if (this.unbound === 'errors' || this.unbound === 'both') {
        try {
          const ops = await this.opsErrors();
          await ops.create({
            type: 'ai-activity-error',
            reason: 'unbound-response',
            jobId: res.jobId,
            responseStatus,
            endTs,
            endMs,
            response: res.response,
            cost: res.cost,
            error: res.error,
            ...this.commonMeta(meta)
          }, this.pkg.packageName, 'ai:response-unbound');
        } catch (err) {
          try {
            this.onError?.(err, { jobId: res.jobId, response: res.response });
          } catch {}
        }
      }
    };

    const exec = async () => {
      try {
        // Try memory cache first
        const cached = this.jobCache.get(res.jobId);
        if (cached) {
          await tryEnrich(cached.id, cached.startMs);
          this.jobCache.delete(res.jobId);
          return;
        }

        // Fallback: try to find by jobId in activities collection
        try {
          const ops = await this.opsActivities();
          const activities = await ops.listByMeta({ jobId: res.jobId }, { limit: 1 });
          
          if (activities?.length > 0) {
            const activity = activities[0];
            await tryEnrich(activity.id, activity.startMs);
            return;
          }
        } catch (err) {
          // Ignore lookup errors, proceed to unbound handling
        }

        // No matching request found - handle as unbound
        await onUnbound();
      } catch (err) {
        try {
          this.onError?.(err, { jobId: res.jobId, response: res.response });
        } catch {}
      } finally {
        this.inFlight = Math.max(this.inFlight - 1, 0);
      }
    };

    if (this.inFlight >= this.maxInFlight) {
      return;
    }

    this.inFlight++;
    if (this.fireAndForget) {
      queueMicrotask(exec);
    } else {
      void exec();
    }
  }

  async flush(timeoutMs = 5000): Promise<void> {
    const start = Date.now();
    while (this.inFlight > 0 && Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 20));
    }
  }
}
