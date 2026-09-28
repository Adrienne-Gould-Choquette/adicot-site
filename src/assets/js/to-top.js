/* Back-to-top control.
 *
 * The markup is a plain anchor, so the scrolling itself is the browser's job
 * (and honours scroll-behavior, which is gated on prefers-reduced-motion in the
 * stylesheet). This file only decides when the control is visible, and moves
 * focus afterwards.
 *
 * Visibility is driven by an IntersectionObserver on a sentinel at the top of
 * <main>, rather than a scroll listener: no event thrashing, no throttling to
 * get wrong, and it asks the question we actually care about, which is whether
 * the top of the page is still on screen.
 */
(function () {
  'use strict';

  var link = document.querySelector('.to-top');
  var sentinel = document.getElementById('top-sentinel');
  var main = document.getElementById('main');
  if (!link || !sentinel || !('IntersectionObserver' in window)) return;

  // Short pages never need it. Re-checked on resize because rotating a phone,
  // or opening a calculator, can change the answer.
  function longEnough() {
    return document.documentElement.scrollHeight > window.innerHeight * 2;
  }

  var observing = false;
  var observer = new IntersectionObserver(function (entries) {
    var topVisible = entries[0].isIntersecting;
    link.classList.toggle('is-visible', !topVisible && longEnough());
  }, { threshold: 0 });

  function sync() {
    if (longEnough() && !observing) { observer.observe(sentinel); observing = true; }
    else if (!longEnough() && observing) {
      observer.unobserve(sentinel); observing = false;
      link.classList.remove('is-visible');
    }
  }

  sync();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(sync, 150); });

  // Without this a keyboard user activates "Top", the page scrolls, and their
  // focus is still stranded at the bottom of the document.
  link.addEventListener('click', function () {
    if (!main) return;
    // let the browser finish the anchor jump first
    setTimeout(function () { main.focus({ preventScroll: true }); }, 0);
  });
})();
