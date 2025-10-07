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

  // Centralized collection naming (default: logs/activities/errors/auditlogs/users/ips/machines/domains/activity_types)
  collections?: {
    logs?: string; // default 'logs'
    activities?: string; // default 'activities'
    errors?: string; // default 'errors'
    auditlogs?: string; // default 'auditlogs'
    users?: string; // default 'users'
    ips?: string; // default 'ips'
    machines?: string; // default 'machines'
    domains?: string; // default 'domains'
    activityTypes?: string; // default 'activity_types'
  };

  // Back-compat (deprecated): if provided, used as fallback
  collection?: string; // previous logs collection
  activityCollection?: string; // previous activity collection
  errorCollection?: string; // new, fallback for errors

  // Control how unbound response events are handled
  unboundResponseHandling?: 'errors' | 'activities' | 'both' | 'drop'; // default 'both'

  // Audit aggregations configuration
  aggregations?: {
    enabled?: boolean; // default true
    resolvers?: {
      userKey?: (e: AuditEvent, m?: XLoggerLogMeta) => { appId: string; userId: string } | undefined;
      ip?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
      machine?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
      domain?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
      activityType?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined; // default e.action
    };
    readModifyWriteCounters?: boolean; // default true
    limits?: { 
      maxSetSize?: number; // cap for array unions to avoid unbounded growth
    };
  };

  // Activity linking configuration
  activityLinking?: {
    enabled?: boolean; // default true
    strategy?: 'jobId' | 'correlationId' | 'both' | 'none'; // default 'both'
    jobIdFrom?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
  };

  // Optional transforms for document shaping (no PII logic)
  transforms?: {
    audit?: (doc: any, meta?: XLoggerLogMeta) => any;
    activity?: (doc: any, meta?: XLoggerLogMeta) => any;
    log?: (doc: any, meta?: XLoggerLogMeta) => any;
  };

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

// Audit logging types
export interface AuditEvent {
  appId: string;
  userId: string;
  action?: string;
  resource?: string;
  target?: { 
    id?: string; 
    type?: string 
  };
  outcome?: 'success' | 'failure' | 'denied' | 'error' | (string & {});
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical' | (string & {});
  tags?: string[];
  context?: string[];
  data?: any;
  occurredAt?: string;
  endAt?: string;
  durationMs?: number;
  activityRef?: { 
    id?: string; 
    jobId?: string 
  };
}

// XLogger extends all logs-gateway capabilities plus adds Chronos persistence
export interface XLogger {
  // All logs-gateway methods
  debug(message: string, data?: XLoggerLogMeta): void;
  info(message: string, data?: XLoggerLogMeta): void;
  warn(message: string, data?: XLoggerLogMeta): void;
  error(message: string, data?: XLoggerLogMeta): void;
  
  // AI activity APIs
  logActivityRequest(req: AiActivityRequest, meta?: XLoggerLogMeta): void;
  logActivityResponse(res: AiActivityResponse, meta?: XLoggerLogMeta): void;
  
  // Audit logging API
  logAudit(event: AuditEvent, meta?: XLoggerLogMeta): void;
  
  // All logs-gateway utility methods
  getConfig(): Readonly<XLoggerConfig>;
  isLevelEnabled(level: LogLevel): boolean;
  
  // X-logger specific methods
  flush?(opts?: { timeoutMs?: number }): Promise<void>;
}
