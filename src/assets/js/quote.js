/* Quote form: one page to fill in, one page for the result.
   The fee is always computed by the server (POST /api/quote/price) so the
   rate card never reaches the browser. No libraries. */

(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const steps = $$('.step');
  const label = $('[data-step-label]');
  const progress = $('[data-progress]');
  const fileInput = $('#files');
  const form = $('[data-step="form"]');
  const result = $('[data-step="result"]');
  const workBox = $('[data-working]');
  const workFill = $('[data-working-fill]');
  const workText = $('[data-working-text]');

  const submissionId = (self.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(36).slice(2)).replace(/-/g, '');

  const picked = { project_type: '', services: [] };
  let track = 'instant';
  let priced = null;
  let sent = false;
  let started = false;
  let creep = null;

  const stepNumber = { form: 1, result: 2 };
  const money = (n) => '$' + Math.round(n || 0).toLocaleString('en-US');
  const visible = (el) => !!el && el.offsetParent !== null;

  function show(name) {
    steps.forEach((s) => s.classList.toggle('is-active', s.dataset.step === name));
    progress.style.width = stepNumber[name] * 50 + '%';
    label.textContent = name === 'result' ? 'Complete' : 'Step ' + stepNumber[name] + ' of 2';
    const heading = $('.h2', $('[data-step="' + name + '"]'));
    if (heading && started) heading.scrollIntoView({ block: 'start', behavior: 'smooth' });
    started = true;
  }

  function showError(msg) {
    const el = $('[data-error]', form);
    if (msg) el.textContent = msg;
    el.hidden = false;
  }

  function clearError() {
    $('[data-error]', form).hidden = true;
  }

  // Submitting builds a Drive tree and writes a sheet row, which can take the
  // better part of a minute. There is no real progress to report, so the bar
  // eases from each stage toward 95% and never arrives.
  function working(msg, pct) {
    workBox.hidden = false;
    workText.textContent = msg;
    let at = pct;
    workFill.style.width = at + '%';
    clearInterval(creep);
    creep = setInterval(() => {
      at += (95 - at) * 0.05;
      workFill.style.width = at + '%';
    }, 700);
  }

  function workingDone() {
    clearInterval(creep);
    workBox.hidden = true;
    workFill.style.width = '0';
  }

  // Swap the scope block between the instant and custom field sets. Hidden
  // inputs stay in the DOM so a rerouted project keeps the answers it gave.
  function setTrack(next, reason) {
    track = next;
    $$('[data-scope]', form).forEach((el) => { el.hidden = el.dataset.scope !== track; });
    const note = $('[data-reason]', form);
    note.textContent = reason || '';
    note.hidden = !reason;
  }

  // Only what the user can actually see is required. The custom description
  // carries [required] in the markup but must not block an instant quote.
  function validate() {
    let ok = true;
    $$('[required]', form).forEach((el) => {
      if (!visible(el)) { el.classList.remove('is-invalid'); return; }
      const bad = !el.value.trim() || !el.checkValidity();
      el.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    $$('.tiles', form).forEach((group) => {
      if (!visible(group)) return;
      const chosen = picked[$('.tile', group).dataset.tile];
      if (Array.isArray(chosen) ? !chosen.length : !chosen) ok = false;
    });
    if (!ok) showError('*Please complete all required fields.');
    else clearError();
    return ok;
  }

  function selectedLabel(name) {
    const chosen = Array.isArray(picked[name]) ? picked[name] : [picked[name]];
    return chosen.map((v) => {
      const tile = $('.tile[data-tile="' + name + '"][data-value="' + v + '"]');
      return tile ? $('.tile__title', tile).textContent : '';
    }).filter(Boolean).join(', ');
  }

  function jurisdictionLabel() {
    const sel = $('#state');
    return sel.options[sel.selectedIndex].text;
  }

  function fileNames() {
    return Array.from(fileInput.files).map((f) => f.name).join(', ');
  }

  function payload() {
    return {
      track: track,
      project_type: picked.project_type,
      // Sent even on the custom track: a project rerouted mid-flow already
      // answered these, and losing them would lose scope detail.
      services: picked.services,
      square_footage: $('#sqft').value.replace(/[^0-9]/g, ''),
      state: $('#state').value,
      description: track === 'instant' ? '' : $('#description').value.trim(),
      project_name: $('#project_name').value.trim(),
      address: $('#address').value.trim(),
      submission_id: submissionId,
      website: $('#website') ? $('#website').value : '',   // honeypot
      name: $('#name').value.trim(),
      email: $('#email').value.trim(),
      company: $('#company').value.trim(),
      notes: $('#notes').value.trim(),
      // No upload endpoint yet, so the file names travel as the reference.
      file_url: fileNames(),
    };
  }

  function pricePayload() {
    return {
      project_type: picked.project_type,
      services: picked.services,
      square_footage: $('#sqft').value.replace(/[^0-9]/g, ''),
      state: $('#state').value,
    };
  }

  function fillResult() {
    const p = payload();
    const text = {
      name: p.name, email: p.email, description: p.description, notes: p.notes || 'None',
      address: p.address,
      project_type: selectedLabel('project_type'),
      services: selectedLabel('services'),
      square_footage: p.square_footage ? Number(p.square_footage).toLocaleString('en-US') + ' sf' : '',
      state: jurisdictionLabel(),
      files: fileNames() || 'None',
    };
    $$('[data-sum]', result).forEach((el) => { el.textContent = text[el.dataset.sum] || 'None'; });
    $$('[data-only]', result).forEach((row) => { row.hidden = row.dataset.only !== track; });
    $$('[data-result]', result).forEach((el) => { el.hidden = el.dataset.result !== track; });

    if (track !== 'instant' || !priced) return;
    $('[data-total]').textContent = money(priced.total_fee);
    $$('[data-fee]', result).forEach((el) => { el.textContent = money(priced[el.dataset.fee]); });
    const notice = $('[data-license-notice]');
    notice.textContent = priced.license_notice || '';
    notice.hidden = !priced.license_notice;
    // The license line is only shown when a license actually has to be pulled
    // for this jurisdiction; otherwise the client would see a $0 row.
    $('[data-needs-license]', result).hidden = !priced.needs_license;
  }

  // Stage the client's files server-side before submitting. They are moved into
  // the job's Drive folder once the project row exists.
  function uploadFiles() {
    if (!fileInput.files.length) return Promise.resolve(null);
    working('Uploading your files…', 30);
    const fd = new FormData();
    fd.append('submission_id', submissionId);
    Array.from(fileInput.files).forEach((f) => fd.append('files', f));
    return fetch('/api/quote/upload', { method: 'POST', body: fd })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data: data })))
      .then((res) => {
        if (!res.ok) throw new Error(res.data.error || 'Upload failed.');
        const bad = res.data.rejected || [];
        if (bad.length) {
          showError('Some files were not accepted: ' +
            bad.map((b) => b.name + ' (' + b.why + ')').join(', '));
        }
        return res.data;
      });
  }

  function post(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json().then((data) => ({ ok: r.ok, data: data })));
  }

  function send(btn) {
    working('Setting up your project…', 45);
    return post('/api/quote/submit', payload()).then((res) => {
      if (!res.ok) {
        showError(res.data.error || 'Something went wrong. Please try again.');
        return;
      }
      sent = true;
      const amount = track === 'instant' && priced
        ? ' Your preliminary estimate is ' + money(priced.total_fee) + '.' : '';
      // No email is sent from here: the confirmation is drafted for a human to
      // send from an adicot.com mailbox, so don't promise the client an inbox.
      $('[data-done-body]').textContent =
        'We will contact you at ' + payload().email + ' within 1-2 business days.' + amount;
      fillResult();
      show('result');
    });
  }

  // One button does everything: validate, price the instant track, then send.
  // A server-side reroute (over the size threshold, or international) keeps
  // the user here and asks for a description instead of submitting a
  // half-scoped inquiry.
  function submit(btn) {
    if (sent || !validate()) return;
    btn.disabled = true;
    btn.dataset.label = btn.dataset.label || btn.textContent;
    btn.textContent = 'Working…';
    clearError();
    working('Pricing your project…', 12);

    const priceFirst = track === 'instant'
      ? post('/api/quote/price', pricePayload()).then((res) => {
          if (res.data.route_to_custom) {
            priced = null;
            setTrack('custom', res.data.reason);
            $('#description').focus();
            return false;
          }
          priced = res.data;
          return true;
        })
      : Promise.resolve(true);

    priceFirst
      .then((go) => (go ? uploadFiles().then(() => send(btn)) : null))
      .catch((err) => showError(err && err.message
        ? err.message
        : 'We could not reach the pricing service. Please try again.'))
      .then(() => {
        workingDone();
        btn.disabled = sent;
        if (!sent) btn.textContent = btn.dataset.label;
      });
  }

  document.addEventListener('click', function (e) {
    const tile = e.target.closest('.tile');
    if (tile) {
      const name = tile.dataset.tile;
      if (tile.closest('.tiles').hasAttribute('data-multi')) {
        const at = picked[name].indexOf(tile.dataset.value);
        if (at === -1) picked[name].push(tile.dataset.value); else picked[name].splice(at, 1);
        const on = at === -1;
        tile.classList.toggle('is-selected', on);
        tile.setAttribute('aria-pressed', String(on));
        priced = null;
      } else {
        picked[name] = tile.dataset.value;
        $$('.tile[data-tile="' + name + '"]').forEach((t) => t.classList.toggle('is-selected', t === tile));
      }
      if (name === 'project_type') {
        priced = null;
        setTrack(tile.dataset.track, '');
      }
      return;
    }

    const btn = e.target.closest('[data-submit]');
    if (btn) submit(btn);
  });

  setTrack('instant', '');
  show('form');
})();
