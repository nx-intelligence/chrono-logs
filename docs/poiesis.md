# Poiesis Development Methodology
## Building Software Through Expertise-Based Composition

*From the Greek ποίησις (poiesis): the act of creation, making, and bringing into being*

---

## What Is Poiesis Development?

Poiesis is a software development methodology based on decomposing systems into:

**Components** - Small, manageable units, each with a specific area of expertise or architectural layer

**Sub-Components** - Focused functions within each component that do one thing well

Complex systems emerge through composition of these simple, expert pieces.

---

## Core Structure

### Components = Areas of Expertise

A component encapsulates domain knowledge:
- **Data Layer:** Knowledge of storage, retrieval, persistence
- **Analytics:** Knowledge of metrics, aggregation, insights
- **Authentication:** Knowledge of identity, permissions, sessions
- **Communication:** Knowledge of messaging, notifications, delivery

Each component is the expert in its domain.

### Sub-Components = Specific Functions

Within each component, sub-components handle specific jobs:
- **Within Data Layer:** Caching, Querying, Validation, Migration
- **Within Analytics:** Collection, Aggregation, Reporting, Visualization
- **Within Authentication:** Login, Logout, Token Management, Session Storage
- **Within Communication:** Email Sending, SMS Dispatch, Push Notifications

Each sub-component does exactly one thing.

### Benefits

- **Understandable:** Small pieces are easy to grasp
- **Maintainable:** Changes stay within relevant expertise
- **Testable:** Functions validate independently
- **Composable:** Pieces combine flexibly
- **Evolvable:** New capabilities through new combinations

---

## Methodology Steps

### Step 1: Identify Areas of Expertise

Before building, determine what distinct knowledge domains the system requires.

**Ask:**
- What different types of knowledge are needed?
- What are the natural boundaries between domains?
- What expertise will be reused across features?

**Example - E-commerce System:**
```
Areas of Expertise:
- Data persistence and retrieval
- Payment processing and transactions
- Inventory tracking and management
- Customer communication
- Analytics and reporting
- Authentication and authorization
```

### Step 2: Design Components by Expertise

Create one component per area of expertise.

**Component Characteristics:**
- Encapsulates one domain of knowledge
- Has a clear, specific responsibility
- Exposes a clean interface
- Hides implementation details

**Example:**
```
PaymentComponent
  - Expertise: Financial transactions
  - Responsibility: Processing payments securely
  - Interface: charge(), refund(), getStatus()
  - Does NOT: Send emails, manage inventory, store user data
```

### Step 3: Decompose into Functional Sub-Components

Within each component, identify the distinct functions needed.

**Sub-Component Characteristics:**
- Performs one specific job
- Has clear inputs and outputs
- Can be tested independently
- Named by its function

**Example - Payment Component:**
```
PaymentComponent
├── CardProcessor (function: processing card payments)
├── RefundHandler (function: handling refunds)
├── TransactionLogger (function: logging transactions)
└── FraudChecker (function: detecting fraud)
```

### Step 4: Define Clean Interfaces

Specify how components interact.

**Interface Definition Includes:**
- What the component accepts (inputs)
- What the component produces (outputs)
- What expertise it provides
- What it depends on

**Example:**
```
DataComponent Interface:
  - save(entity): Promise<id>
  - find(query): Promise<entity[]>
  - update(id, changes): Promise<boolean>
  
  Does NOT expose:
  - Database connection details
  - Caching strategy internals
  - Query optimization logic
```

### Step 5: Build Bottom-Up

Construct the system from smallest to largest pieces.

**Order:**
1. Implement individual functions (pure, focused)
2. Group functions into sub-components
3. Compose sub-components into components
4. Compose components into the system

**Example:**
```
1. Function: validateEmail(email)
2. Sub-component: EmailValidator (contains validation functions)
3. Component: Communication (contains EmailValidator + other subs)
4. System: User Registration (uses Communication + Data + Auth)
```

### Step 6: Compose into Systems

Combine components to create system capabilities.

**Composition Patterns:**
- **Sequential:** Data → Transform → Output
- **Parallel:** Multiple components working simultaneously
- **Nested:** Component uses another component internally
- **Event-driven:** Components react to events from others

