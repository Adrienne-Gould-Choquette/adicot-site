// Injected into the calculator page for a recording: a visible cursor, typing,
// smooth scrolling, highlights and an end card. Nothing here changes a result;
// it only puts values into the fields the way a person would.
(() => {
  const css = document.createElement('style');
  css.textContent = `
    .to-top { display: none !important; }
    #vid-cursor { position: fixed; left: 0; top: 0; z-index: 99999; pointer-events: none; width: 26px; height: 26px;
      transition: transform .55s cubic-bezier(.45,.05,.25,1), opacity .3s; transform: translate(640px, 560px); filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
    #vid-ring { position: fixed; z-index: 99998; pointer-events: none; width: 34px; height: 34px; margin: -17px 0 0 -17px;
      border: 3px solid #f07d00; border-radius: 50%; opacity: 0; }
    #vid-ring.go { animation: vidring .45s ease-out; }
    @keyframes vidring { from { opacity: .9; transform: scale(.4); } to { opacity: 0; transform: scale(1.5); } }
    .vid-hl { outline: 4px solid #f07d00 !important; outline-offset: 5px; border-radius: 6px; }
    #vid-end { position: fixed; inset: 0; z-index: 99997; display: grid; place-content: center; gap: 22px; text-align: center;
      background: #fff; opacity: 0; transition: opacity .6s; color: #1c1c1c; }
    #vid-end.on { opacity: 1; }
    #vid-end img { height: 110px; margin: 0 auto; }
    #vid-end .big { font-size: 54px; font-weight: 800; letter-spacing: -.5px; }
    #vid-end .url { font-size: 27px; color: #b35a00; font-weight: 600; }`;
  document.head.append(css);
  const cur = document.createElement('div');
  cur.id = 'vid-cursor';
  cur.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const ring = document.createElement('div');
  ring.id = 'vid-ring';
  document.body.append(cur, ring);

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const el = x => typeof x === 'string' ? document.getElementById(x) ?? document.querySelector(x) : x;
  let at = [640, 560];
  async function move(x, y, ms = 550) {
    cur.style.transitionDuration = ms + 'ms';
    cur.style.transform = `translate(${x}px, ${y}px)`;
    at = [x, y];
    await sleep(ms + 30);
  }
  async function to(target, ms) {
    const r = el(target).getBoundingClientRect();
    await move(r.left + Math.min(40, r.width / 2), r.top + r.height / 2, ms);
  }
  async function click() {
    ring.style.left = at[0] + 'px'; ring.style.top = at[1] + 'px';
    ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go');
    await sleep(140);
  }
  function set(input, value) { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); }
  async function type(target, text, { per = 95, ms } = {}) {
    const i = el(target);
    await to(i, ms); await click(); i.focus();
    if (i.value) { i.select(); await sleep(220); set(i, ''); await sleep(120); }
    for (const ch of String(text)) { set(i, i.value + ch); await sleep(per); }
    i.dispatchEvent(new Event('change', { bubbles: true }));
  }
  async function scroll(y, ms = 800) {
    const y0 = scrollY, t0 = performance.now();
    await new Promise(done => {
      const step = t => {
        const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        window.scrollTo(0, y0 + (y - y0) * e);
        if (k < 1) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
  }
  const top = target => el(target).getBoundingClientRect().top + scrollY;
  function clearAll() {
    const f = document.getElementById('cmcalc');
    for (const i of f.querySelectorAll('#cm-v, #cm-rows input, #cm-drows input, .cm-bldg input, #cm-oa')) i.value = '';
    f.dispatchEvent(new Event('input', { bubbles: true }));
    document.activeElement?.blur();
  }
  function hl(target, on = true) { el(target).classList.toggle('vid-hl', on); }
  const row = text => [...document.querySelectorAll('#cm-ptbody tr')].find(r => r.textContent.includes(text));
  function endCard() {
    const d = document.createElement('div');
    d.id = 'vid-end';
    d.innerHTML = '<img src="/assets/logo.png" alt=""><div class="big">Try it at</div>'
      + '<div class="url">adicot.com/infiltration-pressurization-calculator</div>';
    document.body.append(d);
    cur.style.opacity = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('on')));
  }
  window.stage = { sleep, move, to, click, type, scroll, top, clearAll, hl, row, endCard };
})();
