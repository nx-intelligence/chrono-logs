# Test Plan: [Component Name]

**Component:** [ComponentName]  
**Expertise:** [What domain knowledge this component has]  
**Created:** YYYY-MM-DD  
**Last Updated:** YYYY-MM-DD  
**Status:** [Planning | Environment Setup | In Progress | Complete]

---

## CURSOR AI INSTRUCTIONS

Create this test plan BEFORE implementing the component. Update it as you work. This plan guides what demos you need to create and what evidence you must capture.

Remember: Testing means it works FOR REAL. Every demo must have actual I/O evidence.

---

## Component Overview

### Expertise Being Tested
[What domain knowledge does this component have?]

Example: "Data persistence and retrieval - knows how to store, retrieve, cache, and query data"

### Sub-Components and Functions

List every sub-component and its specific function:

**[SubComponent1Name]:**
- **Function:** [What single job it does]
- **Input:** [What it accepts]
- **Output:** [What it produces]
- **External Services:** [What it connects to, if any]

**[SubComponent2Name]:**
- **Function:** [What single job it does]
- **Input:** [What it accepts]
- **Output:** [What it produces]
- **External Services:** [What it connects to, if any]

---

## Package Context Alignment

**From context.md:**

### Consumer Expectations
[List what consumers need from "What Consumers Need From This Package"]

Example:
"1. Event tracking with user context - All teams track user actions
2. Automatic PII redaction - Compliance requirement
3. Batch event sending - Performance requirement"

### How Testing Proves We Meet Expectations

**Consumer Need:** [Need from context]  
**Test Coverage:** [Which demos prove this works]  
**Evidence:** [Where to find I/O proof]

**Consumer Need:** [Need from context]  
**Test Coverage:** [Which demos prove this works]  
**Evidence:** [Where to find I/O proof]

### Boundaries We Must Respect

**Must NOT test:** [Things from "Out of Scope"]  
**Why:** [These belong to consumers/other packages]

---

## Environment Requirements

### External Services Needed

**For Real Testing, I Need Access To:**

