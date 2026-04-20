# Chrome Technical Refactor Roadmap

Scope: this repository now targets Chrome MV3 only. Firefox is out of scope.

## Milestone M1: Chrome-only stabilization

1. [x] `chore: remove Firefox code and distribution assets`
   - Delete `extensions/firefox/`
   - Delete `Mozile-Extension/`
   - Remove Firefox-specific docs and publish notes

2. [x] `docs: rewrite project docs for Chrome-only scope`
   - Update `README.md`
   - Update `ARCHITECTURE.md`
   - Update `AGENTS.md`

3. [x] `fix: restore syntax validity for all Chrome content scripts`
   - Validate `extensions/chrome/content.js`
   - Validate `extensions/chrome/generators/fakeData.js`
   - Validate `extensions/chrome/adapters/interface.js`
   - Validate `extensions/chrome/framework-adapters/*.js`

4. [x] `chore: add npm check script for Chrome extension health`
   - Add a single command for syntax checks
   - Keep it usable before release and before test runs

## Milestone M2: Core modularization

5. [x] `refactor: extract Chrome storage access into core/storage`
6. [x] `refactor: centralize fake data generation in generators/fakeData`
7. [x] `refactor: extract field context detection into core/context`
8. [x] `refactor: extract DOM write/event helpers into core/events`
9. [x] `refactor: extract element collection pipeline into core/collector`
10. [x] `refactor: extract auto-fill watcher logic into core/autofill`
11. `refactor: reduce content.js to orchestration-only entrypoint`

## Milestone M3: Adapter standardization

12. `refactor: define unified framework adapter contract`
13. `refactor: migrate Naive UI adapter to shared helpers`
14. `refactor: migrate Element Plus adapter to shared helpers`
15. `refactor: migrate Ant Design adapter to shared helpers`
16. `refactor: migrate React Select adapter to shared helpers`
17. `refactor: migrate MUI adapter to shared helpers`
18. [x] `refactor: add adapter registry and framework dispatch layer`

## Milestone M4: Detection and rules hardening

19. `refactor: define canonical field type model`
20. `feat: add field detection priority pipeline`
21. `feat: add sensitive field skip rules by default`
22. `refactor: separate fixed-value rules from type-mapping rules`
23. `feat: validate custom rule inputs before save`

## Milestone M5: Test and release pipeline

24. `test: add unit tests for fake data generators`
25. `test: add unit tests for field context and detection rules`
26. `test: add integration tests for native HTML form filling`
27. `test: add integration tests for framework adapters`
28. `test: add Playwright smoke test with real Chrome extension loading`
29. `test: convert current debug specs into stable regression cases`
30. `refactor: unify options page settings model with core storage schema`
31. `feat: improve custom files storage boundaries`
32. `feat: add site exclusion / skip list support`
33. `chore: clean repository artifacts and update .gitignore`
34. `chore: add package script for Chrome release bundle`
35. `chore: define release checklist for Chrome extension`
