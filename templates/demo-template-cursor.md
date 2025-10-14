# Demo Template for Cursor AI

## INSTRUCTIONS

This template helps you create executable test demos with real I/O evidence. Every demo must:
1. Connect to REAL services (not mocks)
2. Capture ACTUAL input sent
3. Capture ACTUAL output received
4. Save evidence to /io/ folder

If you can't connect to real services, document why and request human assistance.

---

## Demo Folder Structure

```
/demos/[sub-component-name]/[demo-name]/
├── demo.md          # This file - human-readable description
├── demo.ts          # Executable test code
└── /io/
    ├── input.json   # Actual input data sent
    └── output.json  # Real output data received
```

**CRITICAL:** If output.json doesn't exist, the demo didn't run for real and doesn't count.

---

## demo.md Template

```markdown
# Demo: [Clear Name of What This Tests]

**Component:** [ComponentName]  
**Sub-Component:** [SubComponentName]  
**Function Tested:** [Specific function this proves works]  
**Created:** YYYY-MM-DD  
**Last Executed:** YYYY-MM-DD

---

## Purpose

[One clear sentence: what this demo proves]

Example: "Proves that QueryBuilder.buildQuery() correctly sanitizes user input and generates safe SQL queries when connecting to real PostgreSQL database."

---

## Sub-Components Involved

**[SubComponentName]:**
- **Function:** [What single job it does]
- **Role in Demo:** [How it's used in this test]

**[SubComponentName2] (if applicable):**
- **Function:** [What it does]
- **Role in Demo:** [How it's used]

---

## Use Case / Scenario

**Real-World Context:**
[Describe the real-world situation this represents]

Example: "User submits search query with special characters. System must sanitize input before querying database to prevent SQL injection."

**Why This Matters:**
[Why this test is important]

---

## External Services Used

**[Service Name]** (e.g., OpenAI API)
- **Purpose:** [What we're using it for]
- **Endpoint:** [What endpoint/method]
- **Authentication:** [How we authenticate]

**[Service Name]** (e.g., PostgreSQL)
- **Purpose:** [What we're testing with it]
- **Connection:** [Connection details - not credentials!]

---

## Test Type

- [x] Real Test (connects to actual services)
- [ ] Mock Test (simulates services)

**If Mock Test, Why?**
[Explain why real connection isn't possible and why mock is acceptable for THIS specific test]

---

## Input Description

**What Input Represents:**
[Describe what the input data is]

**Input Structure:**
```json
{
  "field1": "description of what this is",
  "field2": "description",
  "field3": {
    "nested": "structure description"
  }
}
```

**Actual Input Data:**
See: `io/input.json` for the real data sent

**Edge Cases in Input:**
- [Any edge case aspects of this input]
- [Empty values, large values, special characters, etc.]

---

## Expected Behavior

**What Should Happen:**
1. [Step 1 of expected behavior]
2. [Step 2]
3. [Step 3]
4. [Final result]

**Expected Output Format:**
```json
{
  "field1": "description of expected field",
  "field2": "description"
}
```

**Success Criteria:**
- [ ] Output contains expected fields
- [ ] Output has correct data types
- [ ] Output values are correct
- [ ] No errors occurred
- [ ] Response time < [X seconds]
- [ ] Real service was contacted (proved by output.json)

---

## Actual Execution

**Executed:** [Date and time of last run]  
**Environment:** [Production/Staging/Test]  
**Services Connected:** [List services actually contacted]

**Actual Output:**
See: `io/output.json` for the real response received

**Execution Time:** [How long it took]  
**Status:** [✓ Success / ✗ Failed / ⚠️ Partial]

---

## Output Validation

**Validation Checks:**
- [✓/✗] Output format matches expected
- [✓/✗] Required fields present
- [✓/✗] Data values correct
- [✓/✗] No unexpected errors
- [✓/✗] Response time acceptable
- [✓/✗] Real service response (not mock)

**Output Analysis:**
[What the output tells us - is it correct? Any issues?]

**Comparison:**
```
Expected: [key value or field]
Actual:   [what we got]
Match:    [✓/✗]
```

---

## Edge Cases Covered

This demo tests these edge cases:
- [ ] Empty input
- [ ] Very large input
- [ ] Null/undefined values
- [ ] Special characters
- [ ] Invalid format
- [ ] Boundary conditions
- [ ] Service unavailable scenario
- [ ] Timeout scenario
- [ ] Other: [describe]

---

## Evidence Files

**Input Evidence:**
- File: `io/input.json`
- Size: [file size]
- Contains: [brief description of what's in it]
- Created: [when input was captured]

**Output Evidence:**
- File: `io/output.json`
- Size: [file size]
- Contains: [brief description of response]
- Created: [when output was captured]
- Proves: [what this output proves - that real service was contacted]

**Verification:**
```bash
# To review evidence:
cat demos/[demo-name]/io/input.json
cat demos/[demo-name]/io/output.json
```

---

## Related Demos

**This demo is part of a series:**
- [Related demo 1] - [what it tests]
- [Related demo 2] - [what it tests]

**Depends on:**
- [Demo that must pass first, if any]

**Required by:**
- [Demo that builds on this, if any]

---

## Notes and Observations

**What Worked Well:**
- [Observation 1]
- [Observation 2]

**Issues Encountered:**
- [Issue 1 and how resolved]
- [Issue 2 and how resolved]

**Performance Notes:**
- Response time: [X ms/seconds]
- Expected: [X ms/seconds]
- Assessment: [Acceptable / Needs optimization]

**Learnings:**
[What did we learn from running this demo?]

---

## Code Reference

**Demo Code Location:**
`demos/[demo-name]/demo.ts`

**Key Functions Used:**
- `[ComponentName].[method]()` - [what it does]
- `[SubComponentName].[method]()` - [what it does]

**Test Code Structure:**
```typescript
// 1. Setup
// 2. Prepare input
// 3. Execute real operation
// 4. Capture output
// 5. Validate results
```

---

## Reproducibility

**To Run This Demo:**
```bash
# Prerequisites:
# 1. Environment variables set (see below)
# 2. Access to required services
# 3. Test data available

