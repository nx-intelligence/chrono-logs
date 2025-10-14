# Developer Principles - Working with Poiesis Methodology

## For Human Developers Using Poiesis

This document describes how YOU, the human developer, should work when using Poiesis Development methodology with Cursor AI.

---

## Core Mindset

### Think in Expertise and Function

**Before writing code, ask:**
- What domain knowledge does this require? → That's a **component**
- What specific job does this do? → That's a **sub-component**
- Am I mixing different expertises? → If yes, **split them**
- Is this function doing multiple things? → If yes, **decompose**

**Example:**
```
❌ Wrong thinking:
"I need a User feature" → creates UserComponent with everything

✅ Poiesis thinking:
"I need to store user data" → DataComponent
"I need to validate business rules" → BusinessLogicComponent  
"I need to expose API" → APIComponent
They compose into user management functionality
```

### Document Before You Code

**The Poiesis cycle:**
1. **Think** - What expertise is needed?
2. **Document** - Write README (why, what, how)
3. **Plan** - Create test plan (how to prove it works)
4. **Build** - Implement following boundaries
5. **Prove** - Real tests with I/O evidence
6. **Learn** - Document in qa.md

**Never:**
- Code first, document later
- Skip the test plan
- Claim "tested" without evidence

### Collaborate with Cursor Effectively

**You and Cursor are partners:**
- **You** provide: Vision, architecture decisions, environment, approval
- **Cursor** provides: Implementation, testing, documentation updates
- **Together** you create: Well-architected, proven, maintainable software

**The Plan→Act Dance:**
1. Cursor proposes changes (Plan)
2. You review and decide
3. You say "yes" or suggest changes
4. Cursor executes (Act)
5. You verify results

---

## Daily Workflow Principles

### 1. Start with Context

**Every session, you should:**
- Know what component you're working on
- Understand its expertise and boundaries
- Review its test plan
- Check what environment is available

**Tell Cursor:**
```
"Working on DataComponent today. 
Goal: Add caching sub-component.
Environment: Database and Redis available."
```

### 2. Approve Thoughtfully

**When Cursor proposes (Plan mode):**
- ✅ Read the proposal carefully
- ✅ Verify boundaries are maintained
- ✅ Check it follows Poiesis principles
- ✅ Consider long-term implications
- ❌ Don't rubber-stamp without reading
- ❌ Don't rush - quality over speed

**Good approval:**
```
"Yes, but rename CacheHandler to CacheInvalidator 
to be more specific about its function."
```

**Good rejection:**
```
"No, this mixes data and business logic. 
Let's keep business validation in BusinessLogicComponent."
```

### 3. Provide Environment Proactively

**Don't wait for Cursor to be blocked:**
- Set up `.env` file with all needed credentials
- Grant access to services before starting
- Run `npm run verify:env` yourself first
- Tell Cursor: "Environment is ready, all services accessible"

**When Cursor requests environment:**
- Respond quickly - it's blocking progress
- Provide exactly what's requested
- Verify it works before saying "done"
- Update environment-requirements.md if changed

### 4. Review Test Evidence

**After Cursor runs tests:**
- Check that `io/output.json` files exist
- Open and review actual outputs
- Verify they're from real services (not mocks)
- Confirm results make sense

**Questions to ask:**
- Is this response from a real API?
- Does this prove the functionality works?
- Would this evidence convince a reviewer?
- Are edge cases covered?

### 5. Document Your Decisions

**When you make architectural choices:**
- Add to qa.md immediately
- Explain the "why" not just the "what"
- Note alternatives you considered
- Document constraints or context

**Example:**
```markdown
### Q: Why did we choose EventCollector pattern over direct logging?
**Date:** 2025-10-15
**Context:** Adding analytics to checkout flow
**A:** EventCollector allows us to change analytics providers 
without touching business logic. Keeps analytics expertise 
separate from checkout expertise.
**Impact:** All analytics goes through EventCollector going forward.
```

### 6. Maintain Boundaries Vigilantly

**You are the guardian of architecture:**

**When you see boundary violations:**
- Stop and point it out
- Explain why it's wrong
- Suggest the correct decomposition
- Don't let it slide "just this once"

**Example violations to catch:**
```typescript
// ❌ STOP - Data component sending emails
class DataComponent {
  async save(user) {
    await db.save(user);
    await sendWelcomeEmail(user); // NO! Different expertise
  }
}

// ✅ CORRECT - Composition
await DataComponent.save(user);
await CommunicationComponent.sendWelcome(user);
```

