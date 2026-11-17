/* =================================================================
   FlexLab — JavaScript for the playground and responsive preview.

   Concepts used (good to point out to students):
   - Keeping app data in a "state" object, then re-rendering from it
   - querySelector / addEventListener / event delegation
   - Setting CSS from JS with element.style
   - Converting camelCase JS names to kebab-case CSS names
   ================================================================= */

// ---------- 1. STATE ----------
const DEFAULT_CONTAINER = {
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'normal',
  gap: 10,
};

const DEFAULT_ITEM = {
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  order: 0,
  alignSelf: 'auto',
};

const state = {
  container: { ...DEFAULT_CONTAINER },
  items: [],
  selected: null, // index of selected item, or null
};

function resetState() {
  state.container = { ...DEFAULT_CONTAINER };
  state.items = [1, 2, 3, 4].map(() => ({ ...DEFAULT_ITEM }));
  state.selected = null;
}

// ---------- 2. ELEMENTS ----------
const stage = document.querySelector('#flex-container');
const containerForm = document.querySelector('#container-controls');
const itemForm = document.querySelector('#item-controls');
const itemFields = document.querySelector('#item-fields');
const itemName = document.querySelector('#item-name');
const cssOutput = document.querySelector('#css-output');
const gapOut = document.querySelector('#gap-out');
const axisLabels = document.querySelector('#axis-labels');

// ---------- 3. HELPERS ----------
// "justifyContent" -> "justify-content"
const toKebab = (str) => str.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

const withUnit = (key, value) => (key === 'gap' ? value + 'px' : value);

// ---------- 4. RENDER ----------
function render() {
  renderStage();
  renderControls();
  renderCode();
  renderAxisLabels();
}

function renderStage() {
  stage.style.display = 'flex';
  for (const [key, value] of Object.entries(state.container)) {
    stage.style[key] = withUnit(key, value);
  }

  stage.innerHTML = '';
  state.items.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'flex-item' + (state.selected === i ? ' selected' : '');
    el.dataset.index = i;
    el.style.background = `var(--i${(i % 8) + 1})`;
    Object.assign(el.style, {
      flexGrow: item.flexGrow,
      flexShrink: item.flexShrink,
      flexBasis: item.flexBasis,
      order: item.order,
      alignSelf: item.alignSelf,
    });
    el.innerHTML = `${i + 1}${item.order !== 0 ? `<small>order ${item.order}</small>` : ''}`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Select item ${i + 1}`);
    stage.appendChild(el);
  });
}

function renderControls() {
  // Sync container form with state
  for (const [key, value] of Object.entries(state.container)) {
    containerForm.elements[key].value = value;
  }
  gapOut.textContent = state.container.gap + 'px';

  // Item form
  const item = state.items[state.selected];
  itemFields.disabled = !item;
  itemName.textContent = item ? `.item-${state.selected + 1}` : '(click an item)';
  const values = item || DEFAULT_ITEM;
  for (const [key, value] of Object.entries(values)) {
    itemForm.elements[key].value = value;
  }
}

function renderCode() {
  const lines = ['.container {', '  display: flex;'];
  for (const [key, value] of Object.entries(state.container)) {
    // Only print properties that differ from the default — easier to read
    if (value !== DEFAULT_CONTAINER[key]) {
      lines.push(`  ${toKebab(key)}: ${withUnit(key, value)};`);
    }
  }
  lines.push('}');

  state.items.forEach((item, i) => {
    const changed = Object.entries(item).filter(([k, v]) => String(v) !== String(DEFAULT_ITEM[k]));
    if (changed.length) {
      lines.push('', `.item-${i + 1} {`);
      changed.forEach(([k, v]) => lines.push(`  ${toKebab(k)}: ${v};`));
      lines.push('}');
    }
  });

  cssOutput.textContent = lines.join('\n');
}

function renderAxisLabels() {
  const dir = state.container.flexDirection;
  const isRow = dir.startsWith('row');
  const reversed = dir.endsWith('reverse');
  const mainArrow = isRow ? (reversed ? '←' : '→') : (reversed ? '↑' : '↓');
  const crossArrow = isRow ? '↓' : '→';
  axisLabels.querySelector('.main').textContent = `Main axis ${mainArrow} (justify-content)`;
  axisLabels.querySelector('.cross').textContent = `Cross axis ${crossArrow} (align-items)`;
}

// ---------- 5. EVENTS ----------
// One listener on the form handles every control inside it (event delegation)
containerForm.addEventListener('input', (e) => {
  const { name, value } = e.target;
  if (!(name in state.container)) return;
  state.container[name] = name === 'gap' ? Number(value) : value;
  render();
});

itemForm.addEventListener('input', (e) => {
  const item = state.items[state.selected];
  if (!item) return;
  const { name, value, type } = e.target;
  item[name] = type === 'number' ? Number(value) || 0 : value;
  renderStage();
  renderCode();
});

function selectItem(target) {
  const el = target.closest('.flex-item');
  if (!el) return;
  const i = Number(el.dataset.index);
  state.selected = state.selected === i ? null : i; // click again to deselect
  render();
}

stage.addEventListener('click', (e) => selectItem(e.target));
stage.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    selectItem(e.target);
  }
});

document.querySelector('#add-item').addEventListener('click', () => {
  if (state.items.length >= 12) return;
  state.items.push({ ...DEFAULT_ITEM });
  render();
});

document.querySelector('#remove-item').addEventListener('click', () => {
  if (state.items.length <= 1) return;
  state.items.pop();
  if (state.selected >= state.items.length) state.selected = null;
  render();
});

document.querySelector('#reset').addEventListener('click', () => {
  resetState();
  render();
});

document.querySelector('#copy-css').addEventListener('click', async (e) => {
  try {
    await navigator.clipboard.writeText(cssOutput.textContent);
    e.target.textContent = 'Copied!';
  } catch {
    e.target.textContent = 'Select & copy manually';
  }
  setTimeout(() => (e.target.textContent = 'Copy'), 1500);
});

// ---------- 6. RESPONSIVE PREVIEW ----------
// Changing the IFRAME's width changes the viewport the inner page sees,
// so the media queries inside example/layout.css really fire.
const frame = document.querySelector('#preview-frame');
const widthSlider = document.querySelector('#frame-width');
const widthOut = document.querySelector('#frame-width-out');
const presetButtons = document.querySelectorAll('[data-width]');

function setFrameWidth(px) {
  frame.style.width = px + 'px';
  widthSlider.value = px;
  widthOut.textContent = px + 'px';
  presetButtons.forEach((b) => b.classList.toggle('active', Number(b.dataset.width) === px));
}

presetButtons.forEach((btn) =>
  btn.addEventListener('click', () => setFrameWidth(Number(btn.dataset.width)))
);
widthSlider.addEventListener('input', () => setFrameWidth(Number(widthSlider.value)));

// ---------- 7. START ----------
resetState();
render();
setFrameWidth(390);
