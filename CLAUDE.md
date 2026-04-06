# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser extension (Chrome + Firefox) that fills web forms with realistic fake data. Supports text inputs, dropdowns, checkboxes, radio buttons, and file uploads.

## Development Commands

### Loading Extension in Browser

**Chrome:**
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `extensions/chrome` folder

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select `manifest.json` from `extensions/firefox`

### Testing Changes

Make changes to `extensions/chrome/content.js`, then:
1. Go to `chrome://extensions`
2. Click the refresh icon on the extension card

## Architecture

```
extensions/
├── chrome/           # Chrome (Manifest V3)
│   ├── content.js    # Main logic: form detection, field filling, fake data generation
│   ├── popup.js      # Extension popup UI (Fill Form button)
│   ├── options.js    # Settings page
│   ├── popup.html
│   ├── options.html
│   └── manifest.json
└── firefox/          # Firefox (Manifest V2)

tests/
├── e2e/              # Playwright E2E tests
└── form-test/        # Test page with various frameworks

scripts/              # Automation scripts
```

### Key Files

- **extensions/chrome/content.js** (~1000 lines): Core extension logic
  - `__bengaliFakeFill()` - Main entry point
  - `collectFromRoot()` - Collects form elements including Shadow DOM
  - `guessAndFillInput()` - Handles standard inputs
  - `processSequentialVueSelect()` - Handles Vue Select, Element Plus, Ant Design, React Select dropdowns
  - `fillSelect2()` - jQuery Select2 support
  - Fake data generators: `fakeName()`, `fakeEmail()`, `fakePhone()`, `fakeAddress()`, etc.

- **extensions/chrome/options.js**: Settings management via chrome.storage
  - Toggle individual field types
  - Custom rules (fixed values, text patterns, regex)
  - Phone format (local `01X` vs international `+8801X`)
  - Custom files for file input auto-fill

### Framework Support

Content script detects and handles:
- Native HTML inputs/selects
- Vue Select / vue-select
- Element Plus (el-select)
- Ant Design (ant-select)
- React Select
- Material UI (MUI)
- Angular Material
- jQuery Select2

## Storage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `formSettings` | object | Field type toggles (name, email, phone, etc.) |
| `customRules` | array | Custom field mapping rules |
| `phoneFormat` | string | `'local'` or `'international'` |
| `shortcutEnabled` | boolean | Keyboard shortcut toggle |
| `customFiles` | object | Custom image/PDF/DOC for file inputs |

## Keyboard Shortcut

`Ctrl+Shift+V` then press `V` again (double-tap) to fill forms.

## Important Behaviors

- Uses `chrome.storage.sync` for settings (Chrome) and `chrome.storage.local` for custom files
- Dispatches native `input`/`change` events so frameworks detect the changes
- Scrolls to elements before filling
- Adds visual feedback (blue glow) during filling
- Processes elements in visual order (top-left to bottom-right)
