# Bug Report: [What's Wrong]

**Created by:** Cursor AI  
**Date:** YYYY-MM-DD  
**For Review by:** Human Developer

---

## CURSOR AI INSTRUCTIONS

Use this template when you discover code that doesn't work correctly. You are NOT a QA tester and cannot reproduce bugs in a real environment. Instead, document:
- What the code says it should do (from docs/comments)
- What the code actually does (from your analysis)
- Evidence from tests, function calls, or code inspection
- Why this violates the component's function or expertise

Mark [UNKNOWN] for anything you can't determine. Focus on EVIDENCE.

---

## Component Context

**Component:** [ComponentName]  
**Expertise:** [From component README - what it's supposed to know]  
**Sub-Component:** [SubComponentName]  
**Function:** [From code/docs - what it's supposed to do]  
**Location:** `/components/[path]/[file].ts`

**How I discovered this:**
[Was I: running a test? implementing a feature? reading code? analyzing an error?]

---

## Package Context

**From context.md:**
- **What this package should do:** [Quote from context]
- **What consumers expect:** [Quote from "What Consumers Need"]
- **Explicit boundaries:** [Quote relevant scope items]

**How bug relates to context:**
The bug violates [specific consumer expectation] because [explanation].

---

## What Should Happen (From Documentation)

**According to component README:**
```markdown
[Quote the relevant section from README]

Example:
"QueryBuilder sub-component: Builds safe SQL queries from user input.
Handles all query sanitization and validation."
```

**According to code comments:**
```typescript
// From [file].ts, line [XX]:
/**
 * [Quote the function comment/documentation]
 */
```

**According to architecture.md:**
```markdown
[Quote relevant composition or contract description]
```

**My understanding of expected behavior:**
Based on these docs, this sub-component should: [describe in your words]

---

## What Actually Happens (From Evidence)

### Code Analysis

**The actual implementation:**
```typescript
// File: /components/[path]/[file].ts
// Lines: [XX-YY]

[Paste the actual code]

// What I observe this code doing:
// Line XX: [what happens]
// Line YY: [what happens]
// Result: [what the function actually does]
```

**The gap:**
```
Documentation says: [expected behavior]
Code actually does: [actual behavior]
Difference: [explain the gap]
```

### Evidence from Tests

**Test I ran (or found):**
```typescript
// Test file: [path]
// Test name: [name]

[Paste the test code]
```

**Test output:**
```
[Paste actual output]

Expected: [what test expected]
Got: [what actually happened]
Status: [PASS/FAIL]
```

**If test passes but shouldn't:**
```
This test passes: [paste test]

But it accepts wrong behavior: [explain]
It should fail because: [explain]
```

**If I wrote a test to demonstrate the bug:**
```typescript
describe('Bug demonstration', () => {
  it('shows the incorrect behavior', () => {
    const component = new ComponentName();
    const result = component.buggyMethod(input);
    
    // This is what happens (wrong):
    expect(result).toBe(wrongValue); // Currently passes
    
    // This is what should happen (correct):
    // expect(result).toBe(correctValue); // This should pass
  });
});
```

### Call Sequence Analysis

**I traced the code flow:**
```
1. [FunctionA] called with: [input]
   → Line [XX]: Does [action]
   → Line [YY]: Calls [FunctionB]

2. [FunctionB] receives: [what]
   → Line [XX]: Does [action]
   → Problem: [what goes wrong here]
   
3. Returns: [wrong result]

Expected flow should be:
1. [What should happen instead]
2. [Step 2]
3. [Correct result]
```

### Error Evidence (if applicable)

**Error I observed:**
```
[Paste full error message and stack trace]
```

**When this error occurs:**
[From test run / code analysis - when does this happen]

**What the error tells us:**
[Interpret the error - what's it saying is wrong?]

---

## Why This is a Bug (Not Just Different Implementation)

**Violates stated function:**
- [ ] Sub-component not doing its single function correctly
- [ ] Doing something outside its function
- [ ] Not handling its own expertise properly

**Violates composition contract:**
- [ ] Not maintaining boundary with other components
- [ ] Making wrong assumptions about other components
- [ ] Breaking expected composition pattern

**Produces incorrect results:**
- [ ] Returns wrong data type
- [ ] Returns wrong values
- [ ] Fails when it should succeed
- [ ] Succeeds when it should fail
- [ ] Side effects it shouldn't have

**Specific evidence:**
```typescript
// This code is wrong because:

[Paste specific lines]

// Line [XX] is wrong because: [explain]
// This violates [function/expertise/boundary] because: [explain]
// Correct behavior would be: [explain]
```

---

## Comparison: Expected vs Actual

### Input/Output Analysis

**Test case 1:**
```
Input: [what I tested with]

Expected output (based on function definition):
[what should happen]

Actual output (from test/code):
[what actually happens]

Why it's wrong: [explain]
```

**Test case 2 (edge case):**
```
Input: [edge case input]

Expected: [should handle this because function says...]
Actual: [fails/wrong result because...]
Why it's wrong: [explain]
```

**Test case 3 (boundary condition):**
```
Input: [boundary case]

Expected: [based on expertise, should...]
Actual: [doesn't handle correctly because...]
Why it's wrong: [explain]
```

### State Analysis (if applicable)

**Expected state changes:**
```
Before: [state]
After method call: [state should be]
```

**Actual state changes:**
```
Before: [state]
After method call: [state actually is]
Difference: [what's wrong]
```

---

## Root Cause (My Analysis)

### What I Think Is Wrong

**Technical issue:**
[Explain the specific code problem]

Example:
```
QueryBuilder.buildQuery() is not sanitizing input.

Line 45: return new Query(input);

It directly uses input without sanitization. This violates
its function (building SAFE queries). The function should
include sanitization as part of query building expertise.
```

**Why this violates Poiesis:**
- [ ] Function not properly implemented in sub-component
- [ ] Sub-component assuming other components will handle its responsibility
- [ ] Missing error handling for this function
- [ ] Implicit dependency not documented
- [ ] Other: [explain]

### Code Pattern Analysis

**Problematic pattern:**
```typescript
// Current pattern (wrong):
[Paste code showing the problematic pattern]

// This is wrong because:
// [Explain why this pattern causes the bug]
```

**Similar issues I found:**
```
Searched codebase, found same pattern in:
- [File 1, line XX]: [same issue]
- [File 2, line YY]: [same issue]

This might be a systemic problem, not isolated bug.
```

---

## Evidence Attachments

### Code Snippets

**Snippet 1 - The buggy code:**
```typescript
// File: [path]
// Lines: [XX-YY]
// Purpose: [what this code is supposed to do]

[Paste code]

// Bug is here: [point to specific line]
// Because: [explain]
```

**Snippet 2 - Related code that works correctly:**
```typescript
// File: [path]  
// Lines: [XX-YY]
// This similar code handles it correctly:

[Paste code]

// This works because: [explain]
// Buggy code should follow this pattern
```

**Snippet 3 - Where bug causes problems:**
```typescript
// File: [path]
// Lines: [XX-YY]  
// This code depends on buggy behavior:

[Paste code]

// Impact: [what breaks because of the bug]
```

### Test Results

**Existing test that passes but shouldn't:**
```typescript
// Test: [name]
// File: [path]

[Paste test]

// This test accepts wrong behavior
// It should be: [show correct test]
```

**Test I wrote to demonstrate bug:**
```typescript
[Paste test code]

// Output:
[Paste output showing bug]
```

### Documentation vs Reality

**Component README says:**
```markdown
[Quote]
```

**Code actually does:**
```
[Different behavior]
```

**Gap:** [Explain discrepancy]

---

## What I Cannot Determine [UNKNOWN]

**About the environment:**
- [ ] How does this manifest in production?
- [ ] What triggers this in real usage?
- [ ] [Other env questions]

**About impact:**
- [ ] How many users affected?
- [ ] What features break?
- [ ] How severe is this?

**About reproduction:**
- [ ] Can't reproduce in full system (only in tests/code)
- [ ] Don't know real-world trigger
- [ ] [Other reproduction unknowns]

**About context:**
- [ ] Is this intentional? (Seems wrong but might be by design)
- [ ] Are there constraints I don't know about?
- [ ] [Other context unknowns]

---

## Proposed Fix (My Best Guess)

**Disclaimer:** Based on code analysis and Poiesis principles only. Human should validate this makes sense.

### What to Change

**In component/sub-component:**
```typescript
// Current (buggy):
export class QueryBuilder {
  buildQuery(input: string): Query {
    return new Query(input); // No sanitization
  }
}

// Proposed fix:
export class QueryBuilder {
  buildQuery(input: string): Query {
    // Handle query safety (part of query building function)
    const safe = this.sanitize(input);
    return new Query(safe);
  }
  
  private sanitize(input: string): string {
    // Query-specific sanitization
    return input.replace(/[;'"]/g, '');
  }
}
```

**Why this fixes it:**
- Sub-component now properly handles its complete function
- No assumptions about other components
- Clear boundary maintained

### Tests to Verify Fix

```typescript
describe('QueryBuilder fix', () => {
  it('handles unsafe input correctly', () => {
    const builder = new QueryBuilder();
    const result = builder.buildQuery("input';DROP");
    
    expect(result.isSafe()).toBe(true);
    expect(result.toString()).not.toContain(';');
  });
  
  it('works independently', () => {
    // Should work regardless of other components
    const builder = new QueryBuilder();
    const result = builder.buildQuery(anyInput);
    
    expect(result.isSafe()).toBe(true);
  });
});
```

---

## Questions for Human Developer

**About the bug:**
1. Is my analysis correct? [Specific question]
2. Is this actually a bug or intentional? [Why I'm unsure]
3. [Other questions about the issue]

**About the fix:**
1. Is proposed fix appropriate?
2. Are there constraints I'm not aware of?
3. Should I implement this or is there a better approach?

**About impact:**
1. How severe is this?
2. What needs testing beyond what I described?
3. [Other impact questions]

**About reproduction:**
1. How would user encounter this?
2. What are real-world conditions?
3. [Other reproduction questions]

---

## My Confidence Level

**How sure am I this is a bug?**

- [ ] **Very confident** - Clear code error, violates stated function, have test evidence
  - Evidence: [list evidence]
  
- [ ] **Somewhat confident** - Seems wrong but might be intentional
  - Uncertainty because: [explain doubts]
  
- [ ] **Not confident** - Might be misunderstanding something
  - What makes me uncertain: [explain]

**Confidence in proposed fix:**

- [ ] **High** - Fix is straightforward, follows Poiesis clearly
- [ ] **Medium** - Fix seems right but might have implications I don't see
- [ ] **Low** - Not sure best approach, need human guidance

---

## Checklist (What I Documented)

- [ ] Component and sub-component identified
- [ ] Expected behavior quoted from documentation
- [ ] Actual behavior demonstrated with code evidence
- [ ] Test evidence provided (test code + output)
- [ ] Code snippets showing the bug (with line numbers)
- [ ] Call sequence traced (if relevant)
- [ ] Explained why this is a bug (not just different)
- [ ] Provided input/output analysis
- [ ] Identified root cause in code
- [ ] Proposed fix with code
- [ ] Wrote tests to verify fix
- [ ] Marked unknowns clearly [UNKNOWN]
- [ ] Asked specific questions for human
- [ ] Stated confidence level

---

## For Human Developer

**How I work:**
- I can analyze code, run tests/methods, trace execution
- I CANNOT reproduce in full system or production environment
- I CANNOT assess business impact or user experience
- I apply Poiesis principles to identify issues
- I provide evidence from code/tests, not from QA testing

**What I need from you:**
- Validate my analysis is correct
- Fill in [UNKNOWN] sections (environment, impact, reproduction)
- Confirm if this is actually a bug
- Guide on whether/how to fix
- Help me understand any context I'm missing

**Severity assessment:**
[Based on code only] This seems [Critical/High/Medium/Low] because:
- [Reason from code analysis]
- But YOU should assess actual severity based on real-world impact