### 7. Insist on Real Tests

**Don't accept:**
- "I wrote tests but can't run them" (get environment)
- "These mock tests should be good enough" (need real tests)
- "I'll test it later" (test NOW)
- "It probably works" (PROVE it works)

**Do accept:**
- "Here are the demos with I/O evidence"
- "All tests passed with real services"
- "Output files show actual API responses"
- "Environment was verified before testing"

### 8. Think Long-Term

**Every decision, ask:**
- Will this be maintainable in 2 years?
- Can a new developer understand this?
- Are we building technical debt?
- Is this the right decomposition?

**Resist:**
- Quick hacks to "get it done"
- Mixing concerns "just for now"
- Skipping tests "to save time"
- Poor naming "we'll fix later"

---

## Communication Principles

### Be Specific with Cursor

**Good instructions:**
```
"Add CacheInvalidator sub-component to DataComponent.
Function: invalidate cache entries when data changes.
Should listen to data.updated events.
Needs Redis connection from environment."
```

**Vague instructions:**
```
"Make the data stuff faster" // What stuff? How?
"Add caching" // Where? What caching strategy?
```

### Explain Your Reasoning

**When you make decisions:**
```
"Let's put this in BusinessLogicComponent because 
it's a domain rule about order validation, not about 
data storage. Keep expertise boundaries clear."
```

**Why this helps:**
- Cursor learns your thinking
- Gets documented in qa.md
- Team understands decisions
- Future you remembers why

### Ask Questions Actively

**Don't assume Cursor knows your context:**
```
"Before we proceed, what does the current architecture 
look like? Show me the component breakdown."

"How will this new component compose with existing ones?"

"What environment do we need to test this properly?"
```

### Correct Promptly

**When Cursor does something wrong:**
- Point it out immediately
- Explain why it's wrong
- Show the correct approach
- Add to qa.md so it learns

```
"This is mixing business logic with data access. 
Business rules should be in BusinessLogicComponent,
not in DataComponent. Let's refactor."
```

---

## Quality Principles

### 1. No Boundary Violations

**You enforce this:**
- Every component has ONE expertise
- Every sub-component has ONE function
- No mixing concerns
- No shortcuts

**When pressure to move fast:**
```
"We could hack this in quickly, but it would violate 
boundaries and create technical debt. Let's do it right 
with proper decomposition. It's only 20% more time 
for 500% better maintainability."
```

### 2. Evidence-Based Confidence

**Only claim something works when:**
- Real tests exist with I/O evidence
- All use cases covered
- Edge cases tested
- Evidence can be reviewed

