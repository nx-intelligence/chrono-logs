#!/bin/bash

# Athenix-Poiesis Setup Script
# This script sets up Poiesis framework for athenix sub-packages

set -e

echo "🚀 Setting up Athenix-Poiesis..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from your project root."
    exit 1
fi

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if @nx-intelligence/xronox is installed
if ! npm list @nx-intelligence/xronox > /dev/null 2>&1; then
    echo "❌ Error: @nx-intelligence/xronox is not installed."
    echo "Please run: npm install @nx-intelligence/xronox"
    exit 1
fi

# Check if @sagente/xronolog is installed
if ! npm list @sagente/xronolog > /dev/null 2>&1; then
    echo "❌ Error: @sagente/xronolog is not installed."
    echo "Please run: npm install @sagente/xronolog"
    exit 1
fi

# Check if athenix-config.json exists
if [ ! -f "athenix-config.json" ]; then
    echo "❌ Error: athenix-config.json not found."
    echo "Please create athenix-config.json in your project root."
    echo "See docs/athenix-config.md for template."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Verify Cursor rules are in place
echo "📝 Verifying Cursor rules..."

required_rules=(
    ".cursor/rules/00-poiesis-core.mdc"
    ".cursor/rules/10-poiesis-boundaries.mdc"
    ".cursor/rules/15-poiesis-testing.mdc"
    ".cursor/rules/20-poiesis-migration.mdc"
    ".cursor/rules/30-athenix-logging.mdc"
    ".cursor/rules/40-athenix-data-tier.mdc"
    ".cursor/rules/90-poiesis-verification.mdc"
    ".cursor/rules/99-poiesis-safety.mdc"
)

for rule in "${required_rules[@]}"; do
    if [ ! -f "$rule" ]; then
        echo "❌ Error: $rule not found."
        echo "Please copy .cursor/rules/ from Athenix-Poiesis to your project."
        exit 1
    fi
done

echo "✅ Cursor rules verified"

# Verify documentation is in place
echo "📚 Verifying documentation..."

required_docs=(
    "docs/context.md"
    "docs/poiesis.md"
    "docs/xronolog.md"
    "docs/xronox.md"
    "docs/athenix-config.md"
    "docs/testing-principles.md"
    "docs/developer-principles.md"
)

for doc in "${required_docs[@]}"; do
    if [ ! -f "$doc" ]; then
        echo "❌ Error: $doc not found."
        echo "Please copy docs/ from Athenix-Poiesis to your project."
        exit 1
    fi
done

echo "✅ Documentation verified"

# Verify templates are in place
echo "📋 Verifying templates..."

required_templates=(
    "templates/bug-report-cursor.md"
    "templates/bug-report-human.md"
    "templates/cr-template-cursor.md"
    "templates/cr-template-human.md"
    "templates/test-plan-cursor.md"
    "templates/package.json"
)

for template in "${required_templates[@]}"; do
    if [ ! -f "$template" ]; then
        echo "❌ Error: $template not found."
        echo "Please copy templates/ from Athenix-Poiesis to your project."
        exit 1
    fi
done

echo "✅ Templates verified"

# Check if context.md needs to be created
if [ ! -f "docs/context.md" ] || [ ! -s "docs/context.md" ]; then
    echo "📝 Creating context.md template..."
    cat > docs/context.md << 'EOF'
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

## Configuration
- athenix-config.json: Required for athenix configuration
EOF
    echo "✅ context.md template created"
else
    echo "✅ context.md already exists"
fi

# Final verification
echo "🔍 Final verification..."

# Check package.json has required dependencies
if ! grep -q "@nx-intelligence/xronox" package.json; then
    echo "⚠️  Warning: @nx-intelligence/xronox not found in package.json dependencies"
    echo "Please run: npm install @nx-intelligence/xronox"
fi

if ! grep -q "@sagente/xronolog" package.json; then
    echo "⚠️  Warning: @sagente/xronolog not found in package.json dependencies"
    echo "Please run: npm install @sagente/xronolog"
fi

# Check if .gitignore exists and add config files if needed
if [ -f ".gitignore" ]; then
    if ! grep -q "*-config.json" .gitignore; then
        echo "📝 Adding config files to .gitignore..."
        echo "" >> .gitignore
        echo "# Config files with sensitive data" >> .gitignore
        echo "*-config.json" >> .gitignore
    fi
else
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# Config files with sensitive data
*-config.json

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF
fi

echo ""
echo "🎉 Athenix-Poiesis setup complete!"
echo ""
echo "Next steps:"
echo "1. Read docs/context.md and update it with your package details"
echo "2. Read docs/xronolog.md to learn how to use xronolog"
echo "3. Read docs/xronox.md to learn how to use xronox"
echo "4. Read docs/athenix-config.md to understand config structure"
echo "5. Start development following Poiesis principles"
echo ""
echo "Remember: This is for athenix sub-packages only."
echo "Use @sagente/xronolog for logging, not logs-gateway."
echo "Use @nx-intelligence/xronox for data operations, not direct MongoDB."
echo ""
echo "Happy coding! 🚀"
