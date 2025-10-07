import type { LoggerPackageConfig, XLoggerChronosOptions, XLoggerLogMeta, AuditEvent, AggregationRule } from '../types';
import { applyEventRules, eventMatchesAggRule, getEntityValue, getTimeWindow, createAggregationOutput } from '../rules-engine';

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

export class AuditOutput {
  private chronos: ChronosLike;
  private collections: {
    auditlogs: string;
    users: string;
    ips: string;
    machines: string;
    domains: string;
    activityTypes: string;
    activities: string;
  };
  private aggregations: {
    enabled: boolean;
    resolvers: {
      userKey?: (e: AuditEvent, m?: XLoggerLogMeta) => { appId: string; userId: string } | undefined;
      ip?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
      machine?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
      domain?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
      activityType?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
    };
    readModifyWriteCounters: boolean;
    limits: { maxSetSize: number };
  };
  private activityLinking: {
    enabled: boolean;
    strategy: 'jobId' | 'correlationId' | 'both' | 'none';
    jobIdFrom?: (e: AuditEvent, m?: XLoggerLogMeta) => string | undefined;
  };
  private fireAndForget: boolean;
  private maxInFlight: number;
  private inFlight = 0;
  private tenantIdResolver?: (m?: XLoggerLogMeta) => string | undefined;
  private onError?: (err: unknown, record: any) => void;
  private transforms?: {
    audit?: (doc: any, meta?: XLoggerLogMeta) => any;
  };

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
    
    // Set up collections with defaults
    this.collections = {
      auditlogs: cfg.collections?.auditlogs ?? 'auditlogs',
      users: cfg.collections?.users ?? 'users',
      ips: cfg.collections?.ips ?? 'ips',
      machines: cfg.collections?.machines ?? 'machines',
      domains: cfg.collections?.domains ?? 'domains',
      activityTypes: cfg.collections?.activityTypes ?? 'activity_types',
      activities: cfg.collections?.activities ?? 'activities'
    };

    // Set up aggregations with defaults
    this.aggregations = {
      enabled: cfg.aggregations?.enabled ?? true,
      resolvers: cfg.aggregations?.resolvers ?? {},
      readModifyWriteCounters: cfg.aggregations?.readModifyWriteCounters ?? true,
      limits: {
        maxSetSize: cfg.aggregations?.limits?.maxSetSize ?? 1000
      }
    };

    // Set up activity linking with defaults
    this.activityLinking = {
      enabled: cfg.activityLinking?.enabled ?? true,
      strategy: cfg.activityLinking?.strategy ?? 'both',
      jobIdFrom: cfg.activityLinking?.jobIdFrom
    };

