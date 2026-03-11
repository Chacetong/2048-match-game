# TileFuse Version Info

**Current Version:** 1.2.1
**Author:** Chace Tong
**Last Updated:** 2026-03-11

## Version Management

### Update Version Number
```bash
# Patch version (1.2.0 → 1.2.1)
./update-version.sh patch

# Minor version (1.2.0 → 1.3.0)
./update-version.sh minor

# Major version (1.2.0 → 2.0.0)
./update-version.sh major
```

### Auto-Update Timestamp
The timestamp is automatically updated when you commit:
```bash
git add .
git commit -m "Your commit message"
# Timestamp auto-updates via pre-commit hook
git push
```

### Manual Setup (if needed)
```bash
./setup-hooks.sh
```

## Version Files
- `version.json` - Source of truth for version info
- `js/version.js` - JavaScript module with version functions
- `index.html` - Version display in footer
- `CHANGELOG.md` - Version history
