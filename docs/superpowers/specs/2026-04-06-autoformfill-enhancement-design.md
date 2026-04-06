# AutoForm Fill Extension - 增强设计文档

**日期**: 2026-04-06
**版本**: 1.1.0

## 1. 项目概述

浏览器扩展（Chrome + Firefox）用于自动填充表单。本次更新重点：
1. 修复 Element Plus 组件支持问题
2. 构建自动化测试体系
3. 实现渐进式自动填充

## 2. 紧急修复：Element Plus 支持

### 2.1 问题分析

| 组件 | 状态 | 问题 |
|------|------|------|
| `el-input` | ✅ 正常 | - |
| `el-select` | ⚠️ 部分 | 下拉框无法自动选择 |
| `el-date-picker` | ❌ 未支持 | 日期选择器无法填充 |
| `el-input-number` | ⚠️ 部分 | 可能需要特殊处理 |
| `el-color-picker` | ❌ 未支持 | 颜色选择器 |
| `el-checkbox` | ✅ 正常 | - |
| `el-radio-group` | ✅ 正常 | - |

### 2.2 修复方案

#### 2.2.1 el-select 下拉框

**问题**: 点击后没有正确等待下拉选项出现

**当前代码逻辑**:
```javascript
wrapper.click();
const dropdown = document.querySelector(".el-select-dropdown");
```

**问题原因**:
1. `.el-select-dropdown` 是 Portal 渲染到 body 下的，需要更精确的选择器
2. 没有等待动画完成

**修复方案**:
```javascript
// 1. 使用更精确的选择器
const dropdown = document.querySelector(".el-select-dropdown.el-popper:not(.is-hidden)");

// 2. 添加动画等待
await new Promise(r => setTimeout(r, 100));

// 3. 检查 visible 状态
const visible = dropdown?.style.display !== 'none' &&
                !dropdown?.classList.contains('is-hidden');
```

#### 2.2.2 el-date-picker 日期选择器

**完全新增支持**:

```javascript
async function processElementPlusDatePicker(input) {
  if (input.disabled || input.readOnly) return;

  const picker = input.closest(".el-date-editor");
  if (picker && !picker.classList.contains("is-disabled")) {
    const wrapper = picker.querySelector(".el-input__wrapper");
    if (wrapper) {
      return new Promise(resolve => {
        wrapper.click();

        const tryPick = (attempt = 0) => {
          if (attempt > 12) { resolve(); return; }

          // 查找日期面板
          const panel = document.querySelector(".el-date-picker__popper:not(.is-hidden)");
          if (!panel) { setTimeout(() => tryPick(attempt + 1), 150); return; }

          // 查找可用日期
          const cells = panel.querySelectorAll(".el-date-table__cell:not(.disabled)");
          const validCells = Array.from(cells).filter(o => {
            const r = o.getBoundingClientRect();
            return r.width > 5 && r.height > 5;
          });

          if (validCells.length > 0) {
            rand(validCells).click();
            setTimeout(resolve, 80);
            return;
          }
          setTimeout(() => tryPick(attempt + 1), 120);
        };

        setTimeout(() => tryPick(0), 150);
      });
    }
  }
}
```

#### 2.2.3 el-input-number

**当前代码**: 标准 input 处理可能可以工作，但需要验证

**潜在问题**:
1. Vue 响应式更新需要触发 `input` 事件
2. 可能需要调用组件实例方法

```javascript
// 如果是 el-input-number，尝试调用 setCurrentValue
const inputNumber = input.closest(".el-input-number");
if (inputNumber && window.__POWERED_BY_VUE__) {
  const vm = inputNumber.__vue_parent_component?.ctx[0];
  if (vm && typeof vm.setCurrentValue === 'function') {
    vm.setCurrentValue(parseInt(value));
  }
}
```

## 3. 自动化测试体系

### 3.1 测试策略

| 类型 | 工具 | 覆盖范围 |
|------|------|----------|
| 单元测试 | Jest | fakeName, fakeEmail, guessAndFillInput 等核心函数 |
| E2E 测试 | Playwright | 浏览器扩展完整流程 |

### 3.2 单元测试 (Jest)

**测试文件结构**:
```
Chrome-Extension/
├── content.js
└── __tests__/
    ├── fake-data.test.js    # 假数据生成器
    ├── field-detection.test.js  # 字段检测
    └── helpers.test.js       # 工具函数
```

**核心测试用例**:

```javascript
// fake-data.test.js
describe('fakeName', () => {
  test('返回包含空格的名字', () => {
    const name = fakeName();
    expect(name).toMatch(/\w+ \w+/);
  });

  test('名字在已知列表中', () => {
    const name = fakeName();
    const allNames = [...firstNames, ...lastNames];
    const [first, last] = name.split(' ');
    expect(allNames).toContain(first);
    expect(allNames).toContain(last);
  });
});

describe('fakePhone', () => {
  test('国际格式以 +8801 开头', () => {
    const phone = fakePhone();
    expect(phone).toMatch(/^\+8801\d{9}$/);
  });

  test('本地格式以 01 开头', () => {
    const phone = fakePhoneLocal();
    expect(phone).toMatch(/^01\d{9}$/);
  });
});
```

### 3.3 E2E 测试 (Playwright)