**[Service Name]** (e.g., OpenAI API)
- **Purpose:** [What it's used for]
- **Authentication:** [What credentials needed]
- **Configuration:** [Environment variables, config files]
- **Status:** [ ] Not provided [ ] Requested [x] Available

**[Service Name]** (e.g., PostgreSQL Database)
- **Purpose:** [What it's used for]
- **Authentication:** [Connection string, credentials]
- **Configuration:** [Database name, host, port]
- **Status:** [ ] Not provided [ ] Requested [ ] Available

**[Service Name]** (e.g., SMTP Server)
- **Purpose:** [What it's used for]
- **Authentication:** [Username, password, host]
- **Configuration:** [Port, TLS settings]
- **Status:** [ ] Not provided [ ] Requested [ ] Available

### Environment Variables Required

```env
# In .env file, I need:
OPENAI_API_KEY=...
DATABASE_URL=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

### Test Data Needed

**Data I'll need from human:**
- [ ] Sample user data for testing
- [ ] Example API responses for validation
- [ ] Expected output formats
- [ ] Edge case data (empty, large, invalid)

**Data I can generate:**
- [ ] Random test inputs
- [ ] Synthetic test cases
- [ ] Mock data for structure testing

### Current Environment Status

**What I Have:**
- [✓/✗] Environment variables configured
- [✓/✗] External service access working
- [✓/✗] Test data available
- [✓/✗] Can execute real tests

**What I'm Missing:**
- [List what's blocking real testing]

**Requested from Human:**
- [What you've asked for and when]

---

## Test Coverage Plan

### Functions to Test

For each function, list demos needed:

**Function: [ComponentName].[methodName]**
- **Purpose:** [What this function does]
- **Demos Needed:**
  - [ ] Happy path demo
  - [ ] Error case demo
  - [ ] Edge case demo 1: [describe]
  - [ ] Edge case demo 2: [describe]
- **External Service:** [What it connects to]
- **Status:** [ ] Planned [ ] Code Written [ ] Executed [ ] Evidence Captured

**Function: [ComponentName].[methodName]**
- **Purpose:** [What this function does]
- **Demos Needed:**
  - [ ] Demo 1: [describe]
  - [ ] Demo 2: [describe]
- **External Service:** [What it connects to]
- **Status:** [ ] Planned [ ] Code Written [ ] Executed [ ] Evidence Captured

### Use Cases to Cover

**Common Use Cases:**

**Use Case 1: [Typical Usage]**
- **Scenario:** [Describe real-world scenario]
- **Sub-Components Involved:** [List]
- **Demo:** [Demo name]
- **Evidence:** [ ] input.json [ ] output.json

**Use Case 2: [High Volume]**
- **Scenario:** [Describe]
- **Sub-Components Involved:** [List]
- **Demo:** [Demo name]
- **Evidence:** [ ] input.json [ ] output.json

**Use Case 3: [Error Recovery]**
- **Scenario:** [Describe]
- **Sub-Components Involved:** [List]
- **Demo:** [Demo name]
- **Evidence:** [ ] input.json [ ] output.json

### Edge Cases to Cover

**Edge Case 1: [Empty Input]**
- **What:** [Describe the edge case]
- **Expected Behavior:** [What should happen]
- **Demo:** [Demo name]
- **Status:** [ ] Planned [ ] Executed [ ] Evidence Captured

**Edge Case 2: [Very Large Input]**
- **What:** [Describe]
- **Expected Behavior:** [What should happen]
- **Demo:** [Demo name]
- **Status:** [ ] Planned [ ] Executed [ ] Evidence Captured

**Edge Case 3: [Null/Undefined]**
- **What:** [Describe]
- **Expected Behavior:** [What should happen]
- **Demo:** [Demo name]
- **Status:** [ ] Planned [ ] Executed [ ] Evidence Captured

**Edge Case 4: [Service Unavailable]**
- **What:** [What happens if external service fails]
- **Expected Behavior:** [Error handling, fallback]
- **Demo:** [Demo name]
- **Status:** [ ] Planned [ ] Executed [ ] Evidence Captured

---

## Demo Organization

### Demo Structure

Demos will be organized by sub-component:

```
/components/[component]/demos/
├── /[sub-component-1]/
│   ├── [demo-1]/
│   │   ├── demo.md
│   │   ├── demo.ts
│   │   └── /io/
│   │       ├── input.json
│   │       └── output.json
│   └── [demo-2]/
│       └── ...
├── /[sub-component-2]/
│   └── [demo-1]/
│       └── ...
└── /composition/
    └── [demo-combining-multiple]/
        └── ...
```

### Planned Demos List

**Sub-Component: [Name]**
1. **demo-[name]** - [What it tests]
   - Status: [ ] Planned [ ] Code Written [ ] Executed [ ] Evidence Captured
2. **demo-[name]** - [What it tests]
   - Status: [ ] Planned [ ] Code Written [ ] Executed [ ] Evidence Captured

**Sub-Component: [Name]**
1. **demo-[name]** - [What it tests]
   - Status: [ ] Planned [ ] Code Written [ ] Executed [ ] Evidence Captured

**Composition Tests:**
1. **demo-[name]** - [What combination it tests]
   - Status: [ ] Planned [ ] Code Written [ ] Executed [ ] Evidence Captured

---

## Mock vs Real Testing Plan

### Real Tests (PRIMARY - REQUIRED)

**These MUST use real external services:**

| Demo | External Service | Why Real Connection Needed | Status |
|------|-----------------|---------------------------|---------|
| demo-name | OpenAI API | Must verify actual API integration | [ ] |
| demo-name | PostgreSQL | Must verify real data persistence | [ ] |
| demo-name | SMTP | Must verify actual email delivery | [ ] |

**Real Test Requirements:**
- [ ] Connect to actual service
- [ ] Use real credentials (from .env)
- [ ] Capture actual request sent (input.json)
- [ ] Capture actual response received (output.json)
- [ ] No mocking of external services

### Mock Tests (SUPPLEMENTARY - ALLOWED)

**These can use mocks (basic validation only):**

| Demo | What's Mocked | Why Mock Acceptable | Status |
|------|--------------|---------------------|---------|
| demo-name | OpenAI API | Testing error handling, not integration | [ ] |
| demo-name | Database | Testing query building logic, not persistence | [ ] |

**Mock Test Limitations:**
- ⚠️ Does NOT prove real integration works
- ⚠️ Only validates internal logic
- ⚠️ Cannot replace real tests
- ⚠️ No I/O evidence required (but test must pass)

---

## Execution Plan

### Phase 1: Planning (CURRENT)
- [x] Identify all functions to test
- [x] List all use cases
- [x] Identify edge cases
- [x] Document environment needs
- [ ] Request environment setup from human

### Phase 2: Environment Setup (WAITING)
**Human Developer Action Required:**
- [ ] Provide environment variables
- [ ] Grant access to external services
- [ ] Provide test data
- [ ] Confirm environment is ready

**Once Environment Ready:**
- [ ] Verify connections work
- [ ] Test credentials are valid
- [ ] Can access all required services

### Phase 3: Demo Creation
- [ ] Write demo.md for each demo
- [ ] Write demo.ts with real connection code
- [ ] Include I/O capture in code
- [ ] Test locally (if environment available)

### Phase 4: Execution
- [ ] Run all demos with real connections
- [ ] Capture all input.json files
- [ ] Capture all output.json files
- [ ] Verify outputs are correct
- [ ] Document any issues

### Phase 5: Validation
- [ ] Every demo has output.json
- [ ] All functions covered
- [ ] All use cases demonstrated
- [ ] All edge cases tested
- [ ] Real service connections proven

---

## Coverage Checklist

### Minimum Requirements

**Before claiming component is tested:**

- [ ] Test plan created and maintained
- [ ] Every public method has ≥1 real demo
- [ ] Every sub-component function demonstrated
- [ ] All common use cases covered
- [ ] All edge cases identified and tested
- [ ] Every demo has input.json
- [ ] Every demo has output.json (REAL output)
- [ ] Composition with other components tested
- [ ] Real external services contacted
- [ ] No critical functionality relies only on mocks

### Current Coverage Status

**Functions:** [X/Y functions covered]  
**Use Cases:** [X/Y use cases covered]  
**Edge Cases:** [X/Y edge cases covered]  
**Real Tests:** [X demos with real I/O evidence]  
**Mock Tests:** [X supplementary mock tests]

---

## Blocked Items

### Waiting on Human Developer

**Cannot proceed with:**
- [ ] [Specific test] - need [specific resource]
- [ ] [Specific test] - need [specific access]

**Requested on:** [Date]  
**Current workaround:** [What you're doing instead, if anything]

---

## Notes and Learnings

### Discovered During Testing

**Issue 1:**
- What I found: [Description]
- Impact: [How it affects testing]
- Resolution: [What was done]

**Learning 1:**
- What I learned: [Insight]
- Document in: [ ] qa.md [ ] component README

### Changes to Plan

**Change 1:**
- Original plan: [What you planned]
- Changed to: [What you're doing instead]
- Reason: [Why the change]

---

## Sign-Off

### Ready for Real Testing?

- [ ] All environment requirements documented
- [ ] All demos planned
- [ ] Human has provided environment
- [ ] Ready to execute real tests

**If not ready, blocking issues:**
[List what's preventing real testing]

### Testing Complete?

- [ ] All demos executed
- [ ] All evidence captured
- [ ] All coverage requirements met
- [ ] Component proven to work FOR REAL

**Completed by:** [Name]  
**Date:** YYYY-MM-DD

---

## For Human Developer Review

**Summary:**
This component requires [list key services] to test properly. I have planned [N] demos covering [list coverage areas]. 

**What I Need from You:**
1. [Environment setup item 1]
2. [Environment setup item 2]
3. [etc.]

**What I'll Deliver:**
Once environment is ready, I will:
1. Execute all [N] demos
2. Capture real I/O evidence for each
3. Validate all functionality works
4. Document any issues found

**Timeline:**
- Mock tests: [can do now / done]
- Real tests: [waiting on environment / in progress / complete]