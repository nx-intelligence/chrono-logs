# Change Request: [Component Name]

**For:** Human Developer  
**Created by:** [Your name]  
**Date:** YYYY-MM-DD  
**Priority:** [High | Medium | Low]

---

## Component Context

**Component:** [ComponentName]  
**Expertise:** [What domain knowledge this component has]  
**Location:** `/components/[path]/`  
**Sub-Component Affected:** [SubComponentName if applicable]  
**Function:** [What specific function is affected]

---

## Package Context Check

**From context.md:**
- **Package Purpose:** [Quote from "Why This Package Exists"]
- **Primary Consumers:** [List from "Who This Package Serves"]
- **In Scope:** [Relevant items from "Package Boundaries"]
- **Out of Scope:** [Relevant items]

**Does this CR fit the package's stated purpose?**
- [ ] Yes - Aligns with consumer needs and scope
- [ ] Unclear - Might be scope creep
- [ ] No - Should be in different package/consumer code

**If unclear/no:**
[Explain why this might be wrong package]

---

## Issue Summary

[One clear sentence describing the problem in terms of expertise boundary or function failure]

Example: "CacheManager sub-component (function: managing cache) is not invalidating entries when DataComponent updates records, violating the composition contract between these components."

---

## Current Behavior

### What's Happening
[Describe what the component/sub-component is currently doing]

### Expected Behavior Based on Poiesis
[Describe what it should do according to its expertise/function definition]

### Boundary/Composition Issue
[If this is a boundary violation or composition problem, explain]
- Is expertise leaking between components?
- Is a sub-component doing more than its single function?
- Is composition pattern broken?

---

## Evidence

### Code References
```typescript
// File: /components/[component]/[sub-component]/[file].ts
// Lines: XX-YY

[Paste relevant code showing the issue]
```

### Related Components
- **Component A** ([Expertise]): [How it's involved]
- **Component B** ([Expertise]): [How it's involved]
- **Composition Pattern**: [How they should compose]

### Documentation References
- Component README: [What it claims to do]
- Architecture.md: [What the system design says]
- Gap: [Where reality differs from documentation]

---

## Root Cause Analysis

### What Expertise/Function is Missing or Wrong
[Identify what domain knowledge or function is not properly implemented]

### Why This Violates Poiesis
- [ ] Mixes multiple expertises in one component
- [ ] Sub-component doing multiple functions
- [ ] Boundary violation between components
- [ ] Composition pattern not followed
- [ ] Other: [Explain]

---

## Proposed Solution

### Expertise/Function Decomposition
[Describe the proper decomposition]

Example:
```
Current (wrong):
  DataComponent
    └── save() method handles saving AND cache invalidation
    (mixing data persistence expertise with cache management)

Proposed (correct):
  DataComponent
    └── save() method handles saving only
    └── emits 'data.saved' event
  
  CacheComponent (listens to events)
    └── CacheInvalidator sub-component
        └── invalidate() on 'data.saved' event
    (cache expertise separate, proper composition)
```

### Implementation Approach
1. [Step 1 - what to extract/change]
2. [Step 2 - how to compose]
3. [Step 3 - how to maintain boundaries]

### Code Example
```typescript
// Proposed implementation showing proper decomposition

// In DataComponent
export class DataComponent {
  async save<T>(entity: T): Promise<string> {
    const id = await this.repository.save(entity);
    this.events.emit('data.saved', { id, entity });
    return id;
  }
}

// In CacheComponent (separate expertise)
export class CacheInvalidator {
  constructor() {
    DataComponent.events.on('data.saved', this.handleDataSaved);
  }
  
  private async handleDataSaved(event: DataSavedEvent) {
    await this.invalidate(event.id);
  }
}
```

---

## Impact Analysis

### Components Affected
- **[ComponentName]**: [How it's affected]
- **[ComponentName]**: [How it's affected]

### Other Developers/Teams
- **Team/Developer X**: [Uses this component for Y]
- **Team/Developer Z**: [Depends on this behavior]

### Breaking Changes
- [ ] Yes - [Describe what breaks]
- [ ] No - Backward compatible

### Migration Path (if breaking)
[How should dependent code adapt?]

---

## Testing Strategy

### What to Test
1. **Sub-component function isolation**: [Test what]
2. **Component expertise boundary**: [Test what]
3. **Composition behavior**: [Test what]

### Test Cases
```typescript
describe('[ComponentName]', () => {
  it('should [verify single function]', () => {
    // Test sub-component does only its function
  });
  
  it('should not [verify boundary]', () => {
    // Test component doesn't cross expertise boundary
  });
  
  it('should compose with [OtherComponent]', () => {
    // Test composition pattern works
  });
});
```

---

## Documentation Updates Needed

- [ ] Component README (interface changed)
- [ ] `/docs/architecture.md` (composition pattern updated)
- [ ] `/docs/qa.md` (learning documented)
- [ ] Sub-component documentation (if affected)

---

## Questions / Discussion Points

1. [Question about decomposition approach]
2. [Question about migration strategy]
3. [Question about priority]

---

## Checklist

- [ ] Root cause identified in terms of expertise/function
- [ ] Proposed solution follows Poiesis decomposition
- [ ] Component boundaries clear in solution
- [ ] Evidence provided (code, documentation)
- [ ] Impact on other components analyzed
- [ ] Test strategy defined
- [ ] Documentation updates identified