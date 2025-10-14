# Package Context: [@sagente/package-name]

**Last Updated:** YYYY-MM-DD  
**Status:** [Active | Planning | Deprecated]

---

## Why This Package Exists

### Business Problem
[What business need or technical problem does this solve?]

**Example:**
"We need to collect and analyze user behavior across multiple applications in our ecosystem. Each application was implementing its own analytics differently, causing inconsistent data and duplicate effort."

### Pain Point Before This Package
[What was difficult/impossible before this existed?]

**Example:**
"Before this package:
- Each team implemented analytics separately (4 different implementations)
- Data inconsistent across applications
- No central visibility into user behavior
- Compliance requirements duplicated in each app"

### What Changed
[What is now possible because this exists?]

**Example:**
"Now:
- Single analytics implementation used by all teams
- Consistent event tracking across all applications
- Central data pipeline for analysis
- Compliance handled once, enforced everywhere"

---

## Who This Package Serves

### Primary Consumers

**1. [Application/Service Name]**
- **Team:** [Team name/contact]
- **Use Case:** [How they use this package]
- **Critical For:** [What breaks if this fails]
- **Version Used:** [Which version they depend on]

**Example:**
"1. User Management Service
- Team: Platform Team (@john-smith)
- Use Case: Tracking user registration, login, profile updates
- Critical For: Compliance reporting, user analytics dashboard
- Version Used: @sagente/analytics@^2.1.0"

**2. [Application/Service Name]**
- **Team:** [Team name]
- **Use Case:** [How they use this]
- **Critical For:** [What depends on this]
- **Version Used:** [Version]

### Secondary Consumers
[Teams/services that use this occasionally or for specific features]

### Future Consumers
[Known teams planning to adopt this]

---

## What Consumers Need From This Package

### Functional Requirements

**Must Provide:**
1. [Capability 1] - [Why consumers need this]
2. [Capability 2] - [Why consumers need this]
3. [Capability 3] - [Why consumers need this]

**Example:**
"Must Provide:
1. Event tracking with user context - All teams need to track user actions with consistent metadata
2. Automatic PII redaction - Compliance requirement across all applications
3. Batch event sending - Reduce network overhead for high-volume apps"

