# @nx-intelligence/xronox

Data tier abstraction with versioning, audit trails, multi-tenancy, and hybrid storage.

**Package:** `@nx-intelligence/xronox`  
**Scope:** `@nx-intelligence`  
**Purpose:** Complete data tier abstraction  
**Used by:** Athenix packages and external applications

## Installation

```bash
npm install @nx-intelligence/xronox
```

## API Reference

### getDataTier()

Initializes and returns data tier instance.

**Returns:** Promise<DataTier>

### DataTier.with(context)

Creates operations context.

**Parameters:**
- `context.tenantId` - Tenant identifier
- `context.actor` - Actor information (id, type)
- `context.reason` - Reason for operation

**Returns:** Operations interface

### Operations API

```typescript
await ops.create(collection, data)
await ops.update(collection, id, changes)
await ops.query(collection).where({...}).execute()
await ops.delete(collection, id)
```

## Usage Example

```typescript
import { getDataTier } from '@nx-intelligence/xronox';

const dataTier = await getDataTier();
const ops = dataTier.with({
  tenantId: 'tenant-123',
  actor: { id: 'user-456', type: 'user' },
  reason: 'User operation'
});

const result = await ops.create('collection', data);
```

## Key Features

- **Automatic versioning** - Every change creates new version
- **Audit trails** - Complete who/what/when/why tracking
- **Multi-tenancy** - Tenant-isolated data operations
- **Time-travel queries** - Query data from any point in time
- **Hybrid storage** - MongoDB + S3 for large content

## Bug Reports & Feature Requests

**Repository:** @nx-intelligence/xronox repository  
**Contact:** NX Intelligence team  
**Process:** Human developer submits issues, not Cursor AI

## Notes

- This is a ROOT package - no sub-package references allowed
- All functionality exposed at root level
- Config: requires `xronox-config.json` in project root
