#!/bin/bash
# Setup git hooks for TileFuse

echo "🔧 Setting up git hooks..."

# Configure git to use .githooks directory
git config core.hooksPath .githooks

echo "✅ Git hooks configured to use .githooks/ directory"
echo ""
echo "Hooks active:"
echo "  - pre-commit: Auto-update version timestamp"
echo ""
echo "You can now use:"
echo "  ./update-version.sh [major|minor|patch]  # Update version number"
echo "  git commit                                # Auto-update timestamp"
echo "  git push                                  # Push with updated version"
