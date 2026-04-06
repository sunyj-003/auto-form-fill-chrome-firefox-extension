# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

浏览器扩展 (Chrome + Firefox)，使用逼真的假数据填充网页表单。支持文本输入、下拉框、复选框、单选按钮和文件上传。

## 功能特性

- **文本和输入:** 姓名、邮箱、电话、地址、公司、日期、数字、密码、URL、NID、文本区域
- **电话:** 孟加拉国格式 — 本地 (`01XXXXXXXXX`) 或国际 (`+8801XXXXXXXXX`)，可在设置中配置
- **下拉框和选择器:** 随机选项 (或上下文感知，如 Bangladesh/Dhaka)；Vue Select、Ant Design、React Select、MUI、Angular Material
- **复选框和单选按钮:** 随机选择
- **文件和图片上传:** 使用演示或自定义图片/PDF/DOC 自动填充文件输入
- **自定义规则:** 将字段模式 (文本或正则) 映射到填充类型或跳过；固定值填充确切值
- **键盘快捷键:** `Ctrl+Shift+V` 然后再按 `V` (双击 V)
- **设置页面:** 常规 (快捷键、电话格式、自定义文件)、字段类型 (按类型开关)、自定义规则

## 开发命令

### 在浏览器中加载扩展

**Chrome:**
1. 访问 `chrome://extensions`
2. 启用**开发者模式**
3. 点击**加载已解压的扩展程序** → 选择 `extensions/chrome` 文件夹

**Firefox:**
1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击**临时加载附加组件** → 从 `extensions/firefox` 中选择 `manifest.json`

### 测试更改

修改 `extensions/chrome/content.js` 后：
1. 访问 `chrome://extensions`
2. 点击扩展卡片上的刷新图标
3. 运行测试: `npx playwright test`

## 项目结构

```
extensions/
├── chrome/           # Chrome (Manifest V3)
│   ├── content.js    # 主逻辑: 表单检测、字段填充、假数据生成
│   ├── popup.js      # 扩展弹出窗口 UI (填充表单按钮)
│   ├── options.js    # 设置页面
│   ├── popup.html
│   ├── options.html
│   └── manifest.json
└── firefox/          # Firefox (Manifest V2)

tests/
├── e2e/              # Playwright E2E 测试 (*.spec.js, *.test.js)
└── form-test/        # 各种框架的测试页面

scripts/              # 自动化脚本
```

## 关键文件

- **extensions/chrome/content.js** (~1000 行): 扩展核心逻辑
  - `__bengaliFakeFill()` - 主入口点
  - `collectFromRoot()` - 收集表单元素，包括 Shadow DOM
  - `guessAndFillInput()` - 处理标准输入
  - `processSequentialVueSelect()` - 处理 Vue Select、Element Plus、Ant Design、React Select 下拉框
  - `fillSelect2()` - jQuery Select2 支持
  - 假数据生成器: `fakeName()`、`fakeEmail()`、`fakePhone()`、`fakeAddress()` 等

- **extensions/chrome/options.js**: 通过 chrome.storage 管理设置
  - 切换各个字段类型
  - 自定义规则 (固定值、文本模式、正则表达式)
  - 电话格式 (本地 `01X` vs 国际 `+8801X`)
  - 文件输入自动填充的自定义文件

## 框架支持

内容脚本检测和处理:
- 原生 HTML 输入/选择器
- Vue Select / vue-select
- Element Plus (el-select)
- Ant Design (ant-select)
- React Select
- Material UI (MUI)
- Angular Material
- jQuery Select2

## 存储键

| 键 | 类型 | 用途 |
|-----|------|---------|
| `formSettings` | object | 字段类型开关 (name, email, phone 等) |
| `customRules` | array | 自定义字段映射规则 |
| `phoneFormat` | string | `'local'` 或 `'international'` |
| `shortcutEnabled` | boolean | 键盘快捷键开关 |
| `customFiles` | object | 文件输入的自定义图片/PDF/DOC |

## 重要行为

- 使用 `chrome.storage.sync` 存储设置 (Chrome)，用 `chrome.storage.local` 存储自定义文件
- 派发原生的 `input`/`change` 事件以便框架检测到更改
- 填充前滚动到元素
- 填充时添加视觉反馈 (蓝色发光)
- 按视觉顺序处理元素 (从左上到右下)

## 提交约定

此项目使用 **conventional commits**:
- `refactor:` - 代码重构、目录重组
- `feat:` - 新功能 (如 Element Plus 下拉框支持)
- `fix:` - Bug 修复
- `V1.0.0` - 版本发布
