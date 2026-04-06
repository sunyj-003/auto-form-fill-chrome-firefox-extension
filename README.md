# AutoForm Fill – 假数据生成器

浏览器扩展，使用逼真的假数据填充网页表单。支持 Chrome 和 Firefox。

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

### Firefox
1. 访问 `about:debugging#/runtime/this-firefox`
2. **临时加载附加组件** → 从 `Mozile-Extension` 文件夹中选择 `manifest.json`

或从 [Firefox 附加组件 (AMO)](https://addons.mozilla.org/en-US/firefox/addon/auto-fill-fake-data-generator/) 下载

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
│   ├── chrome/   # Chrome (Manifest V3)
│   └── firefox/  # Firefox (Manifest V2)
├── Mozile-Extension/   # Firefox (旧位置，用于兼容性)
└── tests/        # 测试文件
```

## 发布

### Chrome 网上应用店
打包 `extensions/chrome` 文件夹 (排除开发文件) 并上传到 Chrome 网上应用店。

### Firefox 附加组件 (AMO)
打包 `Mozile-Extension` 文件夹并提交到 addons.mozilla.org。包含符合 AMO 要求的 `data_collection_permissions`。
