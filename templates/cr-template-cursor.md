# Change Request: [Component Name]

**Created by:** Cursor AI  
**Date:** YYYY-MM-DD  
**For Review by:** Human Developer

---

## CURSOR AI INSTRUCTIONS

This template helps you document issues you discover while working. You are NOT a QA person and don't have full system knowledge. Focus on:
- What you observed in the code
- What the code/tests showed you
- What the Poiesis methodology says should happen
- Evidence from your analysis

Fill in what you know. Mark sections with [UNKNOWN] if you lack information. The human developer will complete these.

---

## Component Context

**Component:** [ComponentName]  
**Expertise:** [What domain knowledge this component claims to have - from README]  
**Location:** `/components/[path]/`  
**Sub-Component:** [SubComponentName if applicable]  
**Function:** [What this sub-component claims to do - from README]

**How I encountered this:**
[Were you implementing a feature? Running tests? Reading code? Explain]

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

## What I Observed

### The Code Behavior
```typescript
// File: [full path]
// Lines: [line numbers]

[Paste the actual code that shows the issue]
```

**What this code is doing:**
[Explain in plain terms what happens when this code runs]

**What I expected based on component's stated expertise:**
[Based on README/documentation, what should happen?]

### Evidence from Execution

**If you ran a test/method:**
```typescript
// Test/Method I ran:
[paste the test or method call]

// Output/Result:
[paste actual output or error]
```

**If you analyzed code flow:**
```
Call sequence I traced:
1. [Function A] called with [params]
2. Which calls [Function B]
3. Which does [action]
4. Result: [what happened]

Expected sequence based on Poiesis:
1. [What should happen]
2. [Based on component decomposition]
```

### Files Involved
```
[List all files you examined with their roles]

/components/data/cache-manager.ts
  - Role: CacheManager sub-component (function: cache invalidation)
  - Issue: Lines 45-67 also handling query building (mixed functions)

/components/data/query-builder.ts  
  - Role: QueryBuilder sub-component (function: building queries)
  - Note: Some query building logic is in cache-manager instead of here

/components/business-logic/user-service.ts
  - Role: [UNKNOWN - doesn't follow Poiesis structure]
  - Observation: Directly accessing cache, bypassing DataComponent
```

---

## Poiesis Methodology Violation

### What I Think Is Wrong

**Component-level issue:**
- [ ] Multiple expertises mixed in one component
- [ ] Component name doesn't match its expertise
- [ ] Component reaching into another component's internals
- [ ] Other: [Explain]

**Sub-component-level issue:**
- [ ] Sub-component doing multiple functions (not single-function)
- [ ] Sub-component name doesn't describe its function
- [ ] Function spread across multiple files
- [ ] Other: [Explain]

**Composition issue:**
- [ ] Components not composing according to architecture.md
- [ ] Boundary violation between components
- [ ] Circular dependency
- [ ] Other: [Explain]

### Specific Evidence of Violation

**Code that violates Poiesis:**
```typescript
// In [ComponentName]
// This code mixes [Expertise A] with [Expertise B]

[Paste specific code showing the violation]

// Example of what I mean:
// Line 45: cache invalidation (cache expertise)
// Line 52: query building (query expertise)  
// Line 58: business validation (business logic expertise)
// All in one function = mixed expertises
```

**What the documentation says:**
```markdown
[Quote from component's README or architecture.md]

"DataComponent expertise: data persistence and retrieval"

But the code also does: [list other things it does]
```

---

## What I Don't Know (Human Developer Please Fill)

**About the system:**
- [ ] Is this intentional or a bug?
- [ ] Are there other parts of the system depending on this behavior?
- [ ] What is the broader context I'm missing?

**About reproduction:**
- [ ] How would a user trigger this in the real system?
- [ ] What are the actual runtime conditions?
- [ ] [UNKNOWN - I can only run tests/methods, not full system]

