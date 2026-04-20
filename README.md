# AutoForm Fill – 假数据生成器

浏览器扩展，使用逼真的假数据填充网页表单。当前仅支持 Chrome。

## 功能

- **文本和输入:** 姓名、邮箱、电话、地址、公司、日期、数字、密码、URL、NID、文本区域
- **电话:** 孟加拉国格式 — 本地 (`01XXXXXXXXX`) 或国际 (`+8801XXXXXXXXX`)，可在设置中配置
- **下拉框和选择器:** 随机选项 (或上下文感知，如 Bangladesh/Dhaka)；Vue Select、Ant Design、React Select、MUI、Angular Material
- **复选框和单选按钮:** 随机选择
- **文件和图片上传:** 使用演示或自定义图片/PDF/DOC 自动填充文件输入 (在选项 → 自定义文件中设置)
- **自定义规则:** 将字段模式 (文本或正则) 映射到填充类型或跳过；固定值 (如 `+8801878578504` → phone) 填充确切值
- **键盘快捷键:** `Ctrl+Shift+V` 然后再按 `V` (双击 V) — 可在选项中切换
- **设置页面:** 常规 (快捷键、电话格式、自定义文件)、字段类型 (按类型开关)、自定义规则

## 安装

### Chrome
1. 访问 `chrome://extensions`
2. 开启**开发者模式**
3. **加载已解压的扩展程序** → 选择 `extensions/chrome` 文件夹

## 使用方法

1. 打开任何有表单的页面
2. **填充:** 点击扩展图标 → "Fill Form"，或使用快捷键 `Ctrl+Shift+V` 然后再按 `V`
3. **设置:** 右键点击扩展 → 选项 (或从弹出窗口打开)

## 选项 (设置)

- **常规:** 快捷键开关、电话格式 (本地/国际)、用于文件自动填充的自定义图片/PDF/DOC
- **字段类型:** 启用/禁用每种类型的填充 (姓名、邮箱、电话、文件等)
- **自定义规则:** 添加规则如 `nickname` [固定] → Name，`+8801878578504` [固定] → Phone (确切号码)，或正则模式

## 项目结构

```
├── extensions/
│   └── chrome/   # Chrome (Manifest V3)
│       ├── core/storage.js
│       ├── generators/fakeData.js
│       ├── framework-adapters/
│       ├── content.js
│       ├── options.js
│       └── popup.js
├── scripts/
│   └── check-chrome.js
└── tests/        # 测试文件
```

## 开发检查

- `npm run check`: 检查 Chrome 扩展脚本语法是否可加载
- `npm test`: 运行 Playwright 测试
- `npm run test:unit`: 运行 Jest 单元测试

## 测试分层

- `tests/unit`: 纯单元测试，覆盖 storage、popup、options、collector 等模块
- `tests/e2e/*Injected*` / `Injected ...`: 使用 mock `chrome` + 注入内容脚本模块，验证逻辑行为
- `tests/e2e/*Real*Extension*`: 只在 `chromium-with-extension` 项目下运行，验证真实扩展装载链路
- `tests/e2e/*Manual*`: 默认跳过，只用于人工外部环境验证，不计入常规回归

## Playwright 验收标准

- Playwright 以页面最终可观测状态作为填充完成标准：目标字段值满足预期，复选框/单选框状态正确，下拉值已选中，并通过 `expect.poll(...)` 持续校验，确认结果在异步渲染、组件重绘或页面切换后仍然成立
- 真实扩展测试不得通过读取页面全局变量判断是否完成，必须以页面字段实际结果作为断言依据

## 发布

### Chrome 网上应用店
打包 `extensions/chrome` 文件夹 (排除开发文件) 并上传到 Chrome 网上应用店。