**测试文件结构**:
```
e2e/
├── tests/
│   ├── basic-form.test.js       # 基础表单填充
│   ├── element-plus.test.js     # Element Plus 组件
│   ├── antd.test.js             # Ant Design 组件
│   ├── progressive-fill.test.js  # 渐进式填充
│   └── keyboard-shortcut.test.js # 键盘快捷键
├── pages/
│   ├── form-page.js             # 测试页面封装
│   └── extension-page.js        # 扩展 popup 页面
└── playwright.config.js
```

**基础测试流程**:

```javascript
// basic-form.test.js
import { test, expect } from '@playwright/test';

test('填充基础表单', async ({ page }) => {
  // 加载测试页面
  await page.goto('file://' + process.cwd() + '/form-test/element-test.html');

  // 注入扩展 content.js
  await page.evaluate(() => {
    // 动态加载 content.js
  });

  // 触发填充
  await page.keyboard.press('Control+Shift+V');
  await page.keyboard.press('V');

  // 验证填充结果
  const username = await page.locator('input[v-model="form.username"]').inputValue();
  expect(username).toBeTruthy();
});
```

### 3.4 测试运行命令

```bash
# 单元测试
npm test

# E2E 测试
npm run e2e

# 全部测试
npm run test:all
```

## 4. 渐进式自动填充

### 4.1 设计目标

- **自动检测**: 使用 MutationObserver 监听 DOM 变化
- **无遗漏**: 定时器 fallback 处理特殊情况
- **可控制**: 用户可开启/关闭渐进式填充
- **防重复**: 已填充字段不再重复填充

### 4.2 实现方案

#### 4.2.1 MutationObserver 配置

```javascript
function setupProgressiveFill() {
  const filledElements = new WeakSet();

  const observer = new MutationObserver((mutations) => {
    let hasNewElements = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        hasNewElements = true;
        break;
      }

      // 处理属性变化（如 display: none -> block）
      if (mutation.type === 'attributes') {
        const el = mutation.target;
        if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
          if (el.offsetParent === null) {
            // 元素从隐藏变为可见
            hasNewElements = true;
          }
        }
      }
    }

    if (hasNewElements) {
      // 延迟处理，等待 DOM 完全更新
      setTimeout(() => {
        collectAndFillNewElements(filledElements);
      }, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden']
  });

  return observer;
}
```

#### 4.2.2 新元素收集与填充

```javascript
function collectAndFillNewElements(filledElements) {
  const list = { items: [], seen: new Set(), seenEl: new Set() };
  collectFromRoot(document, list);

  const newItems = list.items.filter(item => !filledElements.has(item.el));

  for (const item of newItems) {
    try {
      if (item.type === 'vue-select') {
        processSequentialVueSelect(item.el);
      } else if (item.type === 'input') {
        guessAndFillInput(item.el);
      }
      // ... 其他类型

      filledElements.add(item.el);
    } catch (e) {
      console.error('渐进式填充失败:', e);
    }
  }
}
```

#### 4.2.3 定时器 Fallback

```javascript
let progressiveInterval = null;

function startProgressiveFill() {
  // 先执行一次完整填充
  window.__bengaliFakeFill();

  // 启动定时检查
  progressiveInterval = setInterval(() => {
    // 检查可能遗漏的隐藏元素
    checkHiddenElements();
  }, 2000);
}

function stopProgressiveFill() {
  if (progressiveInterval) {
    clearInterval(progressiveInterval);
    progressiveInterval = null;
  }
}
```

#### 4.2.4 用户控制

在 `options.html` 中添加设置:

```html
<label class="field-chip">
  <input type="checkbox" id="t_progressive">
  <span class="label">渐进式填充</span>
</label>
```

存储键: `progressiveFill` (boolean)

### 4.3 存储配置更新

| 键 | 类型 | 默认值 | 说明 |
|---|------|--------|------|
| `progressiveFill` | boolean | false | 是否开启渐进式填充 |
| `progressiveInterval` | number | 2000 | 定时检查间隔(毫秒) |

## 5. 文件变更清单

### 5.1 修改的文件

| 文件 | 变更 |
|------|------|
| `Chrome-Extension/content.js` | 添加 Element Plus 支持、渐进式填充逻辑 |
| `Chrome-Extension/options.html` | 添加渐进式填充开关 |
| `Chrome-Extension/options.js` | 处理渐进式填充设置 |
| `package.json` | 添加 Jest、Playwright 依赖 |
| `README.md` | 更新安装说明 |

### 5.2 新增的文件

```
Chrome-Extension/__tests__/
├── fake-data.test.js
├── field-detection.test.js
└── helpers.test.js

e2e/
├── tests/
│   ├── basic-form.test.js
│   ├── element-plus.test.js
│   ├── progressive-fill.test.js
│   └── keyboard-shortcut.test.js
├── pages/
│   ├── form-page.js
│   └── extension-page.js
└── playwright.config.js
```

## 6. 实施顺序

1. **Phase 1**: 修复 Element Plus 紧急问题
   - el-date-picker 支持
   - el-select 下拉框修复

2. **Phase 2**: 构建单元测试
   - Jest 配置
   - 核心函数测试

3. **Phase 3**: 构建 E2E 测试
   - Playwright 配置
   - 关键流程测试

4. **Phase 4**: 渐进式填充
   - MutationObserver 实现
   - 定时器 fallback
   - 用户控制 UI