**About business impact:**
- [ ] What features does this affect?
- [ ] How critical is this?
- [ ] [UNKNOWN - I don't understand business context]

---

## My Analysis (Based on Code Only)

### What Each Component Currently Does

**[ComponentName]:**
```
According to README: [Stated expertise]
Actually doing in code:
  1. [Function 1] - [Expertise area]
  2. [Function 2] - [Expertise area] 
  3. [Function 3] - [Expertise area]
  
Issues I see:
  - [If mixing expertises, explain]
  - [If unclear boundaries, explain]
```

**[OtherComponentName] (if involved):**
```
According to README: [Stated expertise]
Actually doing in code: [What code shows]
Relationship to first component: [How they interact]
```

### Dependencies I Traced

```
[ComponentA] 
  → calls [ComponentB].[method]
    → which accesses [ComponentC].[internalState] (boundary violation?)
      → which triggers [ComponentD]
      
Based on architecture.md:
[ComponentA] should compose with [ComponentB] via [interface]
But code shows: [what actually happens]
```

### Code Metrics (What I Can Measure)

- **Lines of code:** [Component has X lines, sub-component has Y lines]
- **Number of functions:** [List]
- **Number of responsibilities:** [Count distinct things this does]
- **Coupling:** [Lists what this depends on]
- **Called by:** [Lists what depends on this]

**My assessment:**
- [ ] Component too large (doing too much)
- [ ] Sub-component doing multiple functions
- [ ] High coupling (too many dependencies)
- [ ] Other: [Explain]

---

## Proposed Decomposition (My Best Guess)

**Disclaimer:** I'm proposing based on Poiesis principles, but human developer should validate this makes sense for the system.

### Current Structure (Wrong)
```
[ComponentName]
└── [What it contains now]
    - Doing: [Expertise A, Expertise B, Expertise C]
    - Problem: Mixed expertises
```

### Proposed Structure (Following Poiesis)
```
[ComponentName] (Expertise: [A])
├── [SubComponent1] (Function: [specific function 1])
└── [SubComponent2] (Function: [specific function 2])

[NewComponentName] (Expertise: [B])
└── [SubComponent3] (Function: [specific function 3])

Composition: [How they should work together]
```

### Code Sketch
```typescript
// I think it should look like this:

// Component focused on single expertise
export class DataComponent {
  // Only data persistence expertise
  async save<T>(entity: T): Promise<string> {
    const id = await this.repository.save(entity);
    this.events.emit('data.saved', { id, entity });
    return id;
  }
}

// Separate component for different expertise
export class CacheComponent {
  // Only cache management expertise
  constructor() {
    // Compose via events
    DataComponent.events.on('data.saved', this.invalidate);
  }
  
  async invalidate(id: string): Promise<void> {
    // Cache invalidation logic
  }
}
```

**Why this is better:**
- Each component has single expertise
- Sub-components have single functions
- Clear boundaries
- Components compose via [events/interfaces/etc]

---

## Tests I Can Write

**To verify the issue exists:**
```typescript
describe('Current behavior (demonstrating issue)', () => {
  it('shows [ComponentName] mixing expertises', () => {
    // This test shows the component doing multiple things
    const component = new ComponentName();
    
    // Doing function from expertise A
    component.save(data);
    
    // Also doing function from expertise B (should be separate)
    component.invalidateCache(data.id);
    
    // And doing function from expertise C (should be separate)
    component.validateBusinessRule(data);
    
    // All in one component = mixed expertises
  });
});
```

**To verify proposed solution:**
```typescript
describe('Proposed behavior (following Poiesis)', () => {
  it('separates expertises into focused components', () => {
    // Each component does one thing
    const data = new DataComponent();
    const cache = new CacheComponent();
    const validator = new ValidationComponent();
    
    // Clear boundaries, clear composition
    await validator.validate(entity);
    const id = await data.save(entity);
    await cache.invalidate(id);
  });
});
```

---

## What I Need from Human Developer

**Clarifications:**
1. [Question about whether my analysis is correct]
2. [Question about system behavior I can't observe]
3. [Question about business context]

**Decisions:**
1. Should I proceed with the proposed decomposition?
2. Is this issue worth fixing now or should I work around it?
3. Are there other areas with the same problem I should check?

**Unknowns:**
1. [List things I don't know about environment]
2. [List things I don't know about user impact]
3. [List things I don't know about system constraints]

---

## Evidence Attachments

**Code snippets showing the issue:**

```typescript
// Snippet 1: Boundary violation
// File: /components/[...]/[...].ts
[Paste code]

// Snippet 2: Mixed functions  
// File: /components/[...]/[...].ts
[Paste code]

// Snippet 3: Composition problem
// File: /components/[...]/[...].ts
[Paste code]
```

**Related documentation:**

```markdown
# From component README:
[Paste relevant section]

# From architecture.md:
[Paste relevant section]

# Gap between documentation and code:
[Explain difference]
```

**Test output (if applicable):**
```
[Paste actual test output, error messages, logs]
```

---

## My Confidence Level

**How confident am I about this issue?**
- [ ] Very confident - clear violation of Poiesis principles visible in code
- [ ] Somewhat confident - seems wrong but might be intentional design
- [ ] Not confident - I might be misunderstanding something

**What makes me uncertain:**
[Explain any doubts or areas where you need human insight]

---

## Checklist (What I Completed)

- [ ] Identified component and its stated expertise
- [ ] Analyzed actual code behavior
- [ ] Provided code evidence (snippets, file paths, line numbers)
- [ ] Compared against Poiesis methodology
- [ ] Identified specific violations (mixed expertise, mixed functions, boundary issues)
- [ ] Proposed decomposition following Poiesis
- [ ] Wrote/described tests that could verify the issue
- [ ] Clearly marked what I DON'T know ([UNKNOWN] tags)
- [ ] Asked specific questions for human developer

---

## Notes for Human Developer

**Context on how I work:**
- I analyzed the code statically and/or ran specific tests
- I don't have access to full runtime environment
- I don't understand business requirements or user workflows  
- I'm applying Poiesis principles mechanically based on the methodology
- Please validate my analysis makes sense in the real system context

**What I need from you:**
- Confirm if my understanding is correct
- Fill in [UNKNOWN] sections
- Decide if proposed solution is appropriate
- Guide me if I should refactor or work around this