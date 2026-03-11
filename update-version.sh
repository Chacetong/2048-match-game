#!/bin/bash
# TileFuse Version Update Script
# Usage: ./update-version.sh [major|minor|patch]

VERSION_FILE="version.json"
JS_FILE="js/version.js"
HTML_FILE="index.html"

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: ./update-version.sh [major|minor|patch]"
    echo "Example: ./update-version.sh patch"
    exit 1
fi

# Read current version
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' $VERSION_FILE | cut -d'"' -f4)
echo "Current version: $CURRENT_VERSION"

# Parse version parts
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Calculate new version based on argument
case $1 in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
    *)
        echo "Invalid argument. Use: major, minor, or patch"
        exit 1
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S+08:00")

echo "New version: $NEW_VERSION"
echo "Timestamp: $TIMESTAMP"

# Update version.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" $VERSION_FILE
sed -i '' "s/\"lastUpdated\": \"[^\"]*\"/\"lastUpdated\": \"$TIMESTAMP\"/" $VERSION_FILE
echo "✅ Updated $VERSION_FILE"

# Update version.js
sed -i '' "s/version: '[^']*'/version: '$NEW_VERSION'/" $JS_FILE
sed -i '' "s/lastUpdated: '[^']*'/lastUpdated: '$TIMESTAMP'/" $JS_FILE
echo "✅ Updated $JS_FILE"

# Update index.html
sed -i '' "s/data-version>[^<]*/data-version>$NEW_VERSION/" $HTML_FILE
# Update start page version and date
sed -i '' "s/TileFuse v[^<]*/TileFuse v$NEW_VERSION/" $HTML_FILE
sed -i '' "s/Updated: [0-9-]*/Updated: $(date -u +"%Y-%m-%d")/" $HTML_FILE
echo "✅ Updated $HTML_FILE"

# Stage changes
git add $VERSION_FILE $JS_FILE $HTML_FILE

echo ""
echo "🎉 Version updated to $NEW_VERSION"
echo "📦 Changes staged and ready to commit"
echo ""
echo "Next steps:"
echo "  git commit -m \"Release v$NEW_VERSION\""
echo "  git push"
