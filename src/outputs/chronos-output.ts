import type { LogLevel, LoggerPackageConfig, XLoggerLogMeta } from '../types';
import type { XLoggerChronosOptions } from '../types';
import { applyEventRules } from '../rules-engine';

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

export class ChronosOutput {
  private chronos: ChronosLike;
  private collection: string;
  private fireAndForget: boolean;
  private maxInFlight: number;
  private inFlight = 0;
  private tenantIdResolver?: (m?: XLoggerLogMeta) => string | undefined;
  private onError?: (err: unknown, record: any) => void;

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
    
    // Use new collections config with fallback to old collection config
    this.collection = cfg.collections?.logs ?? cfg.collection ?? 'logs';
    this.fireAndForget = cfg.fireAndForget ?? true;
    this.maxInFlight = cfg.maxInFlight ?? 100;
    this.tenantIdResolver = cfg.tenantIdResolver;
    this.onError = cfg.onError;
  }

  private toRecord(level: LogLevel, message: string, meta?: XLoggerLogMeta) {
    const now = new Date().toISOString();
    const tenantId = meta?.tenantId ?? this.tenantIdResolver?.(meta);
    
    // Persist a clean document optimized for search
    const record = {
      ts: now,
      level,
      message,
      package: this.pkg.packageName,
      service: this.pkg.packageName, // alias for consistency
      env: process.env.NODE_ENV ?? 'production',
      source: meta?.source ?? 'application',
      correlationId: meta?.correlationId,
      tenantId,
      // Flatten known keys to top-level for indexing, keep rest in meta
      meta: sanitizeMeta(meta)
    };

    // Apply event rules if configured
    if (this.cfg.rules?.eventRules && this.cfg.rules.eventRules.length > 0) {
      const { risks, insights } = applyEventRules(record, this.cfg.rules.eventRules);
      if (risks.length > 0) {
        (record as any).risks = risks;
      }
      if (insights.length > 0) {
        (record as any).insights = insights;
      }
    }
    
    return record;
  }

  private async ensureChronos() {
    if (this.chronos) return this.chronos;
    
    const initChronos = await loadChronos();
    this.chronos = initChronos(this.cfg.chronosConfig!);
    return this.chronos;
  }

  private async ops() {
    const chronos = await this.ensureChronos();
    // Logs database is centralized in v2.0 config; no tier/tenant routing required
    return chronos.with({ 
      databaseType: 'logs', 
      collection: this.collection 
    } as any); // The Chronos v2.0 API supports databaseType 'logs'
  }

  write(level: LogLevel, message: string, meta?: XLoggerLogMeta) {
    // Recursion safety: never persist logs that originate from Chronos
    if (meta?.source === 'chronos-db') return;

    const record = this.toRecord(level, message, meta);

    const exec = async () => {
      try {
        const ops = await this.ops();
        await ops.create(record, record.source || this.pkg.packageName, `log:${level}`);
      } catch (err) {
        // Never re-log to Chronos. Optionally notify caller.
        try {
          this.onError?.(err, record);
        } catch {}
      } finally {
        this.inFlight = Math.max(this.inFlight - 1, 0);
      }
    };

    if (this.inFlight >= this.maxInFlight) {
      // Drop or backpressure; simplest is to skip to protect system
      return;
    }

    this.inFlight++;
    if (this.fireAndForget) {
      // Schedule without blocking the caller
      queueMicrotask(exec);
    } else {
      // Best-effort sync (still returns immediately; you can use flush to wait)
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

function sanitizeMeta(meta?: XLoggerLogMeta) {
  if (!meta) return undefined;
  
  // Drop internal routing hints to keep stored docs clean
  // Keep other metadata intact
  const { _routing, ...rest } = meta;
  return Object.keys(rest).length ? rest : undefined;
}
