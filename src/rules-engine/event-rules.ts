import type { EventRule, EventRuleCondition, RiskObject, InsightObject } from '../types';

/**
 * Evaluates a single condition against a log/audit event
 */
export function evaluateCondition(event: any, condition: EventRuleCondition): boolean {
  const value = getNestedValue(event, condition.field);
  
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
    
    case 'contains':
      return typeof value === 'string' && value.includes(condition.value);
    
    case 'startsWith':
      return typeof value === 'string' && value.startsWith(condition.value);
    
    case 'endsWith':
      return typeof value === 'string' && value.endsWith(condition.value);
    
    case 'regex':
      return typeof value === 'string' && new RegExp(condition.value).test(value);
    
    case 'gt':
      return typeof value === 'number' && value > condition.value;
    
    case 'lt':
      return typeof value === 'number' && value < condition.value;
    
    case 'gte':
      return typeof value === 'number' && value >= condition.value;
    
    case 'lte':
      return typeof value === 'number' && value <= condition.value;
    
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(value);
    
    case 'exists':
      return value !== undefined && value !== null;
    
    default:
      return false;
  }
}

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Evaluates all conditions of a rule against an event
 */
export function evaluateRule(event: any, rule: EventRule): boolean {
  if (!rule.enabled) return false;
  
  const logic = rule.conditionLogic || 'AND';
  
  if (logic === 'AND') {
    return rule.conditions.every(condition => evaluateCondition(event, condition));
  } else {
    return rule.conditions.some(condition => evaluateCondition(event, condition));
  }
}

/**
 * Applies event rules to an event and returns risk/insight enrichments
 */
export function applyEventRules(
  event: any,
  rules: EventRule[]
): { risks: RiskObject[]; insights: InsightObject[] } {
  const risks: RiskObject[] = [];
  const insights: InsightObject[] = [];
  const now = new Date().toISOString();
  
  for (const rule of rules) {
    if (evaluateRule(event, rule)) {
      if (rule.output.type === 'risk') {
        risks.push({
          severity: rule.output.severity!,
          text: rule.output.text,
          ruleId: rule.id,
          ruleName: rule.name,
          triggeredAt: now,
          ...rule.output.metadata
        } as RiskObject);
      } else {
        insights.push({
          text: rule.output.text,
          ruleId: rule.id,
          ruleName: rule.name,
          triggeredAt: now,
          metadata: rule.output.metadata
        });
      }
    }
  }
  
  return { risks, insights };
}