**Example - User Registration:**
```
Registration = Composition of:
  1. ValidationComponent.validate(userData)
  2. DataComponent.save(user)
  3. AuthComponent.createSession(user)
  4. CommunicationComponent.sendWelcomeEmail(user)
  5. AnalyticsComponent.trackEvent('registration', user)
```

---

## Application Rules

### Rule 1: One Expertise Per Component

Each component must have a single, clear area of expertise.

**Test:** Can you describe the component's expertise in one sentence?

**Wrong:**
- "UserManager" that handles storage, emails, analytics, and permissions (multiple expertises)

**Right:**
- DataComponent: expertise in storage
- CommunicationComponent: expertise in messaging
- AnalyticsComponent: expertise in metrics
- AuthComponent: expertise in permissions

### Rule 2: One Function Per Sub-Component

Each sub-component must perform a single, specific function.

**Test:** Can you name it by what it does?

**Wrong:**
- "DataHandler" (vague, probably doing multiple things)

**Right:**
- "CacheInvalidator" (clear function: invalidating cache)
- "QueryBuilder" (clear function: building queries)
- "SchemaValidator" (clear function: validating schemas)

### Rule 3: Clear Boundaries

Components must not reach into each other's internals.

**Boundary Violations to Avoid:**
- Data layer making business decisions
- Business logic directly accessing storage
- Mixing authentication with authorization
- Combining data collection with reporting

**Correct Pattern:**
```
Component A needs something from Component B
  → A calls B's public interface
  → A does NOT access B's internal state
```

### Rule 4: Name by Expertise and Function

Names must reveal purpose immediately.

**Component Naming (by expertise):**
- DataManager, AuthenticationService, AnalyticsEngine
- CommunicationHub, PaymentProcessor, InventoryTracker

**Sub-Component Naming (by function):**
- CacheInvalidator, TokenGenerator, MetricsAggregator
- EmailSender, QueryBuilder, SchemaValidator

**Anti-Pattern:**
Vague names like "Manager", "Handler", "Utility", "Helper" without context.

### Rule 5: Extract When Expertise Differs

Create a new component when you encounter different domain knowledge.

**Signals:**
- "This requires understanding a different domain"
- "Multiple components would benefit from this"
- "This doesn't fit the current component's expertise"
- "Boundaries are becoming unclear"

**Example:**
Adding payment processing to a user management component → Extract PaymentComponent

### Rule 6: Reuse Expertise, Don't Duplicate

When multiple places need the same expertise, extract a shared component.

**Wrong:**
```
ComponentA has caching logic
ComponentB has caching logic
ComponentC has caching logic
(Duplicated caching expertise)
```

**Right:**
```
CacheComponent (shared expertise)
  ↑
  └─ ComponentA, ComponentB, ComponentC depend on it
```

### Rule 7: Layers as Expertise Boundaries

Use architectural layers as component boundaries.

**Common Layers:**
- **Data Layer:** Components with storage expertise
- **Business Logic Layer:** Components with domain expertise
- **API Layer:** Components with interface expertise
- **Integration Layer:** Components with third-party expertise

Each layer contains components. Each component contains sub-components.

**Example:**
```
Data Layer
├── CacheComponent (expertise: caching)
├── DatabaseComponent (expertise: persistence)
└── QueryComponent (expertise: data retrieval)

Business Logic Layer
├── ValidationComponent (expertise: business rules)
├── WorkflowComponent (expertise: processes)
└── CalculationComponent (expertise: computations)
```

---

## Practical Patterns

### Pattern 1: Layer Composition

Components from different layers compose vertically.

**Example:**
```
API Layer (Interface Component)
  ↓
Business Logic Layer (Validation Component)
  ↓
Data Layer (Database Component)
```

### Pattern 2: Horizontal Composition

Components from the same layer compose horizontally.

**Example:**
```
CacheComponent + DatabaseComponent = Fast Data Access
QueryComponent + CacheComponent = Optimized Queries
```

### Pattern 3: Shared Expertise

Multiple components depend on a single expert component.

**Example:**
```
        LoggingComponent (expertise: logging)
         ↑         ↑         ↑
         |         |         |
    DataComp  AuthComp  PaymentComp
```

### Pattern 4: Event-Driven Composition

Components react to events from other components.

**Example:**
```
DataComponent.save(user)
  → Emits 'user.created' event
    → AnalyticsComponent listens and tracks
    → CommunicationComponent listens and sends email
    → AuditComponent listens and logs
```

