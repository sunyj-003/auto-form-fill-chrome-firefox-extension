(function () {
  function getAdapterApi() {
    return window.__BengaliFakeFillAdapterAPI__ || null;
  }

  function getKnownGlobals() {
    return [
      window.__naiveUIAdapter,
      window.__elementPlusAdapter,
      window.__antDesignAdapter,
      window.__reactSelectAdapter,
      window.__muiAdapter,
    ].filter(Boolean);
  }

  function registerKnownAdapters() {
    const api = getAdapterApi();
    if (!api) return [];
    const globals = getKnownGlobals();
    globals.forEach((adapter) => api.registerAdapter(adapter));
    return api.getAdapters();
  }

  function componentToSelector(component) {
    if (!component) return null;
    if (/^[.#\[]/.test(component)) return component;
    return `.${component}`;
  }

  function detectPageFramework() {
    const api = getAdapterApi();
    if (!api) return null;
    const adapters = api.getAdapters();
    for (const adapter of adapters) {
      const selectors = Array.isArray(adapter.supportedComponents) ? adapter.supportedComponents : [];
      for (const component of selectors) {
        const selector = componentToSelector(component);
        if (!selector) continue;
        try {
          if (document.querySelector(selector)) return adapter.name;
        } catch (err) {}
      }
    }
    return null;
  }

  function getAdapterByName(name) {
    const api = getAdapterApi();
    if (!api || !name) return null;
    return api.getAdapters().find((adapter) => adapter.name === name) || null;
  }

  const api = {
    registerKnownAdapters,
    detectPageFramework,
    getAdapterByName,
  };

  if (typeof window !== 'undefined') {
    window.__BengaliAdapterRegistry__ = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
