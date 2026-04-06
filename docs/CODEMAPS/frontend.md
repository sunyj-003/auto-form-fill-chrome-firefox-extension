# 前端结构

## 扩展 UI 页面

### 设置页面 (chrome://extensions → 选项)
- `extensions/chrome/options.html` - 设置 UI
- `extensions/chrome/options.js` - 设置逻辑 (chrome.storage API)

### 弹出窗口 (chrome://extensions → 扩展图标)
- `extensions/chrome/popup.html` - 弹出窗口 UI
- `extensions/chrome/popup.js` - 弹出窗口逻辑

## 关键文件
extensions/chrome/options.js (设置管理，约 150 行)
extensions/chrome/popup.js (弹出窗口 UI 逻辑，约 50 行)

## 状态管理
- chrome.storage.sync (设置)
- chrome.storage.local (自定义文件)

<!-- Generated: 2026-04-07 | Files scanned: 6 | Token estimate: ~300 -->
