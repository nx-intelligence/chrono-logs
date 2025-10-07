// Import and re-export all logs-gateway types
import type { 
  LogLevel, 
  LogFormat, 
  LoggingConfig, 
  CustomLogger, 
  LoggerPackageConfig, 
  LogEntry, 
  InternalLoggingConfig, 
  LogMeta, 
  RoutingMeta, 
  UnifiedLoggerConfig, 
  UnifiedLoggerTransports 
} from 'logs-gateway';

export type { 
  LogLevel, 
  LogFormat, 
  LoggingConfig, 
  CustomLogger, 
  LoggerPackageConfig, 
  LogEntry, 
  InternalLoggingConfig, 
  LogMeta, 
  RoutingMeta, 
  UnifiedLoggerConfig, 
  UnifiedLoggerTransports 
};

// Extend LogMeta to add x-logger specific fields
export interface XLoggerLogMeta extends LogMeta {
  /** Tenant ID for multi-tenant logging */
  tenantId?: string;
  /** Source identifier with x-logger specific values */
  source?: 'application' | 'chronos-db' | 'logs-gateway-internal' | string;
}

export interface XLoggerChronosOptions {
  // Either pass a pre-initialized chronos or config to initialize one
  chronosInstance?: any; // ReturnType<typeof initChronos>
  chronosConfig?: any; // import('chronos-db').ChronosConfig

  // New: centralized collection naming (default: logs/activities/errors)
  collections?: {
    logs?: string; // default 'logs'
    activities?: string; // default 'activities'
    errors?: string; // default 'errors'
  };

  // Back-compat (deprecated): if provided, used as fallback
  collection?: string; // previous logs collection
  activityCollection?: string; // previous activity collection
  errorCollection?: string; // new, fallback for errors

  // New: control how unbound response events are handled
  unboundResponseHandling?: 'errors' | 'activities' | 'both' | 'drop'; // default 'both'

  // Behavior/perf
  tenantIdResolver?: (meta?: XLoggerLogMeta) => string | undefined;
  fireAndForget?: boolean; // default true
  maxInFlight?: number; // default 100
  onError?: (err: unknown, record: any) => void; // default noop
}

export interface XLoggerConfig {
  // The existing logs-gateway config (console/file/unified-logger, level, etc.)
  gateway: LoggingConfig;

  // Chronos persistence options
  chronos: XLoggerChronosOptions;
}

// AI Activity logging types
export interface AiActivityRequest {
  jobId: string;
  request: any;
  context?: any;
  activityMeta?: any; // Optional hints for analytics
  model?: string;
  provider?: string;
  userId?: string;

  // New: let caller set a requestStatus if desired; defaults to 'accepted'
  requestStatus?: 'accepted' | 'rejected' | 'error' | (string & {});
}

export interface AiActivityResponse {
  jobId: string;
  response?: any; // present on success
  cost?: any;
  error?: { 
    code?: string; 
    message: string; 
    data?: any 
  };

  // New: let caller override responseStatus; default computed from error
  responseStatus?: 'completed' | 'failed' | 'timeout' | 'error' | (string & {});
}

// XLogger extends all logs-gateway capabilities plus adds Chronos persistence
export interface XLogger {
  // All logs-gateway methods
  debug(message: string, data?: XLoggerLogMeta): void;
  info(message: string, data?: XLoggerLogMeta): void;
  warn(message: string, data?: XLoggerLogMeta): void;
  error(message: string, data?: XLoggerLogMeta): void;
  
  // AI activity APIs (new)
  logActivityRequest(req: AiActivityRequest, meta?: XLoggerLogMeta): void;
  logActivityResponse(res: AiActivityResponse, meta?: XLoggerLogMeta): void;
  
  // All logs-gateway utility methods
  getConfig(): Readonly<XLoggerConfig>;
  isLevelEnabled(level: LogLevel): boolean;
  
  // X-logger specific methods
  flush?(opts?: { timeoutMs?: number }): Promise<void>;
}
