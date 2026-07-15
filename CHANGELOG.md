# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


### Added
- Initial public release of Popup Lookup add-on.
- Automated GitHub Release workflow with artifact publishing.

### Changed
- Build now reads version directly from `manifest.json`.
- Build now outputs only `.ankiaddon` artifact.

### Removed
- Standalone `version.json` file.
- `scripts/bump_version.py` script.

[Unreleased]: https://github.com/OWNER/REPO/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/OWNER/REPO/releases/tag/v0.1.0

## v0.10.0 (2026-07-15)

### Feat

- add popover_theme setting and implement Pinia settings store for state management
- create SettingsModal component with language, trigger, and layout configuration options
- implement App shell and settings trigger with updated runtime configuration retrieval
- add Pinia store for managing popover state and UI visibility
- add SettingsModal component for managing addon preferences

## v0.9.0 (2026-07-13)

### Feat

- implement Pinia store for application settings management
- implement SettingsModal with custom styling, localization, and Vite build configuration
- implement MainPopover component with floating-ui positioning and lookup/translate result rendering
- implement MainPopover component with i18n support, floating UI positioning, and lookup/translate handlers
- implement DefinitionSubPanel and ImageSubPanel components for popover extension content

## v0.8.0 (2026-07-12)

### Feat

- implement MainPopover component and sub-panels for dictionary lookup and image search features
- implement popover UI component with theme-aware styling and structure
- implement dictionary API service for Free Dictionary, Naver KOVI, and Wiktionary lookups
- implement dictionary lookup and translation services with initial UI components
- implement lookup feature UI components and backend handler
- implement image search and display functionality via new sub-panel components
- implement settings modal UI with custom theme, layout, and control styles
- add styling and core popup functionality for the dictionary interface
- add CSS styles and JavaScript logic for the popup interface
- implement modular SettingsModal UI and build configuration for web-src
- add popup style definitions and settings modal component structure
- implement base styles and vue component for settings modal and add popup CSS injection functionality
- implement new global design system styles and popup component structure
- implement custom select component and integrate into new settings modal UI
- implement settings infrastructure with persistent theme and font size controls
- add popup CSS injection script and ignore temp directory
- add settings UI and configure popover preferences for the extension
- add popup CSS styles and JavaScript implementation for the extension UI
- implement App component with selection-based popover trigger and inject CSS variables for consistent styling
- implement settings modal, i18n, and core UI components for extension popup

## v0.7.0 (2026-07-05)

### Feat

- add Naver KOVI API integration for Korean word definitions
- initialize Vue 3 application with Pinia for state management
- update addon version and enhance runtime settings handling in popup.js
- enhance cleanup function and update package name handling in build_release script

## v0.6.0 (2026-04-04)

### Feat

- add support for Traditional Chinese and enhance language detection logic
- add docs directory to .gitignore
- add auto play audio mode and hide home settings button options

## v0.5.0 (2026-03-29)

### Feat

- enhance loading states and layout adjustments in popup rendering
- update header alignment and enhance timeout handling in popup
- enhance handle_lookup to fallback on Google translation and add tests for fallback scenarios
- update extension name to include 'DictOver' for better branding
- implement post-push hook for automated release builds and prepare release notes from changelog

## v0.4.0 (2026-03-28)

### Feat

- enhance settings modal with avatar link and support note
- add definition language mode settings and update related functionality
- add image search functionality and UI enhancements

## v0.3.0 (2026-03-27)

### Feat

- Enhance loading dots styling and animation for improved visibility
- Add loading dots component and integrate into loading states
- Change default source language to 'auto' and update related settings
- Update popover shortcut from 'Alt+1' to 'Shift' and adjust related settings
- Implement audio stop functionality and manage active HTML audio elements
- Add French language support across various components

## v0.2.0 (2026-03-27)

### Feat

- Add Commitizen configuration and pre-push hook for versioning and changelog management
- Enhance GitHub release workflow and add changelog for version tracking
- Implement install ping marker reading and enhance installation tracking logic
- Implement install ping functionality to track addon installations
- Refactor settings modal layout and improve radio button handling for shortcut options
- Add debug panel visibility toggle and audio playback icon to UI
- Enhance settings management with new boolean coercion and config file handling
- Add audio playback functionality and language normalization

### Fix

- Align text to the left for translation components in popup CSS
- Update asset version and improve settings modal behavior for deck browser