    this.fireAndForget = cfg.fireAndForget ?? true;
    this.maxInFlight = cfg.maxInFlight ?? 100;
    this.tenantIdResolver = cfg.tenantIdResolver;
    this.onError = cfg.onError;
    this.transforms = cfg.transforms;
  }

  private async ensureChronos() {
    if (this.chronos) return this.chronos;
    
    const initChronos = await loadChronos();
    this.chronos = initChronos(this.cfg.chronosConfig!);
    return this.chronos;
  }

  private ops(collection: string) {
    return this.chronos.with({ 
      databaseType: 'logs', 
      collection 
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

  private truncateArray(arr: any[], maxSize: number): any[] {
    if (arr.length <= maxSize) return arr;
    return arr.slice(0, maxSize);
  }

  private deduplicateArray(arr: any[]): any[] {
    return [...new Set(arr)];
  }

  logAudit(event: AuditEvent, meta?: XLoggerLogMeta) {
    if (!event?.appId || !event?.userId) return;
    if (meta?.source === 'chronos-db') return;

    const now = new Date().toISOString();
    const auditRecord: any = {
      type: 'audit',
      appId: event.appId,
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      target: event.target,
      outcome: event.outcome,
      severity: event.severity ?? 'info',
      tags: event.tags ?? [],
      context: event.context ?? [],
      data: event.data,
      occurredAt: event.occurredAt ?? now,
      endAt: event.endAt,
      durationMs: event.durationMs,
      activityRef: event.activityRef,
      ...this.commonMeta(meta)
    };

    // Apply event rules if configured
    if (this.cfg.rules?.eventRules && this.cfg.rules.eventRules.length > 0) {
      const { risks, insights } = applyEventRules(auditRecord, this.cfg.rules.eventRules);
      if (risks.length > 0) {
        auditRecord.risks = risks;
      }
      if (insights.length > 0) {
        auditRecord.insights = insights;
      }
    }

    const exec = async () => {
      try {
        const chronos = await this.ensureChronos();
        
        // Apply transform if configured
        const finalRecord = this.transforms?.audit ? this.transforms.audit(auditRecord, meta) : auditRecord;
        
        // Create audit log
        const auditOps = this.ops(this.collections.auditlogs);
        const auditResult = await auditOps.create(finalRecord, finalRecord.source || this.pkg.packageName, 'audit:create');
        
        // Handle activity linking
        if (this.activityLinking.enabled && auditResult?.id) {
          await this.handleActivityLinking(event, meta, auditResult.id, finalRecord);
        }

        // Handle aggregations
        if (this.aggregations.enabled) {
          await this.handleAggregations(event, meta, finalRecord);
        }

        // Handle aggregation rules (time-based entity analysis)
        if (this.cfg.rules?.aggregationRules && this.cfg.rules.aggregationRules.length > 0) {
          await this.handleAggregationRules(finalRecord);
        }
      } catch (err) {
        try {
          this.onError?.(err, auditRecord);
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

  private async handleActivityLinking(event: AuditEvent, meta: XLoggerLogMeta | undefined, auditId: string, auditRecord: any) {
    try {
      const chronos = await this.ensureChronos();
      const activitiesOps = this.ops(this.collections.activities);
      
      let jobId: string | undefined;
      let correlationId: string | undefined;

      // Extract jobId based on strategy
      if (this.activityLinking.strategy === 'jobId' || this.activityLinking.strategy === 'both') {
        jobId = event.activityRef?.jobId || 
                this.activityLinking.jobIdFrom?.(event, meta) || 
                event.data?.jobId;
      }

      // Extract correlationId
      if (this.activityLinking.strategy === 'correlationId' || this.activityLinking.strategy === 'both') {
        correlationId = meta?.correlationId;
      }

      let matchedActivity: any = null;

      // Try to find activity by jobId
      if (jobId) {
        try {
          const activities = await activitiesOps.listByMeta({ jobId }, { limit: 1 });
          if (activities?.length > 0) {
            matchedActivity = activities[0];
          }
        } catch (err) {
          // Ignore lookup errors
        }
      }

      // Try to find activity by correlationId if not found by jobId
      if (!matchedActivity && correlationId) {
        try {
          const activities = await activitiesOps.listByMeta({ correlationId }, { limit: 1 });
          if (activities?.length > 0) {
            matchedActivity = activities[0];
          }
        } catch (err) {
          // Ignore lookup errors
        }
      }

      if (matchedActivity) {
        // Update audit record with activity reference
        const auditOps = this.ops(this.collections.auditlogs);
        await auditOps.enrich(auditId, {
          activityRef: {
            id: matchedActivity.id,
            jobId: matchedActivity.jobId
          }
        }, {
          functionId: 'x-logger@audit-linking',
          actor: this.pkg.packageName,
          reason: 'audit:link-activity'
        });

        // Update activity with audit reference (bounded array)
        const auditRefs = matchedActivity.auditRefs || [];
        const newAuditRefs = this.deduplicateArray([...auditRefs, { id: auditId }]);
        const truncatedAuditRefs = this.truncateArray(newAuditRefs, this.aggregations.limits.maxSetSize);

        await activitiesOps.enrich(matchedActivity.id, {
          auditRefs: truncatedAuditRefs
        }, {
          functionId: 'x-logger@audit-linking',
          actor: this.pkg.packageName,
          reason: 'activity:link-audit'
        });
      }
    } catch (err) {
      // Ignore linking errors to avoid breaking audit logging
      try {
        this.onError?.(err, { auditId, event });
      } catch {}
    }
  }

  private async handleAggregations(event: AuditEvent, meta: XLoggerLogMeta | undefined, auditRecord: any) {
    try {
      const chronos = await this.ensureChronos();
      const tenantId = auditRecord.tenantId;
      const now = new Date().toISOString();

      // Derive keys using resolvers
      const userKey = this.aggregations.resolvers.userKey?.(event, meta) || { appId: event.appId, userId: event.userId };
      const ip = this.aggregations.resolvers.ip?.(event, meta);
      const machine = this.aggregations.resolvers.machine?.(event, meta);
      const domain = this.aggregations.resolvers.domain?.(event, meta);
      const activityType = this.aggregations.resolvers.activityType?.(event, meta) || event.action;

      // Update user aggregate
      if (userKey) {
        await this.updateUserAggregate(userKey, tenantId, event, auditRecord, now);
      }

      // Update IP aggregate
      if (ip) {
        await this.updateIpAggregate(ip, tenantId, event, auditRecord, now);
      }

      // Update machine aggregate
      if (machine) {
        await this.updateMachineAggregate(machine, tenantId, event, auditRecord, now);
      }

      // Update domain aggregate
      if (domain) {
        await this.updateDomainAggregate(domain, tenantId, event, auditRecord, now);
      }

      // Update activity type aggregate
      if (activityType) {
        await this.updateActivityTypeAggregate(activityType, tenantId, event, auditRecord, now);
      }
    } catch (err) {
      // Ignore aggregation errors to avoid breaking audit logging
      try {
        this.onError?.(err, { event, auditRecord });
      } catch {}
    }
  }

  private async updateUserAggregate(userKey: { appId: string; userId: string }, tenantId: string, event: AuditEvent, auditRecord: any, now: string) {
    const usersOps = this.ops(this.collections.users);
    const key = `${userKey.appId}:${userKey.userId}:${tenantId}`;
    
    try {
      const existing = await usersOps.listByMeta({ key }, { limit: 1 });
      
      if (existing?.length > 0) {
        const user = existing[0];
        const updates: any = {
          totalEvents: (user.totalEvents || 0) + 1,
          lastSeen: now,
          [`counts.byAction.${event.action || 'unknown'}`]: (user.counts?.byAction?.[event.action || 'unknown'] || 0) + 1
        };

        // Update arrays with deduplication and truncation
        if (event.tags?.length) {
          const tags = this.deduplicateArray([...(user.tags || []), ...event.tags]);
          updates.tags = this.truncateArray(tags, this.aggregations.limits.maxSetSize);
        }
        if (event.context?.length) {
          const context = this.deduplicateArray([...(user.context || []), ...event.context]);
          updates.context = this.truncateArray(context, this.aggregations.limits.maxSetSize);
        }
        if (auditRecord.ip) {
          const ips = this.deduplicateArray([...(user.ips || []), auditRecord.ip]);
          updates.ips = this.truncateArray(ips, this.aggregations.limits.maxSetSize);
        }
        if (auditRecord.machine) {
          const machines = this.deduplicateArray([...(user.machines || []), auditRecord.machine]);
          updates.machines = this.truncateArray(machines, this.aggregations.limits.maxSetSize);
        }

        await usersOps.enrich(user.id, updates, {
          functionId: 'x-logger@user-aggregate',
          actor: this.pkg.packageName,
          reason: 'user:update'
        });
      } else {
        // Create new user aggregate
        await usersOps.create({
          type: 'user-aggregate',
          key,
          appId: userKey.appId,
          userId: userKey.userId,
          tenantId,
          totalEvents: 1,
          firstSeen: now,
          lastSeen: now,
          counts: {
            byAction: { [event.action || 'unknown']: 1 }
          },
          tags: this.truncateArray(event.tags || [], this.aggregations.limits.maxSetSize),
          context: this.truncateArray(event.context || [], this.aggregations.limits.maxSetSize),
          ips: auditRecord.ip ? [auditRecord.ip] : [],
          machines: auditRecord.machine ? [auditRecord.machine] : [],
          ...this.commonMeta(undefined)
        }, this.pkg.packageName, 'user:create');
      }
    } catch (err) {
      // Ignore individual aggregate errors
    }
  }

  private async updateIpAggregate(ip: string, tenantId: string, event: AuditEvent, auditRecord: any, now: string) {
    const ipsOps = this.ops(this.collections.ips);
    const key = `${ip}:${tenantId}`;
    
    try {
      const existing = await ipsOps.listByMeta({ key }, { limit: 1 });
      
      if (existing?.length > 0) {
        const ipRecord = existing[0];
        const updates: any = {
          totalEvents: (ipRecord.totalEvents || 0) + 1,
          lastSeen: now,
          [`counts.byAction.${event.action || 'unknown'}`]: (ipRecord.counts?.byAction?.[event.action || 'unknown'] || 0) + 1
        };

        // Update arrays
        const users = this.deduplicateArray([...(ipRecord.users || []), `${event.appId}:${event.userId}`]);
        updates.users = this.truncateArray(users, this.aggregations.limits.maxSetSize);
        
        const apps = this.deduplicateArray([...(ipRecord.apps || []), event.appId]);
        updates.apps = this.truncateArray(apps, this.aggregations.limits.maxSetSize);

        await ipsOps.enrich(ipRecord.id, updates, {
          functionId: 'x-logger@ip-aggregate',
          actor: this.pkg.packageName,
          reason: 'ip:update'
        });
      } else {
        await ipsOps.create({
          type: 'ip-aggregate',
          key,
          ip,
          tenantId,
          totalEvents: 1,
          firstSeen: now,
          lastSeen: now,
          counts: {
            byAction: { [event.action || 'unknown']: 1 }
          },
          users: [`${event.appId}:${event.userId}`],
          apps: [event.appId],
          ...this.commonMeta(undefined)
        }, this.pkg.packageName, 'ip:create');
      }
    } catch (err) {
      // Ignore individual aggregate errors
    }
  }

  private async updateMachineAggregate(machine: string, tenantId: string, event: AuditEvent, auditRecord: any, now: string) {
    const machinesOps = this.ops(this.collections.machines);
    const key = `${machine}:${tenantId}`;
    
    try {
      const existing = await machinesOps.listByMeta({ key }, { limit: 1 });
      
      if (existing?.length > 0) {
        const machineRecord = existing[0];
        const updates: any = {
          totalEvents: (machineRecord.totalEvents || 0) + 1,
          lastSeen: now,
          [`counts.byAction.${event.action || 'unknown'}`]: (machineRecord.counts?.byAction?.[event.action || 'unknown'] || 0) + 1
        };

        const users = this.deduplicateArray([...(machineRecord.users || []), `${event.appId}:${event.userId}`]);
        updates.users = this.truncateArray(users, this.aggregations.limits.maxSetSize);
        
        const apps = this.deduplicateArray([...(machineRecord.apps || []), event.appId]);
        updates.apps = this.truncateArray(apps, this.aggregations.limits.maxSetSize);

        await machinesOps.enrich(machineRecord.id, updates, {
          functionId: 'x-logger@machine-aggregate',
          actor: this.pkg.packageName,
          reason: 'machine:update'
        });
      } else {
        await machinesOps.create({
          type: 'machine-aggregate',
          key,
          machine,
          tenantId,
          totalEvents: 1,
          firstSeen: now,
          lastSeen: now,
          counts: {
            byAction: { [event.action || 'unknown']: 1 }
          },
          users: [`${event.appId}:${event.userId}`],
          apps: [event.appId],
          ...this.commonMeta(undefined)
        }, this.pkg.packageName, 'machine:create');
      }
    } catch (err) {
      // Ignore individual aggregate errors
    }
  }

  private async updateDomainAggregate(domain: string, tenantId: string, event: AuditEvent, auditRecord: any, now: string) {
    const domainsOps = this.ops(this.collections.domains);
    const key = `${domain}:${tenantId}`;
    
    try {
      const existing = await domainsOps.listByMeta({ key }, { limit: 1 });
      
      if (existing?.length > 0) {
        const domainRecord = existing[0];
        const updates: any = {
          totalEvents: (domainRecord.totalEvents || 0) + 1,
          lastSeen: now,
          [`counts.byAction.${event.action || 'unknown'}`]: (domainRecord.counts?.byAction?.[event.action || 'unknown'] || 0) + 1
        };

        const users = this.deduplicateArray([...(domainRecord.users || []), `${event.appId}:${event.userId}`]);
        updates.users = this.truncateArray(users, this.aggregations.limits.maxSetSize);
        
        const apps = this.deduplicateArray([...(domainRecord.apps || []), event.appId]);
        updates.apps = this.truncateArray(apps, this.aggregations.limits.maxSetSize);

        await domainsOps.enrich(domainRecord.id, updates, {
          functionId: 'x-logger@domain-aggregate',
          actor: this.pkg.packageName,
          reason: 'domain:update'
        });
      } else {
        await domainsOps.create({
          type: 'domain-aggregate',
          key,
          domain,
          tenantId,
          totalEvents: 1,
          firstSeen: now,
          lastSeen: now,
          counts: {
            byAction: { [event.action || 'unknown']: 1 }
          },
          users: [`${event.appId}:${event.userId}`],
          apps: [event.appId],
          ...this.commonMeta(undefined)
        }, this.pkg.packageName, 'domain:create');
      }
    } catch (err) {
      // Ignore individual aggregate errors
    }
  }

  private async updateActivityTypeAggregate(activityType: string, tenantId: string, event: AuditEvent, auditRecord: any, now: string) {
    const activityTypesOps = this.ops(this.collections.activityTypes);
    const key = `${activityType}:${tenantId}`;
    
    try {
      const existing = await activityTypesOps.listByMeta({ key }, { limit: 1 });
      
      if (existing?.length > 0) {
        const activityTypeRecord = existing[0];
        const updates: any = {
          totalEvents: (activityTypeRecord.totalEvents || 0) + 1,
          lastSeen: now,
          [`counts.byApp.${event.appId}`]: (activityTypeRecord.counts?.byApp?.[event.appId] || 0) + 1
        };

        const users = this.deduplicateArray([...(activityTypeRecord.users || []), `${event.appId}:${event.userId}`]);
        updates.users = this.truncateArray(users, this.aggregations.limits.maxSetSize);
        
        const apps = this.deduplicateArray([...(activityTypeRecord.apps || []), event.appId]);
        updates.apps = this.truncateArray(apps, this.aggregations.limits.maxSetSize);

        await activityTypesOps.enrich(activityTypeRecord.id, updates, {
          functionId: 'x-logger@activity-type-aggregate',
          actor: this.pkg.packageName,
          reason: 'activity-type:update'
        });
      } else {
        await activityTypesOps.create({
          type: 'activity-type-aggregate',
          key,
          activityType,
          tenantId,
          totalEvents: 1,
          firstSeen: now,
          lastSeen: now,
          counts: {
            byApp: { [event.appId]: 1 }
          },
          users: [`${event.appId}:${event.userId}`],
          apps: [event.appId],
          ...this.commonMeta(undefined)
        }, this.pkg.packageName, 'activity-type:create');
      }
    } catch (err) {
      // Ignore individual aggregate errors
    }
  }

  private async handleAggregationRules(enrichedEvent: any) {
    if (!this.cfg.rules?.aggregationRules) return;

    const entityPropertyMap = this.cfg.rules.entityPropertyMap || {
      userId: 'users',
      appId: 'users',
      ip: 'ips',
      machine: 'machines',
      domain: 'domains',
      action: 'activity_types'
    };

    for (const rule of this.cfg.rules.aggregationRules) {
      if (!rule.enabled) continue;

      // Check if this event matches the rule's conditions
      if (!eventMatchesAggRule(enrichedEvent, rule)) continue;

      // Get the entity value from the event
      const entityValue = getEntityValue(enrichedEvent, rule.entityProperty);
      if (!entityValue) continue;

      // Get the collection name for this entity type
      const collectionName = entityPropertyMap[rule.entityProperty];
      if (!collectionName) continue;

      try {
        // Get time window for the aggregation period
        const { start, end } = getTimeWindow(rule.period);

        // Query events in this time period for this entity
        const chronos = await this.ensureChronos();
        const auditOps = this.ops(this.collections.auditlogs);
        
        // Build query to count matching events
        const query: any = {
          [rule.entityProperty]: entityValue,
          occurredAt: { $gte: start.toISOString(), $lte: end.toISOString() }
        };

        // Add condition filters if specified
        if (rule.conditions && rule.conditions.length > 0) {
          for (const condition of rule.conditions) {
            // For nested fields like 'risks.severity'
            const condValue = condition.value;
            if (condition.operator === 'equals') {
              query[condition.field] = condValue;
            } else if (condition.operator === 'exists') {
              query[condition.field] = { $exists: true };
            } else if (condition.operator === 'gt') {
              query[condition.field] = { $gt: condValue };
            } else if (condition.operator === 'gte') {
              query[condition.field] = { $gte: condValue };
            } else if (condition.operator === 'lt') {
              query[condition.field] = { $lt: condValue };
            } else if (condition.operator === 'lte') {
              query[condition.field] = { $lte: condValue };
            } else if (condition.operator === 'contains') {
              query[condition.field] = { $regex: condValue, $options: 'i' };
            }
          }
        }

        // Count events matching the criteria
        const matchingEvents = await auditOps.listByMeta(query) || [];
        const count = Array.isArray(matchingEvents) ? matchingEvents.length : 0;

        // Check if threshold is exceeded
        if (count >= rule.threshold) {
          // Create aggregation output (risk or insight)
          const aggOutput = createAggregationOutput(rule, count, entityValue);

          // Store this aggregation alert/insight
          const aggRecord = {
            type: 'aggregation-alert',
            ruleId: rule.id,
            ruleName: rule.name,
            entityProperty: rule.entityProperty,
            entityValue,
            period: rule.period,
            count,
            threshold: rule.threshold,
            output: aggOutput,
            triggeredAt: new Date().toISOString(),
            timeWindow: {
              start: start.toISOString(),
              end: end.toISOString()
            },
            service: this.pkg.packageName,
            env: process.env.NODE_ENV ?? 'production'
          };

          // Persist to the entity's collection or a dedicated alerts collection
          const collectionOps = this.ops(collectionName);
          await collectionOps.create(aggRecord, this.pkg.packageName, `aggregation-rule:${rule.output.type}`);
        }
      } catch (err) {
        // Ignore individual aggregation rule errors
      }
    }
  }

  async flush(timeoutMs = 5000): Promise<void> {
    const start = Date.now();
    while (this.inFlight > 0 && Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 20));
    }
  }
}
