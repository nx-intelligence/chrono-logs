# Change Request: [@sagente/package-name]

**Date:** YYYY-MM-DD  
**Reported by:** [Your name/role]  
**Priority:** [High | Medium | Low]

---

## Issue

### Summary
[One-sentence description of the problem]

### Current Behavior
[What happens now that shouldn't happen, or what doesn't happen that should]

### Expected Behavior
[What should happen instead]

### Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Result: the issue occurs]

### Environment
- Package version: `@sagente/package-name@x.y.z`
- Node version: `vX.Y.Z`
- Other relevant versions: [if applicable]

---

## Why This Matters

### Impact on Ecosystem
[Explain how this affects other teams/services using this package]

### Current Workarounds
[If any workarounds exist, describe them and why they're not ideal]

### Business Impact
[How does this affect our products/services/users?]

---

## Proposed Solution

### Approach
[Describe the recommended fix at a high level]

### Implementation Details
[Specific technical details of how to fix it]

### Code Sample (if applicable)
```typescript
// Proposed implementation
// Show the fix with clear before/after if relevant

// BEFORE (current problematic code):
function currentImplementation() {
  // ...
}

// AFTER (proposed fix):
function improvedImplementation() {
  // ...
}
```

### Alternative Approaches Considered
1. **Option 1:** [Description]
   - Pros: [...]
   - Cons: [...]

2. **Option 2:** [Description]
   - Pros: [...]
   - Cons: [...]

**Recommendation:** [Which option and why]

---

## Test Cases

### Existing Tests That Should Pass
- [ ] [Test 1: description]
- [ ] [Test 2: description]

### New Tests Needed
- [ ] [Test 3: covers the fix]
- [ ] [Test 4: prevents regression]

### Test Code Sample
```typescript
describe('Feature X', () => {
  it('should handle case Y correctly', () => {
    // Test implementation
  });
});
```

---

## Benefits

### For This Package
- [Benefit 1]
- [Benefit 2]

### For Dependent Packages/Services
- [Benefit 1]
- [Benefit 2]

### For All Internal Teams
- [Benefit 1]
- [Benefit 2]

---

## Migration & Compatibility

### Breaking Changes
[Yes/No - if yes, describe what breaks]

### Migration Path
[If breaking: how should dependents update their code?]

### Backward Compatibility Strategy
[How to maintain compatibility if possible]

### Version Impact
- Current version: `x.y.z`
- After fix: `[MAJOR.MINOR.PATCH]` - [explain version bump reasoning]

---

## Additional Context

### Related Issues/CRs
- [Link to related CR #1]
- [Link to related issue #2]

### Documentation Updates Needed
- [ ] README.md
- [ ] API documentation
- [ ] Migration guide
- [ ] CHANGELOG.md

### Questions/Uncertainties
1. [Question 1]
2. [Question 2]

---

## Checklist Before Filing

- [ ] Issue clearly described with reproduction steps
- [ ] Impact on ecosystem explained
- [ ] Proposed solution provided with code if possible
- [ ] Test cases defined
- [ ] Benefits articulated for all users
- [ ] Backward compatibility considered
- [ ] This CR is in `/reports/` directory
- [ ] `/reports/` is in `.gitignore`

---

**Notes:**
- This CR should be discussed with the package maintainer
- Consider scheduling time to implement together if complex
- Document any decisions made in `/docs/qa.md` once resolved