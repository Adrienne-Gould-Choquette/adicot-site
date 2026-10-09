// A searchable drop-down laid over an ordinary <select>. The select stays the
// form field (its value is what the calculator reads, shares and remembers), so
// without JavaScript the page still has a working drop-down. With it, the user
// can browse the whole list or type to filter it: every word typed must appear
// somewhere in the option or its group, so "exam" finds every exam room and
// "urgent exam" narrows to the urgent care one.
//
// ARIA 1.2 combobox pattern: the text input owns a listbox, arrow keys move the
// active option (aria-activedescendant), Enter picks it, Escape closes the list.

let uid = 0;
const words = s => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(Boolean);

export function combobox(select, { placeholder = 'Type to search, or show all' } = {}) {
  const id = `cb${++uid}`;
  const wrap = document.createElement('div');
  wrap.className = 'cb';
  const input = Object.assign(document.createElement('input'), {
    type: 'text', id: `${id}-input`, className: 'cb-input', autocomplete: 'off', spellcheck: false, placeholder,
  });
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', `${id}-list`);
  const toggle = Object.assign(document.createElement('button'), { type: 'button', className: 'cb-toggle', tabIndex: -1 });
  toggle.setAttribute('aria-label', 'Show all');
  toggle.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const list = document.createElement('ul');
  list.id = `${id}-list`;
  list.className = 'cb-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  const status = Object.assign(document.createElement('span'), { className: 'visually-hidden' });
  status.setAttribute('role', 'status');
  wrap.append(input, toggle, list, status);
  select.after(wrap);
  select.hidden = true;
  // The label that named the select now names the text input.
  const label = select.id && document.querySelector(`label[for="${select.id}"]`);
  if (label) label.htmlFor = input.id;

  let items = [], shown = [], active = -1;

  const text = o => (o.group ? `${o.label} — ${o.group}` : o.label);
  function readOptions() {
    items = [...select.options].map(o => ({
      value: o.value, label: o.textContent, group: o.parentElement.tagName === 'OPTGROUP' ? o.parentElement.label : '',
    }));
    for (const it of items) it.words = words(`${it.label} ${it.group}`);
  }
  function showCurrent() {
    const cur = items.find(it => it.value === select.value);
    input.value = cur ? text(cur) : '';
  }
  function render(query) {
    const q = words(query);
    shown = q.length ? items.filter(it => q.every(w => it.words.some(x => x.startsWith(w) || x.includes(w)))) : items;
    list.replaceChildren();
    let group = null;
    shown.forEach((it, i) => {
      if (it.group !== group) {
        group = it.group;
        if (group) {
          const h = document.createElement('li');
          h.className = 'cb-group';
          h.setAttribute('role', 'presentation');
          h.textContent = group;
          list.append(h);
        }
      }
      const li = document.createElement('li');
      li.id = `${id}-o${i}`;
      li.className = 'cb-option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(it.value === select.value));
      li.textContent = it.label;
      li.addEventListener('mousedown', e => { e.preventDefault(); pick(i); });
      list.append(li);
    });
    if (!shown.length) {
      const li = document.createElement('li');
      li.className = 'cb-empty';
      li.setAttribute('role', 'presentation');
      li.textContent = 'No match. Try fewer or shorter words.';
      list.append(li);
    }
    status.textContent = `${shown.length} ${shown.length === 1 ? 'match' : 'matches'}`;
    setActive(shown.findIndex(it => it.value === select.value));
  }
  function setActive(i) {
    list.querySelector('.is-active')?.classList.remove('is-active');
    active = i;
    const li = i >= 0 ? document.getElementById(`${id}-o${i}`) : null;
    if (li) {
      li.classList.add('is-active');
      input.setAttribute('aria-activedescendant', li.id);
      li.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }
  function open(query = '') {
    render(query);
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }
  function pick(i) {
    const it = shown[i];
    if (!it) return;
    close();
    if (select.value !== it.value) {
      select.value = it.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    showCurrent();
  }

  input.addEventListener('focus', () => input.select());
  input.addEventListener('input', e => { e.stopPropagation(); open(input.value); });
  input.addEventListener('change', e => e.stopPropagation());   // the select's change is the form's
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) { open(''); return; }
      const n = shown.length;
      if (n) setActive(e.key === 'ArrowDown' ? (active + 1) % n : (active - 1 + n) % n);
    } else if (e.key === 'Enter') {
      if (!list.hidden) { e.preventDefault(); pick(active >= 0 ? active : 0); }
    } else if (e.key === 'Escape') {
      if (!list.hidden) { e.preventDefault(); close(); showCurrent(); }
    }
  });
  input.addEventListener('blur', () => { close(); showCurrent(); });
  // Keep focus in the input when the list or its scrollbar is pressed: the input
  // losing focus closes the list, so grabbing the scrollbar would shut it.
  list.addEventListener('mousedown', e => e.preventDefault());
  toggle.addEventListener('mousedown', e => e.preventDefault());
  toggle.addEventListener('click', () => {
    if (list.hidden) { input.focus(); open(''); } else close();
  });

  readOptions();
  showCurrent();
  // Call after the select's options change (a different table) or its value is
  // set by script (a reset, a shared link).
  return { refresh() { readOptions(); showCurrent(); } };
}
