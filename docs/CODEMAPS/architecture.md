# 扩展架构

## 项目类型
浏览器扩展 (Chrome Manifest V3 + Firefox Manifest V2)

## 数据流
```
用户操作 (键盘/按钮)
    ↓
content.js (注入到页面)
    ↓
表单检测 (collectFromRoot)
    ↓
字段分类 (name, email, phone 等)
    ↓
假数据生成 (fakeName, fakeEmail 等)
    ↓
字段填充 (guessAndFillInput)
    ↓
事件派发 (input, change 事件以触发框架响应)
```

## 扩展

### Chrome (extensions/chrome/)
- `manifest.json` - MV3 扩展清单
- `content.js` - 主逻辑 (~1000 行): 表单检测、字段填充、假数据
- `options.js` - 设置页面: 字段开关、自定义规则、电话格式
- `popup.js` - 弹出窗口 UI: 填充表单按钮

### Firefox (extensions/firefox/)
- 与 Chrome 结构相同，但使用 Manifest V2

## 存储
| 键 | 类型 | 用途 |
|-----|------|---------|
| formSettings | object | 字段类型开关 |
| customRules | array | 自定义字段映射 |
| phoneFormat | string | 'local' 或 'international' |
| shortcutEnabled | boolean | 键盘快捷键开关 |
| customFiles | object | 文件输入的自定义文件 |

## 依赖
- 无 (纯 Vanilla JS 扩展)
- Playwright (开发依赖，用于 E2E 测试)

<!-- Generated: 2026-04-07 | Files scanned: 18 | Token estimate: ~600 -->
