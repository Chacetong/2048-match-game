# Changelog

All notable changes to TileFuse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.2.2] - 2026-03-11

### Added
- Visual feedback for Upgrade prop: max level tiles are dimmed when Upgrade is active
- Cross-prop state management: activating one prop exits other active props

### Fixed
- Fixed opacity stacking issue in Upgrade prop disabled tiles

## [1.2.1] - 2026-03-11

### Added
- Upgrade prop: allows upgrading a non-max level tile by 1 level
- Visual fallback for tiles above lv12 (uses lv12 assets)

## [1.2.0] - 2026-03-11

### Added
- Level-based game system (Lv.1-Lv.12+) replacing traditional 2/4/8/16 numbers
- Difficulty selection: Easy (5×5), Normal (4×4), Hard (3×3)
- Start page with difficulty buttons
- Separate best score tracking for each difficulty
- Quit button in restart dialog to return to main menu
- Dynamic tile spawn logic based on current board state
- Version tracking system

### Changed
- Complete UI redesign with cleaner style
- Plate and Pattern selectors now use slider switches
- Logo on game page changed to white version
- Board grid size no longer changeable mid-game
- All tile images renamed from value-based (2.png) to level-based (1.png)

### Removed
- Grid size switcher from game page
- Traditional 2048 number system
- Legacy value-to-level conversion logic

## [1.1.0] - Earlier

### Added
- Switch prop for swapping two tiles
- Undo prop for reverting moves
- Pattern overlay system
- Multiple theme support

## [1.0.0] - Initial Release

### Added
- Classic 2048 gameplay
- 4×4 grid
- Score tracking
- Basic animations
