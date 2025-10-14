# Poiesis Testing Principles

## Core Testing Philosophy

**Testing means it works FOR REAL.**

Not "it might work" or "it works with mocks" - it works in reality with real connections, real data, and real responses.

---

## Real Tests vs Mock Tests

### Real Tests (REQUIRED)

**Definition:** Tests that connect to actual external services and capture real responses.

**Examples:**
- ✅ Connect to actual OpenAI API and get real completion
- ✅ Connect to actual Google Search API and get real search results
- ✅ Connect to actual database and perform real queries
- ✅ Send actual email through real SMTP server
- ✅ Process actual payment through real payment gateway (test mode)

**Requirements:**
- Must connect to real service
- Must capture actual input sent
- Must capture actual output received
- Must save I/O evidence to /io/ folder
- Must work in real environment with real credentials

**Evidence Required:**
```
/demos/[demo-name]/
├── demo.md          # What this tests
├── demo.ts          # Test code
└── /io/
    ├── input.json   # Actual request sent to API
    └── output.json  # Actual response received from API
```

### Mock Tests (ALLOWED BUT INSUFFICIENT)

**Definition:** Tests that simulate external services without real connections.

**Examples:**
- Mock OpenAI response without calling API
- Stub database without real connection
- Fake email sending without SMTP
- Simulated payment without gateway

**Characteristics:**
- ⚠️ Basic verification only
- ⚠️ Doesn't prove real-world functionality
- ⚠️ Can pass while real implementation fails
- ⚠️ Cannot replace real tests

**When Mock Tests Are Acceptable:**
- During development before environment is ready
- For error path testing (simulate API failures)
- For unit testing internal logic
- As SUPPLEMENT to real tests, never replacement

**Critical:** Mock tests alone are NOT sufficient. Every component MUST have real tests with actual I/O evidence.

---

## Testing Requirements Per Component

### Component-Level Requirements

**Every component must have:**
1. Real test plan documented
2. Demos for EVERY function it provides
3. Coverage of ALL common use cases
4. Coverage of ALL relevant edge cases
5. Real I/O evidence for every demo

**Test Coverage Checklist:**
- [ ] Every public method has at least one real demo
- [ ] Every sub-component function is demonstrated
- [ ] Happy path scenarios covered
- [ ] Error scenarios covered
- [ ] Edge cases identified and tested
- [ ] Integration with other components tested
- [ ] Real external service connections demonstrated

### Sub-Component-Level Requirements

**Every sub-component must prove:**
- Its single function works correctly
- It handles its inputs properly
- It produces correct outputs
- It maintains its boundary
- It composes correctly with others

**Each sub-component needs:**
- Minimum 3 demos: happy path, error case, edge case
- Real I/O evidence for each
- Clear documentation of what's being tested

---

## Demo Structure

### What is a Demo?

A demo is a test that:
1. **Executes real functionality** with real connections
2. **Captures actual input** sent to the system/service
3. **Captures actual output** received from the system/service
4. **Documents the test** in human-readable form
5. **Provides evidence** that can be reviewed

**Not a demo:**
- Test that uses mocks and doesn't capture real I/O
- Test without output evidence
- Test that "probably works" but doesn't prove it

### Demo Organization

**Group demos by sub-components used:**

```
/components/analytics/demos/
├── /event-tracking/           # Uses EventCollector sub-component
│   ├── track-user-signup/
│   ├── track-purchase/
│   └── track-page-view/
├── /metrics-aggregation/      # Uses MetricsAggregator sub-component
│   ├── aggregate-daily/
│   └── aggregate-by-user/
└── /composition/              # Multiple sub-components together
    └── track-and-aggregate/
```

### Demo Folder Structure

**Each demo folder contains:**

```
/demos/[demo-name]/
├── demo.md          # Human-readable description
├── demo.ts          # Executable test code
└── /io/
    ├── input.json   # What we sent (actual data)
    └── output.json  # What we got back (real response)
```

**Critical:** If `/io/output.json` doesn't exist, the demo didn't run for real and doesn't count as evidence.

---

## Test Plan Requirements

### Every Component Must Have a Test Plan

**Location:** `/components/[component]/test-plan.md`