**Don't accept:**
- "It should work"
- "I tested it locally" (where's the evidence?)
- "The mock tests pass"
- "Trust me"

### 3. Documentation is Not Optional

**Insist on:**
- README before implementation
- Test plan before coding
- Updated architecture.md
- Learnings in qa.md

**If Cursor forgets:**
```
"Before we continue, let's update the README to 
reflect these changes. Future developers need to 
understand this."
```

### 4. Naming Reflects Reality

**Enforce clear names:**
- Components named by expertise
- Sub-components named by function
- No vague terms (Manager, Handler, Util)
- Names must not mislead

**Reject bad names:**
```
❌ "DataHandler" - vague
✅ "CacheInvalidator" - clear function

❌ "UserComponent" - feature, not expertise
✅ "UserDataComponent" - clear expertise
```

---

## Collaboration Principles

### With Cursor

**Treat Cursor as a junior developer who:**
- Needs clear instructions
- Benefits from explanation
- Learns from corrections
- Gets better with feedback

**You are:**
- The architect
- The decision maker
- The environment provider
- The quality gatekeeper

### With Team

**Share learnings:**
- Review qa.md together
- Discuss architectural decisions
- Show test evidence in reviews
- Teach Poiesis to new members

**Code reviews:**
- Check for boundary violations
- Verify test evidence exists
- Ensure documentation updated
- Validate expertise separation

### With Stakeholders

**Explain in business terms:**
```
"We're building with Poiesis methodology, which means:
- Clearer code organization
- Better testability
- Faster onboarding
- Lower maintenance costs
- Higher quality

It takes slightly more time upfront but pays off 
10x in maintainability."
```

---

## Time Management Principles

### When to Go Fast

**Speed is appropriate for:**
- Pure bug fixes in existing components
- Small feature additions to established patterns
- Documentation updates
- Test additions

**Fast doesn't mean sloppy:**
- Still maintain boundaries
- Still write tests
- Still update docs
- Just less planning needed

### When to Go Slow

**Take your time for:**
- New component creation
- Architectural decisions
- Boundary questions
- Decomposition planning
- First-time patterns

**Slow means thoughtful:**
- Thorough test planning
- Multiple design considerations
- Team discussion
- Documented reasoning

### The Quality Equation

```
Time now × 1.2 = Time saved × 10

20% more time upfront designing properly
= 10× less time debugging and maintaining later
```

**Communicate this to stakeholders.**

---

## Problem-Solving Principles

### When Stuck

**Don't:**
- Force a bad solution
- Mix concerns to "make it work"
- Skip testing "for now"
- Create technical debt

**Do:**
- Step back and reconsider decomposition
- Ask: "What's the real expertise here?"
- Consult methodology documents
- Discuss with team
- Document the decision process

### When Cursor Suggests Wrong Approach

**Engage constructively:**
```
"I see you're proposing X, but that would mix 
authentication with authorization. These are 
different expertises. Let's create two components:
AuthenticationComponent and PermissionComponent."
```

**Then document:**
```markdown
### Q: Why separate Auth and Permission components?
**A:** Authentication (who you are) and Authorization 
(what you can do) are different expertises. Separating 
them keeps boundaries clear and allows independent evolution.
```

### When Environment is Missing

**Don't:**
- Let Cursor fake it
- Accept mock-only tests
- Skip real testing
- Claim it's "done"

**Do:**
- Provide environment promptly
- If can't provide, document why
- Set up test services/accounts
- Make it a priority

---

## Growth Principles

### Continuous Learning

**You should:**
- Review qa.md regularly
- Note what patterns work
- Identify anti-patterns
- Share learnings with team
- Update methodology when needed

**Poiesis evolves:**
- Based on real-world use
- From team discoveries
- Through qa.md documentation
- By continuous refinement

### Teaching Others

**When onboarding new developers:**
1. Start with methodology document
2. Show existing component structure
3. Review test evidence together
4. Pair on creating one component
5. Review their first solo component
6. Add their learnings to qa.md

### Self-Correction

**When you realize a mistake:**
- Document it in qa.md
- Fix it properly
- Explain to Cursor what was wrong
- Update architecture if needed
- Don't hide mistakes - they're learning opportunities

---

## Anti-Patterns for Developers

### Don't Do These

❌ **Rubber-stamp Cursor proposals without reading**
- You're the architect, review carefully

❌ **Let boundary violations slide**
- Each violation makes the next easier to justify

❌ **Accept "I can't test this"**
- There's always a way; find it or create it

❌ **Skip documentation "to save time"**
- You'll waste 10× the time later

❌ **Pressure for quick hacks**
- Technical debt compounds exponentially

❌ **Assume Cursor knows your context**
- Provide clear, specific instructions

❌ **Ignore qa.md**
- It's institutional memory; use it

❌ **Work in isolation**
- Share decisions, learnings, patterns

---

## Success Patterns

### You're Doing It Right When

✅ Components have clear, single expertises  
✅ Boundaries are obvious and maintained  
✅ All components have test plans  
✅ Real tests with I/O evidence exist  
✅ New developers understand the code  
✅ Changes are easy to make  
✅ Documentation is current  
✅ qa.md grows steadily  
✅ Technical debt is minimal  
✅ You're confident in the code  

### Team is Thriving When

✅ Code reviews are fast (clear structure)  
✅ Onboarding is quick (good docs)  
✅ Bugs are rare (good tests)  
✅ Features add cleanly (good decomposition)  
✅ Everyone follows Poiesis naturally  
✅ Knowledge is shared (qa.md)  
✅ Velocity is high (maintainable code)  
✅ Quality is consistent  

---

## Remember

**You are the human in the loop.**

Cursor is a powerful tool, but YOU are:
- The architect
- The decision maker
- The quality guardian
- The environment provider
- The team leader

**Your role is critical:**
- Cursor implements, you guide
- Cursor proposes, you approve
- Cursor tests, you verify
- Cursor documents, you review

**Together:**
- Build by expertise
- Compose by function
- Prove by evidence
- Grow by learning

---

*"The quality of the work depends on the quality of the thought that precedes it."*

**Think well. Build well. Test well. Document well.**

This is Poiesis.