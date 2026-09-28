/* Visitor-set favorites on /calculators.
 *
 * Progressive enhancement. With JavaScript off, the page still renders the
 * suggested favorites as static stars and the CSS-only "favorites only"
 * filter still works — this file only upgrades the stars into toggles and
 * remembers the result.
 *
 * The suggested set (taxonomy.json `fav: true`) is the starting point. Once a
 * visitor changes anything, their list is stored and takes over; "Reset to
 * suggested" clears it and hands control back.
 *
 * Storage is per-browser and can be unavailable (private mode, blocked site
 * data), so every read and write is guarded and the page works without it.
 */
(function () {
  'use strict';

  var KEY = 'adicot:favorites:v1';
  var groups = document.querySelector('.catgroups');
  if (!groups) return;

  var cards = Array.prototype.slice.call(groups.querySelectorAll('.card[data-path]'));
  if (!cards.length) return;

  var filter = document.getElementById('favonly');
  var resetBtn = document.getElementById('favreset');
  var hint = document.querySelector('.favhint');
  var empty = document.querySelector('.favempty');

  // The same calculator can appear in more than one category, so index by path.
  var byPath = {};
  cards.forEach(function (card) {
    var p = card.getAttribute('data-path');
    (byPath[p] = byPath[p] || []).push(card);
  });

  var suggested = cards
    .filter(function (c) { return c.classList.contains('is-fav'); })
    .map(function (c) { return c.getAttribute('data-path'); })
    .filter(function (p, i, a) { return a.indexOf(p) === i; });

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      return Array.isArray(v) ? v.filter(function (p) { return byPath[p]; }) : null;
    } catch (e) { return null; }
  }

  function write(list) {
    try { window.localStorage.setItem(KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }   // private mode / blocked storage: session-only
  }

  function clear() {
    try { window.localStorage.removeItem(KEY); } catch (e) { /* nothing to do */ }
  }

  var custom = read();
  var current = custom || suggested.slice();

  function apply() {
    Object.keys(byPath).forEach(function (path) {
      var on = current.indexOf(path) !== -1;
      byPath[path].forEach(function (card) {
        card.classList.toggle('is-fav', on);
        var btn = card.querySelector('.card-star');
        if (btn && btn.tagName === 'BUTTON') {
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
          btn.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + btn.getAttribute('data-label') +
            (on ? ' from your favorites' : ' to your favorites'));
        }
      });
    });
    if (resetBtn) resetBtn.hidden = !custom;
    if (empty) empty.hidden = !(filter && filter.checked && current.length === 0);
  }

  function toggle(path) {
    var i = current.indexOf(path);
    if (i === -1) current.push(path); else current.splice(i, 1);
    custom = true;
    write(current);
    apply();
  }

  // upgrade each static star into a real toggle
  cards.forEach(function (card) {
    var star = card.querySelector('.card-star');
    if (!star || star.tagName === 'BUTTON') return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = star.className;
    btn.setAttribute('data-label', star.getAttribute('data-label') || 'this calculator');
    star.parentNode.replaceChild(btn, star);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle(card.getAttribute('data-path'));
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      clear();
      custom = null;
      current = suggested.slice();
      apply();
    });
  }

  if (filter) filter.addEventListener('change', apply);
  if (hint) hint.hidden = false;

  document.documentElement.classList.add('favs-interactive');
  apply();
})();
