# @sagente/xronolog

Structured logging with data tier persistence for external applications.

**Package:** `@sagente/xronolog`  
**Scope:** `@sagente`  
**Purpose:** Structured logging with data tier integration  
**Used by:** Athenix packages and external applications

## Installation

```bash
npm install @sagente/xronolog
```

## API Reference

### createLogger(options)

Creates a logger instance with data tier integration.

**Parameters:**
- `options.level` - Minimum log level ('ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE')
- `options.service` - Service identifier
- `options.environment` - Environment context
- `options.enableAuditTrail` - Enable audit trails (default: true)
- `options.enablePersistence` - Enable data tier persistence (default: true)

**Returns:** Logger instance

### Logger Methods

```typescript
logger.error(message, metadata)
logger.warn(message, metadata)
logger.info(message, metadata)
logger.debug(message, metadata)
logger.verbose(message, metadata)
```

## Usage Example

```typescript
import { createLogger } from '@sagente/xronolog';

const logger = createLogger({
  level: 'INFO',
  service: 'my-athenix-package',
  enableAuditTrail: true,
  enablePersistence: true
});

logger.info('AI operation completed', { 
  operation: 'generate',
  model: 'gpt-4',
  duration: 1500
});
```

## Key Features

- **Structured logging** - All logs include metadata
- **Data tier integration** - Logs stored via xronox
- **Audit trails** - Complete audit trail of operations
- **Persistence** - Logs versioned and stored permanently
- **Multi-tenancy** - Tenant-aware logging
- **Time-travel queries** - Query logs by time ranges

## Bug Reports & Feature Requests

**Repository:** @sagente/xronolog repository  
**Contact:** Sagente team  
**Process:** Human developer submits issues, not Cursor AI

## Notes

- This is a ROOT package - no sub-package references allowed
- All functionality exposed at root level
- Uses xronox internally for persistence
- NOT for xronox internal use (they use logs-gateway)
