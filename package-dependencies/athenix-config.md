# athenix-config.json

Configuration file for athenix intelligence tier (this project IS building athenix).

**Location:** Project root  
**Purpose:** Configuration for athenix functionality  
**Managed by:** Human developer (prerequisite)

## Structure

```json
{
  "ai": {
    "providers": {
      "openai": {
        "apiKey": "sk-...",
        "model": "gpt-4",
        "temperature": 0.7,
        "maxTokens": 4000
      },
      "anthropic": {
        "apiKey": "sk-...",
        "model": "claude-3-sonnet"
      }
    },
    "defaultProvider": "openai"
  },
  "memory": {
    "enabled": true,
    "persistence": true,
    "ttl": 86400
  },
  "learning": {
    "enabled": true,
    "knowledgeGraph": true,
    "questionRegistry": true
  },
  "integration": {
    "dataTier": {
      "enabled": true,
      "storeInteractions": true
    },
    "logging": {
      "enabled": true,
      "logLevel": "INFO"
    }
  }
}
```

## Configuration Sections

- `ai.providers` - AI provider configurations (OpenAI, Anthropic, Google)
- `ai.defaultProvider` - Default AI provider to use
- `memory` - Memory management settings
- `learning` - Learning and knowledge management settings
- `integration` - Integration with data tier and logging

## Usage

This config is read by athenix root package and all athenix sub-packages during initialization.

## Bug Reports & Feature Requests

**Repository:** athenix package repository  
**Contact:** Package maintainer  
**Process:** Human developer submits issues about config structure/requirements

## Notes

- Config file is a prerequisite, not created by Cursor AI
- Human manages this file
- Cursor AI reads but never modifies config structure
