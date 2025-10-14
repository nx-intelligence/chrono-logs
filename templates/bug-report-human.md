# Bug Report: [Brief Description]

**For:** Human Developer  
**Reported by:** [Your name]  
**Date:** YYYY-MM-DD  
**Severity:** [Critical | High | Medium | Low]

---

## Component Context

**Component:** [ComponentName]  
**Expertise:** [Domain knowledge of this component]  
**Sub-Component:** [SubComponentName if applicable]  
**Function:** [What specific function has the bug]  
**Location:** `/components/[path]/`

---

## Package Context

**From context.md:**
- **What this package should do:** [Quote from context]
- **What consumers expect:** [Quote from "What Consumers Need"]
- **Explicit boundaries:** [Quote relevant scope items]

**How bug relates to context:**
The bug violates [specific consumer expectation] because [explanation].

---

## Bug Summary

[One clear sentence describing what's broken]

Example: "QueryBuilder sub-component (function: building queries) generates invalid SQL when composing with CacheManager, causing data retrieval failures."

---

## Expected Behavior (Per Poiesis Design)

### What Should Happen
[Describe correct behavior based on component's expertise and function]

### Why (Based on Component Design)
According to component README/architecture.md:
- Component expertise: [What it knows]
- Sub-component function: [What it should do]
- Composition pattern: [How it should work with others]

---

## Actual Behavior

### What's Happening
[Describe what the component/sub-component is actually doing]

### How It Differs from Expected
[Explain the gap between expected and actual]

### Impact
- **Functionality affected:** [What features break]
- **Other components affected:** [List components that depend on this]
- **Data integrity:** [Any data corruption/loss risks]
- **User impact:** [How users experience this]

---

## Reproduction

### Prerequisites
- [System state required]
- [Data setup needed]
- [Configuration required]

### Steps
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Actual Result
[What happens when you follow these steps]

### Expected Result
[What should happen]

---

## Evidence

### Code Where Bug Exists
```typescript
// File: /components/[path]/[file].ts
// Lines: XX-YY

[Paste the buggy code]

// The issue is on line XX:
[Explain what's wrong]
```

### Test That Demonstrates Bug
```typescript
describe('[ComponentName]', () => {
  it('reproduces the bug', () => {
    // Setup
    const component = new ComponentName();
    
    // Execute
    const result = component.methodWithBug(input);
    
    // Current (wrong) result
    expect(result).toBe(wrongValue); // This passes but shouldn't
    
    // Expected (correct) result  
    // expect(result).toBe(correctValue); // This should pass
  });
});
```

### Error Messages/Logs
```
[Paste actual error messages, stack traces, or relevant logs]
```

### Related Issues
- Similar bug in [ComponentName]? [Link or describe]
- Might be related to [recent change/pattern]

---

## Root Cause Analysis

### Expertise/Function Boundary Issue
Is this bug caused by:
- [ ] Sub-component doing more than its single function
- [ ] Component mixing multiple expertises
- [ ] Incorrect composition between components
- [ ] Missing error handling in component boundary
- [ ] Other: [Explain]

### Technical Cause
[Explain the specific technical reason for the bug]

Example:
```
QueryBuilder sub-component (function: building queries) is 
not escaping special characters because it assumes 
CacheManager (function: caching) has already sanitized input.

This violates composition contract - each component should 
handle its own expertise independently. QueryBuilder should 
not assume cache has done query-specific sanitization.
```

### Why Did This Happen
- [ ] Function not properly isolated in sub-component
- [ ] Implicit dependency between components not documented
- [ ] Composition pattern not followed
- [ ] Missing validation at component boundary
- [ ] Other: [Explain]

---

## Proposed Fix

### Component/Function Level
[Which component and sub-component need fixing]

### Approach
1. [Step to fix - maintaining Poiesis structure]
2. [Step to fix - ensuring proper boundaries]
3. [Step to fix - validating composition]

### Code Fix
```typescript
// Current (buggy) code:
export class QueryBuilder {
  buildQuery(input: string): Query {
    // Assumes input is already sanitized
    return new Query(input);
  }
}

// Fixed code:
export class QueryBuilder {
  buildQuery(input: string): Query {
    // QueryBuilder handles its own query safety (its expertise)
    const sanitized = this.sanitizeForQuery(input);
    return new Query(sanitized);
  }
  
  private sanitizeForQuery(input: string): string {
    // Query-specific sanitization (part of query expertise)
    return input.replace(/[;'"]/g, '');
  }
}
```

### Why This Fix Follows Poiesis
- Each sub-component handles its own function independently
- No implicit dependencies between components
- Clear boundaries maintained
- Composition works regardless of other components' state

---

## Testing Strategy

### Unit Tests (Sub-Component Level)
```typescript
describe('QueryBuilder.buildQuery', () => {
  it('handles special characters correctly', () => {
    const builder = new QueryBuilder();
    const result = builder.buildQuery("input';DROP TABLE");
    
    expect(result.isSafe()).toBe(true);
    expect(result.toString()).not.toContain(';');
  });
  
  it('works independently of cache state', () => {
    // QueryBuilder should work regardless of cache
    const builder = new QueryBuilder();
    const result = builder.buildQuery(unsafeInput);
    
    expect(result.isSafe()).toBe(true);
  });
});
```

### Integration Tests (Component Composition)
```typescript
describe('QueryBuilder + CacheManager composition', () => {
  it('works correctly when composed', () => {
    const cache = new CacheManager();
    const builder = new QueryBuilder();
    
    // Each does its job independently
    const cached = cache.get(key);
    const query = builder.buildQuery(cached || input);
    
    expect(query.isSafe()).toBe(true);
  });
});
```

### Regression Tests
[Tests to ensure this bug doesn't come back]

---

## Impact Assessment

### Affected Components
- **[ComponentName]:** [How it's affected]
- **[ComponentName]:** [How it's affected]

### Breaking Changes
- [ ] Yes - [What breaks]
- [ ] No - Backward compatible

### Data Migration Needed
- [ ] Yes - [What data needs updating]
- [ ] No - No data changes

---

## Documentation Updates

- [ ] Component README (if interface/behavior changes)
- [ ] Architecture.md (if composition changes)
- [ ] qa.md (document the bug and lesson learned)
- [ ] Migration guide (if breaking change)

---

## Priority & Timeline

**Why this priority:**
[Justify the severity level]

**Urgency factors:**
- Data integrity risk: [Yes/No - explain]
- Security risk: [Yes/No - explain]
- User-facing impact: [High/Medium/Low]
- Workaround available: [Yes/No - describe if yes]

---

## Checklist

- [ ] Bug clearly described
- [ ] Reproduction steps provided
- [ ] Evidence included (code, tests, errors)
- [ ] Root cause identified in terms of Poiesis violations
- [ ] Fix proposed that maintains proper decomposition
- [ ] Test strategy defined
- [ ] Impact assessed
- [ ] Documentation needs identified