/* Light / dark toggle.
 *
 * The theme applies to the whole site and is the visitor's choice, stored per
 * browser. The attribute itself is set by a tiny inline script in <head> so it
 * lands before first paint; this file only draws the control and handles the
 * click.
 *
 * The button ships `hidden` and is revealed here, because without JavaScript it
 * could not do anything.
 */
(function () {
  'use strict';

  var KEY = 'adicot:theme';
  var root = document.documentElement;
  var btn = document.getElementById('themetoggle');
  if (!btn) return;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function paint() {
    var dark = current() === 'dark';
    btn.querySelector('.theme-label').textContent = dark ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  btn.hidden = false;
  paint();

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    if (next === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem(KEY, next); } catch (e) { /* session only */ }
    paint();
  });

  // Another tab changing the theme should not leave this one out of step.
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    if (e.newValue === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    paint();
  });
})();