**Created:** Before implementing the component

**Maintained:** Updated as component evolves

**Contents:**
1. Component expertise being tested
2. All sub-components and their functions
3. List of all demos needed
4. External services required
5. Environment setup needed
6. Coverage goals (what must be proven)

### Test Plan Template

See `/docs/templates/test-plan-cursor.md`

---

## Environment Requirements

### Human Developer Responsibilities

**For Real Tests to Work, Human Must Provide:**

1. **Valid Credentials:**
   - API keys for external services
   - Database connection strings
   - Authentication tokens
   - Service account credentials

2. **Access to Services:**
   - OpenAI API access
   - Google Search API access
   - Database (test instance)
   - SMTP server for emails
   - Payment gateway (test mode)
   - Any other external services

3. **Environment Configuration:**
   - `.env` file with all required variables
   - Configuration files
   - Network access to services
   - Proper permissions

4. **Test Data:**
   - Sample data for testing
   - Expected outputs for validation
   - Edge case data

### Cursor AI Responsibilities

**Cursor CANNOT:**
- ❌ Provide API keys or credentials
- ❌ Set up external service accounts
- ❌ Configure network access
- ❌ Obtain permissions

**Cursor CAN:**
- ✅ Write test code that uses provided credentials
- ✅ Execute tests when environment is ready
- ✅ Capture and save I/O evidence
- ✅ Document what environment needs
- ✅ Request human assistance for setup

**When Blocked:**
```markdown
## Required Assistance from Human Developer

I need the following to complete real testing:

**Missing Environment Setup:**
- [ ] OpenAI API key in .env file (for real API calls)
- [ ] Database connection string (for real queries)
- [ ] SMTP credentials (for real email sending)

**What I'll Do Once Provided:**
1. Execute demos with real connections
2. Capture actual I/O evidence
3. Save results to /demos/*/io/ folders
4. Validate all functionality works

**Current Status:**
- Mock tests written (basic validation only)
- Real test code ready (waiting for environment)
- Cannot proceed to real testing without above setup

Please provide the environment setup, then I'll run all real tests.
```

---

## Test Execution Flow

### Step 1: Plan (Before Coding)

**Cursor creates test plan:**
1. Identify all functions to test
2. List all use cases
3. Identify external services needed
4. Document expected I/O for each test
5. Save plan to `/components/[component]/test-plan.md`

### Step 2: Request Environment (If Needed)

**If external services required:**
1. List what's needed (APIs, databases, etc.)
2. Document in test plan
3. Request human to provide environment
4. STOP - cannot proceed without environment

### Step 3: Write Demo Code

**For each test in plan:**
1. Create demo folder: `/demos/[demo-name]/`
2. Write `demo.md` explaining what this tests
3. Write `demo.ts` with actual test code
4. Include I/O capture in code:
   ```typescript
   // Capture input
   fs.writeFileSync('demos/[name]/io/input.json', 
     JSON.stringify(input, null, 2));
   
   // Execute real operation
   const output = await realOperation(input);
   
   // Capture output
   fs.writeFileSync('demos/[name]/io/output.json',
     JSON.stringify(output, null, 2));
   ```

### Step 4: Execute (With Real Environment)

**Run all demos:**
1. Connect to real services
2. Execute operations
3. Capture I/O automatically
4. Validate results
5. Document any failures

### Step 5: Evidence Review

**Check all demos have:**
- [ ] demo.md explaining test
- [ ] demo.ts with code
- [ ] /io/input.json with actual input
- [ ] /io/output.json with real output

**If any demo missing output.json:**
- Demo didn't execute for real
- Doesn't count as tested
- Component not fully tested

### Step 6: Update Test Plan

**Mark completed:**
- [x] Demo executed
- [x] Evidence captured
- [x] Validated output correct
- [ ] Additional edge cases found

---

## Coverage Requirements

### Minimum Coverage Per Component

**Must demonstrate:**
1. ✅ Every public method works
2. ✅ Every sub-component function works
3. ✅ Happy path for all common use cases
4. ✅ Error handling for expected failures
5. ✅ Edge cases for boundary conditions
6. ✅ Composition with other components
7. ✅ Real external service integration

