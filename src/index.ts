import { createLogger, LogsGateway } from 'logs-gateway';
import type { LogLevel, LoggingConfig, LoggerPackageConfig } from 'logs-gateway';
import type { XLoggerConfig, XLogger, XLoggerLogMeta, AiActivityRequest, AiActivityResponse } from './types';
import { ChronosOutput } from './outputs/chronos-output';
import { AiActivitiesOutput } from './outputs/ai-activities-output';

export type { 
  XLoggerConfig, 
  XLoggerLogMeta, 
  LogLevel,
  LoggingConfig,
  LoggerPackageConfig,
  LogMeta,
  RoutingMeta,
  UnifiedLoggerConfig,
  UnifiedLoggerTransports,
  AiActivityRequest,
  AiActivityResponse
} from './types';

class XLoggerImpl implements XLogger {
  constructor(
    private readonly base: LogsGateway,
    private readonly cfg: XLoggerConfig,
    private readonly chronos?: ChronosOutput,
    private readonly aiActivities?: AiActivitiesOutput
  ) {}

  getConfig() {
    return this.cfg;
  }

  isLevelEnabled(level: LogLevel): boolean {
    return this.base.isLevelEnabled(level);
  }

  private emit(level: LogLevel, message: string, meta?: XLoggerLogMeta) {
    // 1) Persist to Chronos (non-blocking, safe)
    this.chronos?.write(level, message, meta);

    // 2) Fan-out to existing logs-gateway outputs (console/file/unified)
    this.base[level](message, meta);
  }

  debug(message: string, data?: XLoggerLogMeta) {
    this.emit('debug', message, data);
  }

  info(message: string, data?: XLoggerLogMeta) {
    this.emit('info', message, data);
  }

  warn(message: string, data?: XLoggerLogMeta) {
    this.emit('warn', message, data);
  }

  error(message: string, data?: XLoggerLogMeta) {
    this.emit('error', message, data);
  }

  // AI activity methods
  logActivityRequest(req: AiActivityRequest, meta?: XLoggerLogMeta) {
    this.aiActivities?.logActivityRequest(req, meta);
  }

  logActivityResponse(res: AiActivityResponse, meta?: XLoggerLogMeta) {
    this.aiActivities?.logActivityResponse(res, meta);
  }

  async flush(opts?: { timeoutMs?: number }) {
    await Promise.all([
      this.chronos?.flush(opts?.timeoutMs),
      this.aiActivities?.flush(opts?.timeoutMs)
    ]);
  }
}

export function createXLogger(
  pkg: LoggerPackageConfig,
  config: XLoggerConfig
): XLogger {
  const base = createLogger(pkg, config.gateway);

  // Important: ensure chronos writes never cause unified-logger recursion
  // Callers can still override via meta._routing
  const chronos = new ChronosOutput(pkg, config.chronos);
  const aiActivities = new AiActivitiesOutput(pkg, config.chronos);

  return new XLoggerImpl(base, config, chronos, aiActivities);
}

// Re-export logs-gateway utilities for convenience
export { createLogger, LogsGateway } from 'logs-gateway';
