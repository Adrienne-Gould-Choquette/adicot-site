// The calculator help chat. Sends each question, the conversation so far and what
// the visitor sees on the calculator to /api/calc-help, and shows the answer as
// plain text.
(() => {
  const box = document.getElementById('chelp');
  if (!box) return;
  box.hidden = false;
  const log = document.getElementById('chelp-log');
  const form = document.getElementById('chelp-form');
  const q = document.getElementById('chelp-q');
  const btn = form.querySelector('button');
  const panel = document.getElementById('chelp-panel');
  const bubble = document.getElementById('chelp-open');
  const history = [];

  const show = open => {
    panel.hidden = !open;
    bubble.setAttribute('aria-expanded', String(open));
    (open ? q : bubble).focus();
  };
  bubble.addEventListener('click', () => show(panel.hidden));
  document.getElementById('chelp-close').addEventListener('click', () => show(false));
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') show(false); });

  const say = (cls, text) => {
    const p = Object.assign(document.createElement('p'), { className: `chelp-msg ${cls}`, textContent: text });
    log.append(p);
    p.scrollIntoView({ block: 'nearest' });
    return p;
  };
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();

  // Each calculator field as "label: value", then the results as shown.
  function inputs() {
    const calc = document.querySelector('form.calcform');
    if (!calc) return '';
    const lines = [];
    for (const el of calc.querySelectorAll('input, select, textarea')) {
      if (el.type === 'hidden' || el.disabled || el.closest('[hidden]')) continue;
      const group = clean(el.closest('fieldset')?.querySelector('legend')?.textContent);
      if (el.type === 'radio' || el.type === 'checkbox') {
        if (el.checked) lines.push(`${group}: ${clean(el.labels?.[0]?.textContent)}`);
        continue;
      }
      const label = clean(el.labels?.[0]?.textContent) || group || el.name;
      const value = el.tagName === 'SELECT' ? clean(el.selectedOptions[0]?.textContent) : el.value;
      lines.push(`${label}: ${value || '(blank)'}`);
    }
    const results = calc.querySelector('.cf-results');
    if (results) lines.push('', 'Results:', results.innerText.trim());
    return lines.join('\n').slice(0, 4000);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const question = q.value.trim();
    if (!question || btn.disabled) return;
    say('chelp-you', question);
    q.value = '';
    btn.disabled = true;
    const reply = say('chelp-bot is-wait', 'Thinking…');
    try {
      const r = await fetch('/api/calc-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: location.pathname, question, history, inputs: inputs() }),
      });
      const d = await r.json().catch(() => ({}));
      reply.classList.remove('is-wait');
      if (d.ok) {
        reply.textContent = d.answer;
        history.push({ role: 'user', content: question }, { role: 'assistant', content: d.answer });
      } else {
        reply.textContent = d.error || "The help assistant isn't available right now. Please try again later.";
        reply.classList.add('is-error');
      }
    } catch {
      reply.classList.remove('is-wait');
      reply.classList.add('is-error');
      reply.textContent = "Couldn't reach the help assistant. Check your connection and try again.";
    } finally {
      btn.disabled = false;
      q.focus();
    }
  });

  // Enter asks; Shift+Enter starts a new line.
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });
})();
