# Athenix-Poiesis Framework Guide

**For:** Intelligence tier packages (athenix sub-packages)
**Scope:** Medium - data tier + logging infrastructure
**Prerequisites:** `@nx-intelligence/xronox`, `@sagente/xronolog`, `athenix-config.json`

## What is Athenix-Poiesis?

Athenix-Poiesis is a specialized variation of the Poiesis framework designed specifically for athenix sub-packages. It provides data tier and logging infrastructure without intelligence tier references to prevent circular dependencies.

## When to Use

✅ **Use Athenix-Poiesis when:**
- Building `@sagente/athenix` sub-packages
- Working on AI functionality that needs data persistence
- Need data tier + logging infrastructure

❌ **Don't use Athenix-Poiesis when:**
- Building external applications (use Poiesis)
- Building xronox packages (use Xronox-Poiesis)
- Building athenix root package (this IS the intelligence tier)

## Architecture Flow

Based on the Athenix Poiesis diagram:

```
Applications/Services → Root Athenix → Sub-Packages → External Infrastructure
```

**Key Flow:**
1. **`athenix-services`** and **`athenix-demos`** → interact with **Root Athenix** only
2. **Root Athenix** → orchestrates **`athenix-<functionality>`** sub-packages
3. **`athenix-<functionality>`** → uses **`@nx-intelligence/xronox`** for data operations
4. **`athenix-config`** → consumed by Root and sub-packages (prerequisite)

**Sibling Packages (shown in diagram):**
- `athenix-services` - Service implementations consuming the root package
- `athenix-demos` - Demonstrations and test scenarios

**Sub-Packages:**
- `athenix-<functionality>` - Each handles one specific AI operation
- `<name-x>-<sub-functionality>` - Optional deeper functionality

## Prerequisites

**Required packages (must exist):**
- `@nx-intelligence/xronox` - Data tier abstraction
- `@sagente/xronolog` - Structured logging with data tier persistence

**Required config files:**
- `athenix-config.json` - Configuration for athenix (prerequisite, not a Poiesis package - must be provided by user if missing)

## What You Get

### 8 Cursor Rules
- `00-poiesis-core.mdc` - Core principles (modified for athenix scope)
- `10-poiesis-boundaries.mdc` - Boundaries
- `15-poiesis-testing.mdc` - Testing
- `20-poiesis-migration.mdc` - Migration
- `30-athenix-logging.mdc` - Use xronolog for logging
- `40-athenix-data-tier.mdc` - Use xronox for data operations
- `90-poiesis-verification.mdc` - Verification
- `99-poiesis-safety.mdc` - Safety

### Documentation
- `docs/context.md` - Package context template
- `docs/poiesis.md` - Poiesis principles (simplified)
- `docs/xronolog.md` - How to use xronolog
- `docs/xronox.md` - How to use xronox
- `docs/athenix-config.md` - Config structure/usage
- `docs/testing-principles.md` - Testing requirements
- `docs/developer-principles.md` - Development guidelines

### Templates
- `templates/bug-report-cursor.md`
- `templates/bug-report-human.md`
- `templates/cr-template-cursor.md`
- `templates/cr-template-human.md`
- `templates/test-plan-cursor.md`
- `templates/package.json` - With xronolog + xronox

## Key Differences from Full Poiesis

### What's Included
- ✅ Data tier with `@nx-intelligence/xronox`
- ✅ Logging with `@sagente/xronolog`
- ✅ Core Poiesis principles
- ✅ Testing and documentation standards
- ✅ Context-driven development

### What's NOT Included
- ❌ No `@sagente/athenix` (this IS the intelligence tier)
- ❌ No intelligence tier rules (this IS the intelligence tier)
- ❌ No other tier packages (xoesis, xophia, xnosix)

## Architecture

```
Athenix Sub-Packages
    ↓ (use xronox for data operations)
@nx-intelligence/xronox
    ↓ (use xronolog for logging)
@sagente/xronolog
    ↓ (persists logs via xronox)
Data Tier Storage
```

**Key principle:** Athenix internal packages use lower-tier packages to avoid circular dependencies.

## Installation

```bash
# Install required packages
npm install @nx-intelligence/xronox @sagente/xronolog

# Copy Athenix-Poiesis to your project root
cp -r Athenix-Poiesis/* .

# Run setup script
./init-athenix-poiesis.sh
```

## Setup Steps

1. **Copy files** - Copy all Athenix-Poiesis files to your project root
2. **Install dependencies** - Run `npm install @nx-intelligence/xronox @sagente/xronolog`
3. **Provide config** - Ensure `athenix-config.json` exists
4. **Run init script** - Execute `./init-athenix-poiesis.sh`
5. **Verify setup** - Check that all files are in place

## Usage

### Data Operations
```typescript
import { getDataTier } from '@nx-intelligence/xronox';

const dataTier = await getDataTier();
const ops = dataTier.with({
  tenantId: 'tenant-123',
  actor: { id: 'user-456', type: 'user' },
  reason: 'AI operation'
});

const result = await ops.create('ai-interactions', {
  prompt: 'Generate content',
  response: aiResponse,
  model: 'gpt-4'
});
```

### Logging
```typescript
import { createLogger } from '@sagente/xronolog';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'INFO',
  service: 'my-athenix-package'
});

logger.info('AI operation completed', { 
  operation: 'generate',
  model: 'gpt-4',
  duration: 1500,
  tokens: 250
});
```

### Context Documentation
Create `docs/context.md`:
```markdown
# Package Context

## Purpose
This package handles [specific athenix functionality].

## Boundaries
- In scope: [what this package does]
- Out of scope: [what this package doesn't do]

## Consumers
- [who uses this package]

## Dependencies
- @nx-intelligence/xronox: For data operations
- @sagente/xronolog: For structured logging
```

## Verification

After setup, verify:

1. **Dependencies installed:**
   ```bash
   npm list @nx-intelligence/xronox @sagente/xronolog
   ```

2. **Cursor rules active:**
   ```bash
   ls -la .cursor/rules/
   ```

3. **Config file exists:**
   ```bash
   ls -la athenix-config.json
   ```

4. **Documentation in place:**
   ```bash
   ls -la docs/
   ```

## Next Steps

1. **Read `APPLY-POIESIS.md`** - Step-by-step Cursor instructions
2. **Create `docs/context.md`** - Define your package purpose
3. **Start development** - Follow Poiesis principles
4. **Use xronox** - For all data operations
5. **Use xronolog** - For all logging needs

## Support

- **Documentation:** See `docs/` folder
- **Templates:** See `templates/` folder
- **Cursor Rules:** See `.cursor/rules/` folder
- **Complete Framework:** See `../Poiesis-Methodology/` for full context

---

**Remember:** This is for athenix internal packages only. External applications should use Poiesis.
