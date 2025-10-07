import { createLogger } from 'logs-gateway';
import type { LogLevel } from 'logs-gateway';
import type { LoggerPackageConfig, LogMeta, XLoggerConfig, XLogger } from './types';
import { ChronosOutput } from './outputs/chronos-output';

export type { XLoggerConfig, LogMeta, LogLevel } from './types';

class XLoggerImpl implements XLogger {
  constructor(
    private readonly base: ReturnType<typeof createLogger>,
    private readonly chronos?: ChronosOutput,
    private readonly cfg: XLoggerConfig
  ) {}

  getConfig() {
    return this.cfg;
  }

  private emit(level: LogLevel, message: string, meta?: LogMeta) {
    // 1) Persist to Chronos (non-blocking, safe)
    this.chronos?.write(level, message, meta);

    // 2) Fan-out to existing logs-gateway outputs (console/file/unified)
    this.base[level](message, meta);
  }

  debug(msg: string, meta?: LogMeta) {
    this.emit('debug', msg, meta);
  }

  info(msg: string, meta?: LogMeta) {
    this.emit('info', msg, meta);
  }

  warn(msg: string, meta?: LogMeta) {
    this.emit('warn', msg, meta);
  }

  error(msg: string, meta?: LogMeta) {
    this.emit('error', msg, meta);
  }

  async flush(opts?: { timeoutMs?: number }) {
    await this.chronos?.flush(opts?.timeoutMs);
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

  return new XLoggerImpl(base, chronos, config);
}
