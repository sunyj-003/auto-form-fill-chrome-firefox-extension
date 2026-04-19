# Chrome Extension Release Checklist

## Pre-Release Testing

### Functional Tests
- [ ] All native HTML form fields fill correctly (text, email, password, phone, date, number, url, select, checkbox, radio, textarea, file)
- [ ] Framework adapters work:
  - [ ] Vue Select / vue-select
  - [ ] Element Plus (el-select, el-date-picker)
  - [ ] Ant Design (ant-select)
  - [ ] React Select
  - [ ] Material UI (MUI)
  - [ ] jQuery Select2
- [ ] Custom rules work (fixed value, type mapping, regex patterns)
- [ ] Field type toggle in settings works
- [ ] Phone format toggle (local/international) works
- [ ] Keyboard shortcut (Ctrl+Shift+V) works
- [ ] Site exclusion list works
- [ ] Custom files for file input work

### Settings Tests
- [ ] Settings persist after browser restart
- [ ] Form field type toggles save correctly
- [ ] Custom rules add/remove/edit work
- [ ] Reset to defaults works
- [ ] Custom file upload works (image, PDF, DOC)

### Edge Cases
- [ ] Empty form handled gracefully
- [ ] Sensitive fields (password confirm, credit card, SSN) are skipped
- [ ] Hidden fields handled correctly
- [ ] Disabled fields handled correctly
- [ ] Shadow DOM elements detected

## Code Quality

### Manifest (manifest.json)
- [ ] manifest_version: 3
- [ ] name is descriptive
- [ ] version follows semver
- [ ] description is present
- [ ] icons are present (16, 32, 48, 128)
- [ ] permissions match actual usage
- [ ] host_permissions are correct

### Content Script
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance acceptable (< 2s for typical forms)
- [ ] Error handling for all async operations

### Popup/Options
- [ ] UI renders correctly
- [ ] All interactive elements work
- [ ] Settings save/load correctly

## Security
- [ ] No sensitive data logged to console
- [ ] Custom rules validated before saving
- [ ] File size limits enforced
- [ ] No XSS vulnerabilities in rule rendering

## Documentation
- [ ] README.md is up to date
- [ ] Extension description in store is accurate
- [ ] Screenshots/videos reflect current UI

## Publishing

### Chrome Web Store
- [ ] ZIP package created
- [ ] Package size under 100MB
- [ ] Screenshots uploaded
- [ ] Store listing complete
- [ ] Pricing set (free/paid)
- [ ] Privacy policy URL provided (if needed)

### Verification
- [ ] Extension loads without errors
- [ ] Content script injects on test pages
- [ ] Popup opens and functions
- [ ] Options page opens and saves

## Post-Release
- [ ] Monitor error reports
- [ ] Test on different Chrome versions
- [ ] Test on different OS (Windows, macOS, Linux)
- [ ] Respond to user reviews