---

## Common Scenarios

### Scenario 1: Adding a New Feature

**Question:** Where does dynamic analytics capability go?

**Process:**
1. Is this a new area of expertise? Yes (analytics is distinct from existing components)
2. Create AnalyticsComponent with expertise in metrics/reporting
3. Identify functions needed: Collection, Aggregation, Reporting
4. Create sub-components: EventCollector, MetricsAggregator, ReportGenerator
5. Other components send events to AnalyticsComponent
6. Analytics expertise lives in one place

### Scenario 2: Feature Spans Multiple Expertises

**Question:** How do I implement user registration?

**Answer:** Compose existing components

```
Registration Function = Composition:
  ValidationComponent.validate(userData)
    → DataComponent.save(user)
      → AuthComponent.createSession(user)
        → CommunicationComponent.sendEmail(user)
          → AnalyticsComponent.track('registration')
```

Each component contributes its expertise. No single component does everything.

### Scenario 3: Component Getting Too Large

**Question:** My DataComponent is becoming unwieldy.

**Signals:**
- Too many sub-components
- Mixing different data concerns
- Hard to understand as a whole

**Solution:**
Split by data expertise:
- CacheComponent (expertise: caching)
- QueryComponent (expertise: querying)
- ValidationComponent (expertise: validation)
- MigrationComponent (expertise: schema changes)

Each new component is focused and manageable.

### Scenario 4: Shared Logic

**Question:** Three components need the same validation logic.

**Solution:**
Extract ValidationComponent (expertise: validation rules)
- Contains sub-components for specific validations
- Other components depend on it
- Validation expertise centralized

---

## Validation Checklist

Use this to verify your decomposition follows Poiesis:

**Component Level:**
- [ ] Can I describe this component's expertise in one sentence?
- [ ] Does it have a single, clear responsibility?
- [ ] Is the boundary with other components clear?
- [ ] Does it expose a clean interface?
- [ ] Does it hide implementation details?

**Sub-Component Level:**
- [ ] Can I name this sub-component by its function?
- [ ] Does it do exactly one thing?
- [ ] Can it be tested independently?
- [ ] Are inputs and outputs clear?

**System Level:**
- [ ] Are different expertises in different components?
- [ ] Is expertise reused, not duplicated?
- [ ] Are boundaries respected (no violations)?
- [ ] Can I explain how components compose?

**Anti-Patterns to Avoid:**
- [ ] Components mixing multiple expertises
- [ ] Vague component/sub-component names
- [ ] Reaching into other components' internals
- [ ] Duplicating expertise across components
- [ ] Sub-components doing multiple things

---

## Example: Before and After

### Before Poiesis (Feature-First)

```
ShoppingCart Feature
  - Manages cart state
  - Talks to database
  - Processes payments
  - Updates inventory
  - Sends confirmation emails
  - Logs analytics
  - Validates coupons
  
Single tangled component doing everything.
Change one thing, risk breaking everything.
```

### After Poiesis (Expertise-First)

```
ShoppingCart System = Composition of:

DataComponent (expertise: persistence)
├── CartRepository (function: cart storage)
└── CacheManager (function: caching)

PaymentComponent (expertise: transactions)
├── CardProcessor (function: processing cards)
└── FraudChecker (function: fraud detection)

InventoryComponent (expertise: stock)
├── StockTracker (function: tracking inventory)
└── ReservationManager (function: reserving items)

CommunicationComponent (expertise: messaging)
├── EmailSender (function: sending emails)
└── TemplateRenderer (function: rendering templates)

AnalyticsComponent (expertise: metrics)
└── EventTracker (function: tracking events)

PromotionComponent (expertise: discounts)
└── CouponValidator (function: validating coupons)

Each component focused. Each sub-component clear.
Change one thing, impact isolated.
Test independently. Compose flexibly.
```

---

## Summary

**Poiesis Methodology in Three Steps:**

1. **Decompose by Expertise:** Identify areas of knowledge, create components
2. **Decompose by Function:** Identify specific jobs, create sub-components
3. **Compose into System:** Combine components to create capabilities

**Key Principle:** Build from small, focused, expert pieces that compose into powerful systems.

**Result:** Software that is understandable, maintainable, testable, composable, and evolvable.

---

*Build by expertise. Compose by function. Maintain by boundary.*