# Execute:
npm run demo demos/[demo-name]/demo.ts

# Results saved to:
# - demos/[demo-name]/io/input.json
# - demos/[demo-name]/io/output.json
```

**Required Environment:**
```env
SERVICE_API_KEY=...
DATABASE_URL=...
# [other required variables]
```

**If Environment Missing:**
[What to request from human developer]

---

## Human Developer Review

**Questions for Review:**
1. [Any questions about the results]
2. [Any unclear aspects]

**Approval:**
- [ ] Output looks correct
- [ ] Test proves functionality works
- [ ] Evidence is sufficient
- [ ] Approved by: [Name/Date]

---

## Maintenance

**Last Updated:** YYYY-MM-DD  
**Update Reason:** [Why demo was updated]

**Update History:**
- YYYY-MM-DD: [What changed]
- YYYY-MM-DD: [What changed]

**Known Issues:**
- [Issue 1 if any]
- [Workaround if any]
```

---

## demo.ts Template

```typescript
/**
 * Demo: [Demo Name]
 * 
 * Purpose: [What this proves]
 * Component: [ComponentName]
 * Sub-Component: [SubComponentName]
 * 
 * CRITICAL: This must connect to REAL services and capture ACTUAL I/O.
 * No mocks unless absolutely necessary and documented.
 */

import fs from 'fs';
import path from 'path';
import { ComponentName } from '../../../index';
// Import any other required dependencies

/**
 * Demo configuration
 */
const DEMO_NAME = '[demo-name]';
const DEMO_DIR = path.join(__dirname);
const IO_DIR = path.join(DEMO_DIR, 'io');

/**
 * Ensure io directory exists
 */
if (!fs.existsSync(IO_DIR)) {
  fs.mkdirSync(IO_DIR, { recursive: true });
}

/**
 * Helper: Save input to io/input.json
 */
function saveInput(input: any): void {
  const inputPath = path.join(IO_DIR, 'input.json');
  fs.writeFileSync(
    inputPath,
    JSON.stringify(input, null, 2),
    'utf8'
  );
  console.log(`✓ Input saved to: ${inputPath}`);
}

/**
 * Helper: Save output to io/output.json
 */
function saveOutput(output: any): void {
  const outputPath = path.join(IO_DIR, 'output.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(output, null, 2),
    'utf8'
  );
  console.log(`✓ Output saved to: ${outputPath}`);
}

/**
 * Main demo function
 */
async function runDemo(): Promise<void> {
  console.log(`\n=== Demo: ${DEMO_NAME} ===\n`);

  try {
    // ==========================================
    // STEP 1: Prepare Input
    // ==========================================
    console.log('Step 1: Preparing input...');
    
    const input = {
      // Define your test input here
      // This should represent real-world data
      field1: 'value1',
      field2: 'value2',
      // ... more fields
    };

    // Save input for evidence
    saveInput(input);

    // ==========================================
    // STEP 2: Execute Real Operation
    // ==========================================
    console.log('\nStep 2: Executing real operation...');
    
    // CRITICAL: Connect to REAL service here
    // Do NOT mock unless absolutely necessary
    
    const component = new ComponentName({
      // Configuration from environment variables
      apiKey: process.env.SERVICE_API_KEY,
      // ... other config
    });

    console.log('  → Connecting to real service...');
    const output = await component.methodName(input);
    console.log('  ✓ Real service responded');

    // ==========================================
    // STEP 3: Capture Output
    // ==========================================
    console.log('\nStep 3: Capturing output...');
    
    // Save actual output for evidence
    saveOutput(output);

    // ==========================================
    // STEP 4: Validate Results
    // ==========================================
    console.log('\nStep 4: Validating results...');
    
    const validations = {
      hasExpectedField: output.hasOwnProperty('expectedField'),
      correctDataType: typeof output.expectedField === 'string',
      noErrors: !output.error,
      // ... more validations
    };

    console.log('\nValidation Results:');
    Object.entries(validations).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✓' : '✗'} ${check}`);
    });

    const allPassed = Object.values(validations).every(v => v === true);

    // ==========================================
    // STEP 5: Report Results
    // ==========================================
    console.log('\n=== Demo Complete ===');
    console.log(`Status: ${allPassed ? '✓ SUCCESS' : '✗ FAILED'}`);
    console.log(`\nEvidence captured in:`);
    console.log(`  - ${path.join(IO_DIR, 'input.json')}`);
    console.log(`  - ${path.join(IO_DIR, 'output.json')}`);
    
    if (!allPassed) {
      throw new Error('Validation failed');
    }

  } catch (error) {
    console.error('\n✗ Demo failed:', error);
    
    // Save error as output for evidence
    saveOutput({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}

/**
 * Check environment before running
 */
function checkEnvironment(): void {
  const required = [
    'SERVICE_API_KEY',
    // ... other required env vars
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n✗ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nPlease set these in .env file or environment.');
    console.error('Cannot run real test without proper environment.\n');
    
    // Document what's needed
    saveOutput({
      error: 'Environment not configured',
      missing: missing,
      message: 'Need human developer to provide environment setup'
    });
    
    process.exit(1);
  }
}

/**
 * Execute demo
 */
if (require.main === module) {
  // Check environment first
  checkEnvironment();
  
  // Run the demo
  runDemo()
    .then(() => {
      console.log('\n✓ Demo executed successfully\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Demo failed\n');
      process.exit(1);
    });
}

export { runDemo };
```

---

## Tips for Writing Good Demos

### 1. Real Connections Required

```typescript
// ❌ WRONG - Using mock
const mockAPI = {
  complete: () => Promise.resolve({ text: 'mocked' })
};

// ✓ RIGHT - Real connection
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Real credential
});
const response = await openai.chat.completions.create({
  // Real API call
});
```

### 2. Capture Everything

```typescript
// Capture input BEFORE sending
saveInput(requestData);