**Must NOT Do:**
1. [What's explicitly out of scope] - [Why]
2. [What consumers handle themselves] - [Why]

**Example:**
"Must NOT Do:
1. Store events permanently - Consumers use their own data warehouse
2. Provide analytics UI - Each team has their own dashboards
3. Make business decisions - This is infrastructure, not business logic"

### Non-Functional Requirements

**Performance:**
- [Specific requirement] - [Why it matters]

**Example:**
"Performance:
- Event batching must not delay app response > 50ms
- Memory footprint < 10MB per instance
- Handle 10,000 events/sec sustained load"

**Reliability:**
- [Specific requirement] - [Why it matters]

**Example:**
"Reliability:
- Must not block application if analytics service down
- Local queue with retry mechanism
- Graceful degradation (drop events if needed, don't crash app)"

**Security:**
- [Specific requirement] - [Why it matters]

**Example:**
"Security:
- All PII automatically redacted before sending
- Support for customer-managed encryption keys
- No credentials stored in package (injected at runtime)"

---

## Package Boundaries

### In Scope (What This Package Does)

[Clear list of responsibilities]

**Example:**
"In Scope:
✅ Collecting user events with standardized schema
✅ Redacting PII according to compliance rules
✅ Batching and sending events to analytics service
✅ Retry logic and error handling
✅ Client-side validation of event structure"

### Out of Scope (What This Package Does NOT Do)

[Clear list of what's explicitly not included]

**Example:**
"Out of Scope:
❌ Storing events long-term (handled by data warehouse)
❌ Analyzing or aggregating events (handled by analytics service)
❌ Providing dashboards or UI (each team builds their own)
❌ Making decisions based on events (consumers decide what to track)
❌ User authentication/authorization (consumers handle that)"

### Gray Areas (Needs Discussion)

[Things that might or might not belong here]

**Example:**
"Gray Areas:
⚠️  Should we provide event schema validation? Currently consumers validate themselves.
⚠️  Should we offer sampling/filtering? Currently consumers filter before sending.
⚠️  Should we provide a mock/test mode? Currently consumers write their own test helpers."

---

## How It Fits in the Ecosystem

### Architectural Layer
[Where this sits in the overall architecture]

**Example:**
"Architectural Layer: Infrastructure/Cross-Cutting
- Used by Application Layer (business applications)
- Calls Integration Layer (analytics service API)
- Composes with: Logging, Error Tracking, Monitoring"

### Dependencies

**Depends On (What This Package Needs):**
- [@sagente/package-name] - [Why we need it]
- [@sagente/package-name] - [Why we need it]

**Example:**
"Depends On:
- @sagente/http-client - For sending events to analytics service
- @sagente/config - For runtime configuration
- @sagente/logger - For internal logging"

**Depended On By (Who Needs This Package):**
- [@sagente/package-name] - [How they use it]
- [@sagente/package-name] - [How they use it]

**Example:**
"Depended On By:
- @sagente/user-management - Tracks user lifecycle events
- @sagente/ecommerce-api - Tracks purchase/cart events
- @sagente/admin-portal - Tracks admin actions
- @sagente/mobile-sdk - Mobile app analytics"

### Integration Points

**Sends Data To:**
- [External service] - [What data, why]

**Example:**
"Sends Data To:
- Analytics Service (internal) - Event data for processing
- Dead Letter Queue - Failed events for retry"

**Receives Data From:**
- [Where data comes from]

**Example:**
"Receives Data From:
- Consumer applications - Events to track
- Config Service - PII redaction rules"

---

## Evolution & History

### Version History Context

**v1.x - Initial Release**
- **When:** Q2 2024
- **Why:** First unified analytics approach
- **Consumers:** User Management only
- **Key Decision:** Focus on simplicity, limited features

**v2.x - Production Scale**
- **When:** Q4 2024
- **Why:** Performance issues at scale, needed batching
- **Breaking Changes:** API changed to batched events
- **Consumers:** Added Ecommerce API, Admin Portal
- **Key Decision:** Prioritize reliability over features

**v3.x - Current/Planned**
- **When:** Q1 2025 (planned)
- **Why:** Compliance requirements expanded
- **New Features:** Customer-managed keys, data residency
- **Consumers:** All services must upgrade
- **Key Decision:** Compliance is non-negotiable

### Known Limitations

**Current:**
- [Limitation 1] - [Why it exists, plan to address]
- [Limitation 2] - [Why it exists, plan to address]

**Example:**
"Current:
- No real-time event processing - Batched for performance, addressing in v4
- Single analytics endpoint - No multi-region support yet, planned for v3
- Manual schema updates - Working on schema registry integration"

### Future Direction

**Next 6 Months:**
- [Planned feature/improvement]
- [Planned feature/improvement]

**Example:**
"Next 6 Months:
- Add sampling support for high-volume apps
- Schema registry integration for type safety
- Multi-region support for data residency"

**Next 12+ Months:**
- [Strategic direction]

**Example:**
"Next 12+ Months:
- Real-time event streaming option
- ML-powered anomaly detection
- Self-service schema management"

---

## Decision Making Guidelines

### When to Add Features

**Add Feature If:**
- [ ] Multiple consumers need it (not just one team)
- [ ] It fits the package's core expertise
- [ ] It doesn't violate stated boundaries
- [ ] Consumers can't reasonably implement it themselves

**Don't Add Feature If:**
- [ ] Only one consumer needs it (they should implement)
- [ ] It's consumer-specific business logic
- [ ] It violates package boundaries
- [ ] It creates security/compliance risk
- [ ] It makes the package harder to understand

### When to Say No

**Example Scenarios:**

**Scenario:** "Can you add a dashboard to visualize events?"
**Answer:** No - This is out of scope. Each consumer builds dashboards for their needs. We provide data collection only.

**Scenario:** "Can you filter events based on user permissions?"
**Answer:** No - This is consumer business logic. Consumers decide what to track based on their authorization rules.

**Scenario:** "Can you add a feature just for Team X's use case?"
**Answer:** Maybe - If multiple teams will benefit, yes. If Team X-specific, no - they should wrap/extend the package.

---

## Contact & Ownership

### Package Maintainer
**Primary:** [Name] (@github-handle)  
**Backup:** [Name] (@github-handle)  
**Team:** [Team name]

### Consumer Representatives

**Regular Sync Meeting:**
- When: [Schedule]
- Who: Maintainers + consumer team reps
- Purpose: Prioritization, feedback, roadmap

### Getting Help

**For Consumers:**
- Bug reports: [GitHub Issues link]
- Feature requests: [Process/link]
- Urgent issues: [Slack channel / contact]

**For Contributors:**
- Contributing guide: [Link]
- Development setup: [Link]
- Architecture decisions: [Where documented]

---

## Success Metrics

### How We Measure Success

**Adoption:**
- [Metric] - [Target] - [Why it matters]

**Example:**
"Adoption:
- Number of applications using this: Target 15+ by Q2 2025
- Events tracked per day: Target 10M+ 
- Team satisfaction score: Target 4.5/5"

**Reliability:**
- [Metric] - [Target] - [Why it matters]

**Example:**
"Reliability:
- Uptime: 99.9% (measured at client level)
- Event delivery rate: >99% (with retry)
- Zero consumer application crashes due to this package"

**Performance:**
- [Metric] - [Target] - [Why it matters]

**Example:**
"Performance:
- p95 event tracking latency: <100ms
- Memory footprint: <10MB per instance
- CPU overhead: <5% additional load"

### How Consumers Measure Success

[What consumers care about]

**Example:**
"Consumers Measure:
- Integration effort: <1 day to integrate
- Maintenance effort: <1 hour/month after integration
- Data quality: >95% events captured correctly
- Support burden: <5 tickets/month across all consumers"

---

## Quick Reference

**Elevator Pitch:**
[One sentence: what problem this solves for whom]

**Example:**
"Provides unified, compliant event tracking for all internal applications, eliminating duplicate analytics implementations and ensuring consistent user behavior data."

**Core Value:**
[Why consumers choose this over alternatives]

**Example:**
"Core Value: Single implementation of complex compliance requirements (PII redaction, data residency, audit logging) that all teams can use without becoming experts in these areas."

**When To Use This:**
[Clear guidance on when this package is the right choice]

**Example:**
"Use this when:
✅ You need to track user behavior/events
✅ You're building an internal application
✅ You need compliance with our data policies
✅ You want standardized analytics data

Don't use this when:
❌ You need real-time analytics (use streaming service)
❌ You're building external/public-facing apps (use commercial analytics)
❌ You need custom/proprietary event handling
❌ You're doing system monitoring (use observability service)"

---

## Living Document

This context document should be updated when:
- [ ] New consumers adopt the package
- [ ] Scope/boundaries change
- [ ] Major version released
- [ ] Consumer needs evolve
- [ ] Package direction changes

**Review Schedule:** Quarterly (or before major releases)

**Last Reviewed:** YYYY-MM-DD  
**Next Review:** YYYY-MM-DD