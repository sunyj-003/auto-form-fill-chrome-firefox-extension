const collector = require('../../extensions/chrome/core/collector');

describe('collector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('collects common native fields without waiting for timers', async () => {
    document.body.innerHTML = `
      <form>
        <input id="name" type="text" />
        <textarea id="bio"></textarea>
        <select id="country">
          <option value="">Choose</option>
          <option value="bd">Bangladesh</option>
        </select>
      </form>
    `;

    const list = collector.createCollectionState();
    const start = Date.now();

    await collector.collectFromRoot(document, list);

    const elapsed = Date.now() - start;
    const types = list.items.map((item) => item.type);

    expect(types).toEqual(expect.arrayContaining(['input', 'textarea', 'select']));
    expect(elapsed).toBeLessThan(100);
  });

  test('collects naive virtual select wrappers as dropdown controls', async () => {
    document.body.innerHTML = `
      <div class="n-form-item">
        <div class="n-select">
          <div class="n-base-selection">
            <div class="n-base-selection-label">请选择</div>
          </div>
        </div>
      </div>
    `;

    const list = collector.createCollectionState();
    await collector.collectFromRoot(document, list);

    const naiveItems = list.items.filter((item) => item.type === 'naive-select');
    expect(naiveItems).toHaveLength(1);
    expect(naiveItems[0].el.classList.contains('n-base-selection')).toBe(true);
  });
});
