# Tier Configuration Templates

**Configuration file templates for all Poiesis tiers**

---

## Usage

Each Poiesis tier uses a configuration file in the project root:

```
your-project/
├── athenix-config.json    # Intelligence tier
├── xronox-config.json     # Data tier
├── xoesis-config.json     # Discovery tier
├── xophia-config.json     # Expertise tier
├── xnosix-config.json     # Reality/Topology tier
└── src/
```

---

## Template Files

This directory contains templates for tiers beyond the core 3 (logging, data, AI):

- `xoesis-config-template.json` - Discovery tier template
- `xophia-config-template.json` - Expertise tier template
- `xnosix-config-template.json` - Reality/Topology tier template

**For core tiers:**
- See `/docs/logging-guide.md` for xronolog setup
- See `/docs/data-tier-guide.md` for xronox-config.json examples
- See `/docs/intelligence-tier-guide.md` for athenix-config.json examples

---

## How to Use Templates

1. **Copy template to project root:**
   ```bash
   cp templates/tier-configs/xoesis-config-template.json xoesis-config.json
   ```

2. **Replace placeholders:**
   - Change `<to-do: ...>` with actual values
   - Update environment variable references
   - Enable/disable features as needed

3. **Add environment variables:**
   - Add corresponding variables to `.env`
   - Use `ENV::VARIABLE_NAME` pattern in config

---

## Config File Pattern

**Standard naming:** `[tier-name]-config.json` (always dash, not dot)

**Examples:**
- ✅ `athenix-config.json`
- ✅ `xronox-config.json`
- ✅ `xoesis-config.json`
- ❌ `athenix.config.json` (wrong - dot instead of dash)

**See:** `/docs/config-patterns.md` for complete configuration patterns

---

## Environment Variables

Use the `ENV::` prefix to reference environment variables:

```json
{
  "connection": {
    "url": "ENV::DATABASE_URL",
    "apiKey": "ENV::API_KEY"
  }
}
```

**Never hardcode sensitive values in config files.**

---

## For More Information

- **Config Patterns:** `/docs/config-patterns.md`
- **Package Topology:** `/docs/packages-topology.md`
- **Implementation Details:** `/docs/implementation-landscape.md`
- **NX Intelligence Specifics:** `/docs/nx-intelligence-specifics.md`

---

*These templates help you set up tiers beyond the core 3 documented tiers.*