// Make real call
const response = await realAPICall(requestData);

// Capture output AFTER receiving
saveOutput(response);
```

### 3. Handle Missing Environment

```typescript
if (!process.env.API_KEY) {
  console.error('Missing API_KEY - cannot run real test');
  console.error('Please request from human developer');
  saveOutput({
    error: 'Environment not configured',
    needed: ['API_KEY']
  });
  process.exit(1);
}
```

### 4. Make Evidence Reviewable

```typescript
// Good: Clear, readable output
saveOutput({
  success: true,
  data: response.data,
  metadata: {
    timestamp: new Date().toISOString(),
    service: 'OpenAI API',
    model: 'gpt-4',
    duration_ms: elapsed
  }
});

// Bad: Unclear output
saveOutput(response); // What is this? Not clear.
```

### 5. Document Failures

```typescript
catch (error) {
  // Save error as evidence
  saveOutput({
    error: error.message,
    stack: error.stack,
    context: {
      input: input,
      timestamp: new Date().toISOString()
    }
  });
  throw error; // Re-throw to fail the demo
}
```

---

## Checklist Before Submitting Demo

- [ ] demo.md complete with all sections
- [ ] demo.ts connects to REAL service (no mocks unless documented)
- [ ] io/input.json exists with actual input
- [ ] io/output.json exists with REAL output
- [ ] Output proves real service was contacted
- [ ] Validation checks implemented
- [ ] Error handling included
- [ ] Environment requirements documented
- [ ] Demo can be re-run by another developer
- [ ] Evidence is reviewable and clear

---

**Remember: No io/output.json = Demo didn't happen = Not tested**