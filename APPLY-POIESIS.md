# Applying Athenix-Poiesis to Existing Project

Instructions for Cursor AI to apply Athenix-Poiesis to an existing athenix sub-package project.

## Prerequisites Check

1. **Verify these packages exist:**
   ```bash
   npm view @nx-intelligence/xronox
   npm view @sagente/xronolog
   ```

2. **Check for config file:**
   ```bash
   ls -la athenix-config.json
   ```
   - If missing: STOP and request from user

## Application Steps

### Step 1: Copy Cursor Rules
```bash
# Copy .cursor/rules/ to project root
cp -r Athenix-Poiesis/.cursor/rules/ ./
```

### Step 2: Copy Documentation
```bash
# Copy docs/ to project root
cp -r Athenix-Poiesis/docs/ ./
```

### Step 3: Copy Templates
```bash
# Copy templates/ to project root
cp -r Athenix-Poiesis/templates/ ./
```

### Step 4: Update package.json Dependencies
```bash
# Add required dependencies
npm install @nx-intelligence/xronox @sagente/xronolog
```

### Step 5: Create/Update context.md
```bash
# Create context.md if it doesn't exist
touch docs/context.md
```

Add content to `docs/context.md`:
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

### Step 6: Verify All Prerequisites
```bash
# Check dependencies
npm list @nx-intelligence/xronox @sagente/xronolog

# Check config file
ls -la athenix-config.json

# Check Cursor rules
ls -la .cursor/rules/
```

### Step 7: Run Init Script
```bash
# Make script executable
chmod +x init-athenix-poiesis.sh

# Run setup script
./init-athenix-poiesis.sh
```

## Verification

After application, verify:

1. **Dependencies installed:**
   ```bash
   npm list @nx-intelligence/xronox @sagente/xronolog
   ```

2. **Cursor rules active:**
   ```bash
   ls -la .cursor/rules/
   # Should show: 00-poiesis-core.mdc, 10-poiesis-boundaries.mdc, 15-poiesis-testing.mdc, 20-poiesis-migration.mdc, 30-athenix-logging.mdc, 40-athenix-data-tier.mdc, 90-poiesis-verification.mdc, 99-poiesis-safety.mdc
   ```

3. **Config file exists:**
   ```bash
   ls -la athenix-config.json
   ```

4. **Documentation in place:**
   ```bash
   ls -la docs/
   # Should show: context.md, poiesis.md, xronolog.md, xronox.md, athenix-config.md, testing-principles.md, developer-principles.md
   ```

5. **Templates available:**
   ```bash
   ls -la templates/
   # Should show: bug-report-cursor.md, bug-report-human.md, cr-template-cursor.md, cr-template-human.md, test-plan-cursor.md, package.json
   ```

## What Changed

### Files Added
- `.cursor/rules/00-poiesis-core.mdc` - Core principles (athenix scope)
- `.cursor/rules/10-poiesis-boundaries.mdc` - Boundaries
- `.cursor/rules/15-poiesis-testing.mdc` - Testing
- `.cursor/rules/20-poiesis-migration.mdc` - Migration
- `.cursor/rules/30-athenix-logging.mdc` - Athenix logging (xronolog only)
- `.cursor/rules/40-athenix-data-tier.mdc` - Athenix data tier (xronox only)
- `.cursor/rules/90-poiesis-verification.mdc` - Verification
- `.cursor/rules/99-poiesis-safety.mdc` - Safety
- `docs/context.md` - Package context template
- `docs/poiesis.md` - Poiesis principles (simplified)
- `docs/xronolog.md` - How to use xronolog
- `docs/xronox.md` - How to use xronox
- `docs/athenix-config.md` - Config structure/usage
- `docs/testing-principles.md` - Testing requirements
- `docs/developer-principles.md` - Development guidelines
- `templates/` - All template files
- `APPLY-POIESIS.md` - This file

### Dependencies Added
- `@nx-intelligence/xronox` - Data tier abstraction
- `@sagente/xronolog` - Structured logging with data tier persistence

### Files Modified
- `package.json` - Added xronox and xronolog dependencies

## Next Steps

1. **Read `docs/context.md`** - Define your package purpose
2. **Read `docs/xronolog.md`** - Learn how to use xronolog
3. **Read `docs/xronox.md`** - Learn how to use xronox
4. **Read `docs/athenix-config.md`** - Understand config structure
5. **Start development** - Follow Poiesis principles
6. **Use xronox** - For all data operations
7. **Use xronolog** - For all logging needs

## Scope Limitations

Remember: Athenix-Poiesis has medium scope:

- ✅ **Available:** @nx-intelligence/xronox, @sagente/xronolog
- ❌ **NOT available:** @sagente/athenix (this IS the intelligence tier)
- ❌ **NOT available:** Other tier packages (xoesis, xophia, xnosix)

This is by design to prevent circular dependencies in athenix packages.
