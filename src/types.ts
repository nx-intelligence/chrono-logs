export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface RoutingMeta {
  allowedOutputs?: string[];
  blockOutputs?: string[];
  reason?: string;
  tags?: string[];
}

export interface LogMeta {
  [key: string]: any;
  source?: 'application' | 'chronos-db' | 'logs-gateway-internal' | string;
  correlationId?: string;
  tenantId?: string;
  _routing?: RoutingMeta;
}

export interface LoggerPackageConfig {
  packageName: string;
  envPrefix?: string;
  debugNamespace?: string;
}

export interface XLoggerChronosOptions {
  // Either pass a pre-initialized chronos or config to initialize one
  chronosInstance?: any; // ReturnType<typeof initChronos>
  chronosConfig?: any; // import('chronos-db').ChronosConfig

  // Logs database options
  collection?: string; // default 'logs'

  // Tenant resolution (optional; logs DB is centralized, but we store tenantId)
  tenantIdResolver?: (meta?: LogMeta) => string | undefined;

  // Async write behavior
  fireAndForget?: boolean; // default true
  maxInFlight?: number; // default 100
  onError?: (err: unknown, record: any) => void; // default: noop
}

export interface XLoggerConfig {
  // The existing logs-gateway config (console/file/unified-logger, level, etc.)
  gateway: any; // import('logs-gateway').LoggingConfig

  // Chronos persistence options
  chronos: XLoggerChronosOptions;
}

export interface XLogger {
  debug(msg: string, meta?: LogMeta): void;
  info(msg: string, meta?: LogMeta): void;
  warn(msg: string, meta?: LogMeta): void;
  error(msg: string, meta?: LogMeta): void;

  getConfig(): Readonly<XLoggerConfig>;
  
  // Optional: drain in-flight writes (if fireAndForget=false or for shutdown)
  flush?(opts?: { timeoutMs?: number }): Promise<void>;
}