### Common Use Cases (Must Cover)

**For every component, test:**
- Typical usage scenario
- High-volume scenario (if relevant)
- Error recovery
- Invalid input handling
- Boundary conditions

**For sub-components, test:**
- Its single function in isolation
- Function with various valid inputs
- Function with invalid inputs
- Function as part of composition

### Edge Cases (Must Identify and Cover)

**Common edge cases:**
- Empty input
- Very large input
- Null/undefined values
- Concurrent operations
- Service temporarily unavailable
- Partial failures
- Timeout scenarios

---

## Demo Documentation (demo.md)

### Required Sections

Every `demo.md` must contain:

```markdown
# Demo: [Clear Name of What This Tests]

## Purpose
[One sentence: what this demo proves]

## Sub-Components Used
- [SubComponentName]: [Its function]
- [SubComponentName]: [Its function]

## Use Case
[What real-world scenario this represents]

## External Services
- [Service Name]: [What it's used for]
- [Service Name]: [What it's used for]

## Input
[Describe what input is sent]
See: `io/input.json` for actual data

## Expected Behavior
[What should happen when this runs]

## Actual Output
See: `io/output.json` for real response

## Validation
- [ ] Output matches expected format
- [ ] Output contains expected data
- [ ] No errors occurred
- [ ] Response time acceptable
- [ ] Real service was contacted

## Edge Cases Covered
- [Edge case 1]
- [Edge case 2]

## Notes
[Any observations, issues, or learnings]
```

---

## Handling Missing Environment

### If Human Hasn't Provided Environment

**Cursor must:**

1. **Document what's needed:**
   ```markdown
   # Environment Required for Real Testing
   
   ## Missing Setup
   - OpenAI API key
   - Database credentials
   - SMTP configuration
   
   ## Why Needed
   This component connects to OpenAI API for completions.
   Cannot test without real API access.
   
   ## Current State
   - Mock tests: ✅ Complete
   - Real tests: ⚠️  Waiting for environment
   ```

2. **Request assistance:**
   "I need OpenAI API key to run real tests. Can you provide this in .env file?"

3. **Do NOT proceed with fake/mock-only testing:**
   - Don't claim component is tested if only mocks exist
   - Don't create output.json from mock data
   - Be honest: "Real testing blocked on environment setup"

4. **Write the real test code anyway:**
   - Code should be ready to execute
   - Just needs environment variables
   - Document what's needed in comments

### If Service Genuinely Unavailable

**Some services can't be tested in all environments:**
- Production-only APIs
- Expensive operations
- Regulated services

**In these cases:**
1. Document why real test can't run
2. Provide mock test as substitute
3. Mark in test plan: "Real test not possible - [reason]"
4. Explain in component README
5. Ensure it's tested somewhere (staging, production validation, etc.)

---

## Test Quality Checklist

### Before Claiming Component is Tested

- [ ] Test plan exists and is complete
- [ ] Every function has at least one demo
- [ ] All common use cases demonstrated
- [ ] All edge cases identified and covered
- [ ] Every demo has captured real I/O
- [ ] All output.json files exist and are valid
- [ ] Real external services were contacted
- [ ] No critical functionality relies only on mocks
- [ ] Composition with other components tested
- [ ] Documentation explains what's tested

### Red Flags (Component NOT Tested)

- ❌ No /io/output.json files (no real evidence)
- ❌ Only mock tests exist
- ❌ "Will test later" comments
- ❌ Demos that don't execute
- ❌ Missing test plan
- ❌ Some functions not demonstrated
- ❌ Claims "tested" but no I/O proof

---

## Summary

**Golden Rules:**

1. **Real tests > Mock tests** - Always prefer real connections
2. **Evidence required** - No output.json = didn't happen
3. **Complete coverage** - Every function, every use case
4. **Human provides environment** - Cursor can't create credentials
5. **Request help when blocked** - Don't fake it
6. **Demos are proof** - Tests must be reviewable
7. **Document everything** - What, why, how, results

**Remember:**

Testing means it works **FOR REAL**. Not "probably works" or "works in theory" - actually works with real services, real data, and real results that are captured and reviewable.

---

*No evidence = No test = Not done*