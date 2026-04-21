describe('dropdown framework selection verification', () => {
  let dropdown;
  const visibleRect = { width: 120, height: 32, top: 0, left: 0, right: 120, bottom: 32 };

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
    window.__BengaliFakeFillData__ = { rand: (arr) => arr[0] };
    dropdown = require('../../extensions/chrome/core/dropdown');
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockRect() {
      if (this.classList?.contains('hidden-option')) return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
      return visibleRect;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete window.__BengaliFakeFillData__;
    delete window.__BengaliDropdown__;
  });

  test('retries ant select until selected text changes', async () => {
    document.body.innerHTML = `
      <div class="ant-select">
        <div class="ant-select-selector"></div>
        <span class="ant-select-selection-item">请选择</span>
      </div>
      <div class="ant-select-dropdown">
        <div class="ant-select-item">Alpha</div>
      </div>
      <input class="ant-select-selection-search-input" />
    `;

    const antSel = document.querySelector('.ant-select');
    const selector = antSel.querySelector('.ant-select-selector');
    const selected = antSel.querySelector('.ant-select-selection-item');
    const option = document.querySelector('.ant-select-item');

    let clicks = 0;
    option.addEventListener('click', () => {
      clicks += 1;
      if (clicks >= 2) selected.textContent = 'Alpha';
    });

    await dropdown.processFrameworkDropdown(selector);
    expect(selected.textContent).toBe('Alpha');
    expect(clicks).toBeGreaterThanOrEqual(2);
  });

  test('updates element-plus selected value after choosing virtual option', async () => {
    document.body.innerHTML = `
      <div class="el-select">
        <div class="el-input__wrapper"></div>
        <span class="el-select__selected-item">请选择</span>
      </div>
      <div class="el-select-dropdown el-popper">
        <div class="el-select-dropdown__item">Dhaka</div>
      </div>
      <input class="el-input__inner" />
    `;

    const elSelect = document.querySelector('.el-select');
    const wrapper = elSelect.querySelector('.el-input__wrapper');
    const selected = elSelect.querySelector('.el-select__selected-item');
    const option = document.querySelector('.el-select-dropdown__item');

    option.addEventListener('click', () => {
      selected.textContent = 'Dhaka';
    });

    await dropdown.processFrameworkDropdown(wrapper);
    expect(selected.textContent).toBe('Dhaka');
  });
});
