import type { AggregationRule, AggregationRuleCondition, AggregationPeriod, RiskObject, InsightObject } from '../types';

/**
 * Calculates the time window for aggregation based on period
 */
export function getTimeWindow(period: AggregationPeriod): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case 'minute':
      start.setMinutes(start.getMinutes() - 1);
      break;
    case 'hour':
      start.setHours(start.getHours() - 1);
      break;
    case 'day':
      start.setDate(start.getDate() - 1);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
  }
  
  return { start, end };
}

/**
 * Evaluates a condition against an enriched event (with risks/insights)
 */
function evaluateAggCondition(event: any, condition: AggregationRuleCondition): boolean {
  const value = getNestedValue(event, condition.field);
  
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
    
    case 'contains':
      return typeof value === 'string' && value.includes(condition.value);
    
    case 'exists':
      return value !== undefined && value !== null;
    
    case 'gt':
      return typeof value === 'number' && value > condition.value;
    
    case 'lt':
      return typeof value === 'number' && value < condition.value;
    
    case 'gte':
      return typeof value === 'number' && value >= condition.value;
    
    case 'lte':
      return typeof value === 'number' && value <= condition.value;
    
    default:
      return false;
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Checks if an event matches the aggregation rule's conditions
 */
export function eventMatchesAggRule(event: any, rule: AggregationRule): boolean {
  if (!rule.enabled) return false;
  if (!rule.conditions || rule.conditions.length === 0) return true;
  
  // All conditions must match (AND logic)
  return rule.conditions.every(condition => evaluateAggCondition(event, condition));
}

/**
 * Formats the output text with placeholders
 */
export function formatAggregationOutput(
  text: string,
  count: number,
  entity: string,
  period: AggregationPeriod
): string {
  return text
    .replace(/{count}/g, count.toString())
    .replace(/{entity}/g, entity)
    .replace(/{period}/g, period);
}

/**
 * Creates aggregation rule output (risk or insight)
 */
export function createAggregationOutput(
  rule: AggregationRule,
  count: number,
  entityValue: string
): RiskObject | InsightObject {
  const now = new Date().toISOString();
  const text = formatAggregationOutput(rule.output.text, count, entityValue, rule.period);
  
  if (rule.output.type === 'risk') {
    return {
      severity: rule.output.severity!,
      text,
      ruleId: rule.id,
      ruleName: rule.name,
      triggeredAt: now,
      ...rule.output.metadata
    } as RiskObject;
  } else {
    return {
      text,
      ruleId: rule.id,
      ruleName: rule.name,
      triggeredAt: now,
      metadata: {
        ...rule.output.metadata,
        count,
        entityValue,
        period: rule.period
      }
    };
  }
}

/**
 * Gets the entity value from an event based on the property path
 */
export function getEntityValue(event: any, propertyPath: string): string | undefined {
  const value = getNestedValue(event, propertyPath);
  return value ? String(value) : undefined;
}
