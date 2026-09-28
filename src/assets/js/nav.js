/* Mega menus in the header.
 *
 * The top level of each menu is an ordinary link, so with JavaScript off the
 * nav still reaches /services and /calculators and nothing here is needed. The
 * disclosure buttons ship `hidden` and are revealed below, because a control
 * that cannot do anything should not be in the tab order.
 *
 * Opening is click, not hover: hover menus are hard to use with a trackpad,
 * impossible on touch, and they open when someone is only passing through on
 * the way to the item below.
 */
(function () {
  'use strict';

  var items = [].slice.call(document.querySelectorAll('.nav-has-menu'));
  if (!items.length) return;

  var menus = items.map(function (li) {
    var btn = li.querySelector('.nav-disclose');
    var panel = li.querySelector('.megamenu');
    if (!btn || !panel) return null;
    btn.hidden = false;
    return { li: li, btn: btn, panel: panel };
  }).filter(Boolean);

  function close(m) {
    m.btn.setAttribute('aria-expanded', 'false');
    m.panel.hidden = true;
    m.li.classList.remove('is-open');
  }

  function closeAll(except) {
    menus.forEach(function (m) { if (m !== except) close(m); });
  }

  function open(m) {
    closeAll(m);
    m.btn.setAttribute('aria-expanded', 'true');
    m.panel.hidden = false;
    m.li.classList.add('is-open');
  }

  menus.forEach(function (m) {
    m.btn.addEventListener('click', function () {
      if (m.btn.getAttribute('aria-expanded') === 'true') close(m);
      else open(m);
    });
  });

  // Escape closes and returns focus to the button that opened it, otherwise
  // focus is left somewhere that no longer exists on screen.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    menus.forEach(function (m) {
      if (m.btn.getAttribute('aria-expanded') === 'true') { close(m); m.btn.focus(); }
    });
  });

  // A click outside, or tabbing out of the menu entirely, closes it. focusout
  // fires before the new element has focus, hence the check on relatedTarget.
  document.addEventListener('click', function (e) {
    menus.forEach(function (m) { if (!m.li.contains(e.target)) close(m); });
  });
  menus.forEach(function (m) {
    m.li.addEventListener('focusout', function (e) {
      if (!e.relatedTarget || !m.li.contains(e.relatedTarget)) close(m);
    });
  });
})();
