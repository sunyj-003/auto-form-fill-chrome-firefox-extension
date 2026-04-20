/**
 * 适配器接口定义 (Adapter Interface)
 * TypeScript 风格接口，供各框架适配器实现
 */

/**
 * 适配器配置选项
 */
const AdapterConfig = {
  // 电话格式
  phoneFormat: 'local', // 'local' | 'international'
  // 自定义文件类型
  customFiles: {},
  // 自定义规则
  customRules: []
};

/**
 * 适配器接口 (TypeScript 风格)
 * @typedef {Object} FrameworkAdapter
 * @property {string} name - 适配器名称 (如 'naive-ui', 'element-plus')
 * @property {string} version - 适配器版本
 * @property {string[]} supportedComponents - 支持的组件 CSS 选择器列表
 * @property {function} [collect] - 可选，收集框架元素
 * @property {function} detect - 检测元素是否属于此框架
 * @property {function} fill - 填充数据到元素
 */

/**
 * 创建适配器实例的工厂函数
 * @param {Object} adapter - 适配器实现
 * @returns {FrameworkAdapter} 适配器实例
 */
function createAdapter(adapter) {
  return {
    name: adapter.name || 'unknown',
    version: adapter.version || '1.0.0',
    supportedComponents: adapter.supportedComponents || [],
    collect: typeof adapter.collect === 'function' ? adapter.collect : null,
    detect: typeof adapter.detect === 'function' ? adapter.detect : (el) => false,
    fill: typeof adapter.fill === 'function' ? adapter.fill : async () => {}
  };
}

/**
 * 检测框架类型
 * @param {Element} el - 要检测的元素
 * @returns {string|null} 框架名称，未知返回 null
 */
function detectFramework(el) {
  // 预注册的适配器列表
  const adapters = window.__BengaliFakeFillAdapters__ = window.__BengaliFakeFillAdapters__ || [];

  for (const adapter of adapters) {
    if (adapter.detect(el)) {
      return adapter.name;
    }
  }

  return null;
}

/**
 * 填充指定框架的元素
 * @param {Element} el - 要填充的元素
 * @param {Object} data - 填充数据
 * @param {Object} settings - 设置选项
 * @returns {Promise<void>
 */
async function fillWithAdapter(el, data, settings) {
  const framework = detectFramework(el);

  if (!framework) {
    console.log('[BengaliFakeFill] 未知框架，跳过:', el);
    return false;
  }

  const adapters = window.__BengaliFakeFillAdapters__ || [];
  const adapter = adapters.find(a => a.name === framework);

  if (!adapter) {
    console.log('[BengaliFakeFill] 适配器未找到:', framework);
    return false;
  }

  await adapter.fill(el, data, settings);
  return true;
}

/**
 * 注册适配器
 * @param {FrameworkAdapter} adapter - 要注册的适配器
 */
function registerAdapter(adapter) {
  if (!window.__BengaliFakeFillAdapters__) {
    window.__BengaliFakeFillAdapters__ = [];
  }

  const wrapped = createAdapter(adapter);

  // 避免重复注册
  const exists = window.__BengaliFakeFillAdapters__.some(a => a.name === wrapped.name);
  if (!exists) {
    window.__BengaliFakeFillAdapters__.push(wrapped);
    console.log('[BengaliFakeFill] 适配器已注册:', wrapped.name, 'v' + wrapped.version);
  }
}

/* --- 导出 --- */
if (typeof window !== 'undefined') {
  window.__BengaliFakeFillAdapters__ = window.__BengaliFakeFillAdapters__ || [];

  window.__BengaliFakeFillAdapterAPI__ = {
    createAdapter,
    registerAdapter,
    detectFramework,
    fillWithAdapter,
    getAdapters: () => window.__BengaliFakeFillAdapters__
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AdapterConfig,
    createAdapter,
    registerAdapter,
    detectFramework,
    fillWithAdapter
  };
}
