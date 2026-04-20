# Chrome 架构现状与重构方向

## 当前进展

已完成：
- Chrome-only 收敛，Firefox 代码已移除
- `core/storage.js`：统一设置与文件存储访问
- `core/context.js`：统一字段上下文提取
- `core/events.js`：统一 DOM 写值与事件派发
- `core/autofill.js`：统一持续自动填充控制器
- `core/collector.js`：统一页面元素收集与 Shadow DOM 遍历
- `core/adapter-registry.js`：统一适配器注册与页面框架探测入口
- `generators/fakeData.js`：作为共享假数据生成模块参与加载

当前仍未完成：
- 原生字段填充主流程 `guessAndFillInput()` 仍在 `content.js`
- 框架适配器尚未统一到单一 contract

## 测试现状

- `tests/unit/`: 以 Jest 为主，覆盖存储、选项页、弹窗和 collector 这类可纯逻辑验证的模块
- `tests/e2e/Injected ...`: 用 mock `chrome` 和顺序注入 `manifest` 中的内容脚本模块，验证核心逻辑
- `tests/e2e/Real ... Extension`: 仅在扩展项目下运行，验证真实扩展装载和页面注入
- `tests/e2e/Manual ...`: 默认跳过，保留给人工验证外部登录态或第三方环境
- Playwright 验收以页面最终可观测状态为准，优先使用 `expect.poll(...)` 对字段值、选中态和勾选态做持续校验，而不是依赖页面全局变量或固定 sleep

## 当前问题

```
content.js: 仍然承担主流程编排和大量填充逻辑
├── 数据生成 (80+ 行) - fakeName, fakeEmail, fakePhone...
├── 框架适配 (400+ 行) - Naive UI / Element Plus / Ant Design / React Select / Material UI / Select2
├── 核心逻辑 (300+ 行) - guessAndFillInput
├── 已抽离到 core/ - storage/context/events/autofill/collector/adapter-registry
└── 入口/快捷键/调度
```

问题: 主文件仍偏大，collector/filler/adapter dispatch 还没完全解耦。

---

## 方案 1: 插件式分层架构 (推荐)

```
extensions/chrome/
├── content.js          # 入口，仅组装插件 (50 行)
├── core/
│   ├── index.js       # 核心调度器
│   ├── storage.js     # 设置存取
│   └── shortcuts.js   # 快捷键管理
├── plugins/
│   ├── index.js       # 插件注册表
│   ├── naive-ui/       # Naive UI 插件
│   │   ├── index.js
│   │   └── selectors.js
│   ├── element-plus/
│   ├── ant-design/
│   └── native/        # 原生 HTML 输入
└── generators/        # 数据生成器
    ├── index.js
    ├── fakes/         # 假数据
    └── types/         # 类型映射
```

**特点:**
- **分层:** core → generators → plugins → adapters (插件提供框架适配)
- **插件:** 每个 UI 框架一个插件目录，插件包含 `detect`, `fill`, `selectors`
- **组合:** 插件式注册 + 分层依赖

**通信:**
```javascript
// content.js
import { Engine } from './core/index.js';
import { NaiveUIPlugin, ElementPlusPlugin } from './plugins/index.js';

const engine = new Engine();
engine.register(new NaiveUIPlugin());
engine.register(new ElementPlusPlugin());
engine.start();
```

**插件接口:**
```javascript
class NaiveUIPlugin {
  name = 'naive-ui';
  framework = 'naive-ui'; // detectFramework() 返回值
  
  detect(el) { /* 判断是否是 Naive UI 组件 */ }
  async fill(el, data) { /* 填充逻辑 */ }
  getSelectors() { /* 返回选择器配置 */ }
}
```

---

## 方案 2: 适配器分层

```
extensions/chrome/
├── content.js                    # 入口
├── generators/                    # 数据生成层 (已实现)
│   ├── fakeData.js               # 假数据函数 (content.js 和适配器共享)
│   └── interface.js              # 适配器接口标准
├── adapters/                      # 适配器层
│   ├── naive-ui.js               # (已存在于 framework-adapters/)
│   ├── element-plus.js
│   └── native.js                 # 原生 HTML
```

**特点:**
- **单层适配器:** 每个框架一个适配器文件，不是目录
- **适配器接口统一:** `detect(el) → fill(el, value)`
- **依赖注入:** 适配器依赖 generators，核心依赖适配器

**通信:**
```javascript
// adapters/naive-ui.js
import { findElements } from '../utils/dom.js';

export const NaiveUIAdapter = {
  name: 'Naive UI',
  patterns: ['.n-select', '.n-base-selection'],
  
  detect(el) {
    return el.classList.contains('n-base-selection');
  },
  
  async fill(el, value) {
    // 打开下拉，选择选项...
  }
};
```

---

## 方案 3: 微内核 + 插件生态

```
extensions/chrome/
├── content.js              # 微内核，仅加载配置
│
├── kernel/                 # 微内核 (最小核心)
│   ├── loader.js          # 插件加载器
│   ├── bus.js            # 事件总线
│   └── api.js            # 暴露给插件的 API
│
├── core-plugin/           # 核心功能插件
│   ├── storage.js        # 设置管理
│   ├── shortcut.js       # 快捷键
│   └── fill-core.js      # 填充核心逻辑
│
├── ui-plugins/            # UI 框架插件
│   ├── naive-ui/
│   │   ├── manifest.json  # 插件描述
│   │   ├── adapter.js     # 适配器代码
│   │   └── selectors.json # 选择器配置
│   ├── element-plus/
│   └── ant-design/
│
└── generators/           # 共享的数据生成器
    └── index.js
```

**特点:**
- **微内核:** 只做插件加载 + 事件转发
- **插件隔离:** 每个 UI 框架是完全独立的插件
- **可选加载:** 只加载检测到的框架插件

**manifest.json (插件描述):**
```json
{
  "name": "naive-ui-adapter",
  "version": "1.0.0",
  "detect": [".n-select", ".n-base-selection"],
  "scope": ["fill"]
}
```

**动态加载:**
```javascript
// kernel/loader.js
async function loadDetectedPlugins() {
  const framework = detectFramework();
  const plugin = await import(`./ui-plugins/${framework}/adapter.js`);
  registry.register(plugin);
}
```

---

## 对比

| 特性 | 方案 1 | 方案 2 | 方案 3 |
|------|--------|--------|--------|
| 改动量 | 大 | 中 | 最大 |
| 插件化 | ✓ | 部分 | ✓✓ |
| 分层 | 4 层 | 4 层 | 2 层 + 插件 |
| 新增框架 | 新增目录 | 新增文件 | 新增目录+manifest |
| 测试友好 | ✓✓ | ✓ | ✓ |

## 推荐

**方案 1 (插件式分层)** - 平衡了模块化和复杂度，适合 5-6 个 UI 框架的场景。

需要我先实现哪个方案？
