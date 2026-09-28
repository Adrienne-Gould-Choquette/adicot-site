/* Site search.
 *
 * Static site, so this is entirely client-side: a JSON index is fetched once,
 * on first interaction, and scored in the browser. The control is a WAI-ARIA
 * combobox — arrow keys move through results, Enter opens, Escape closes.
 *
 * The markup ships hidden and this file reveals it, so visitors without
 * JavaScript never see a search box that cannot work.
 */
(function () {
  'use strict';

  var form = document.getElementById('sitesearch');
  if (!form) return;

  var input = form.querySelector('input[type="search"]');
  var list = document.getElementById('searchresults');
  var status = document.getElementById('searchstatus');
  var index = null, loading = null, items = [], active = -1;

  form.hidden = false;
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) {
      loading = fetch('/search-index.json')
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (d) { index = d; return index; })
        .catch(function () { index = []; return index; });
    }
    return loading;
  }

  var norm = function (s) { return String(s || '').toLowerCase(); };

  // Weighted so a name match always beats a body-text mention.
  function score(entry, terms) {
    var title = norm(entry.t), labels = norm(entry.l.join(' ')),
        desc = norm(entry.d), body = norm(entry.b), cats = norm(entry.c.join(' '));
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var q = terms[i], s = 0;
      if (title === q || labels === q) s = 120;
      else if (title.indexOf(q) === 0 || labels.indexOf(q) === 0) s = 80;
      else if (title.indexOf(q) !== -1) s = 60;
      else if (labels.indexOf(q) !== -1) s = 50;
      else if (desc.indexOf(q) !== -1) s = 25;
      else if (cats.indexOf(q) !== -1) s = 15;
      else if (body.indexOf(q) !== -1) s = 8;
      if (!s) return 0;                 // every term must match somewhere
      total += s;
    }
    if (entry.f) total += 4;            // nudge pages that actually hold a calculator
    return total;
  }

  function render(results, q) {
    list.innerHTML = '';
    items = results;
    active = -1;
    if (!q) { close(); return; }
    if (!results.length) {
      list.innerHTML = '<li class="sr-none">No matches for &ldquo;' +
        q.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }) +
        '&rdquo;</li>';
      open();
      say('No results');
      return;
    }
    results.forEach(function (r, i) {
      var li = document.createElement('li');
      li.id = 'sr-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      var a = document.createElement('a');
      a.href = r.u;
      a.innerHTML = '<strong></strong>' + (r.k ? '<span class="sr-kind"></span>' : '');
      a.querySelector('strong').textContent = r.l && r.l.length ? r.l[0] : r.t;
      if (r.k) a.querySelector('.sr-kind').textContent = r.k;
      li.appendChild(a);
      list.appendChild(li);
    });
    open();
    say(results.length + (results.length === 1 ? ' result' : ' results'));
  }

  function say(msg) { if (status) status.textContent = msg; }
  function open() { list.hidden = false; input.setAttribute('aria-expanded', 'true'); }
  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function highlight(i) {
    var lis = list.querySelectorAll('li[role="option"]');
    if (!lis.length) return;
    if (active > -1 && lis[active]) lis[active].setAttribute('aria-selected', 'false');
    active = (i + lis.length) % lis.length;
    lis[active].setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', lis[active].id);
    lis[active].scrollIntoView({ block: 'nearest' });
  }

  function run() {
    var q = input.value.trim();
    if (q.length < 2) { close(); return; }
    load().then(function (data) {
      var terms = norm(q).split(/\s+/).filter(Boolean);
      var hits = [];
      for (var i = 0; i < data.length; i++) {
        var s = score(data[i], terms);
        if (s) hits.push({ s: s, e: data[i] });
      }
            // on a tie the more specific page wins: shorter name first, then alphabetical
      hits.sort(function (a, b) { return b.s - a.s || a.e.t.length - b.e.t.length || a.e.t.localeCompare(b.e.t); });
      render(hits.slice(0, 8).map(function (h) { return h.e; }), q);
    });
  }

  var timer;
  input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 120); });
  input.addEventListener('focus', load);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) run(); else highlight(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(active - 1); }
    else if (e.key === 'Enter') {
      var lis = list.querySelectorAll('li[role="option"] a');
      if (!list.hidden && active > -1 && lis[active]) { e.preventDefault(); window.location.href = lis[active].href; }
      else if (!list.hidden && lis.length) { e.preventDefault(); window.location.href = lis[0].href; }
    } else if (e.key === 'Escape') { close(); input.blur(); }
  });

  document.addEventListener('click', function (e) { if (!form.contains(e.target)) close(); });

  // "/" focuses search, the way most doc sites behave
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || e.target.isContentEditable) return;
    e.preventDefault();
    input.focus();
  });
})();
