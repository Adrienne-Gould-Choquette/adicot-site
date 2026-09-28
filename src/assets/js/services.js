/* Gate message for the services that are not sold self-serve.
 *
 * Progressive enhancement. The gated links point at /contact, so without
 * JavaScript a click simply goes to the contact page — which is where the
 * message would have sent them anyway. With JavaScript, the click is
 * intercepted and a native <dialog> explains why first.
 */
(function () {
  'use strict';

  var dialog = document.getElementById('svc-gate');
  var links = document.querySelectorAll('.svc-gate');
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;

  var title = document.getElementById('gate-title');
  var body = document.getElementById('gate-body');
  var baseTitle = title.textContent;
  var lastFocus = null;

  function open(service, trigger) {
    lastFocus = trigger;
    title.textContent = service ? service + ' — available to existing clients' : baseTitle;
    body.textContent = service
      ? service + ' is offered to existing clients. Please contact us for more information.'
      : 'This service is offered to existing clients. Please contact us for more information.';
    dialog.showModal();
  }

  Array.prototype.forEach.call(links, function (a) {
    a.addEventListener('click', function (e) {
      // let modified clicks (new tab, middle-click) behave normally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      open(a.getAttribute('data-service'), a);
    });
  });

  dialog.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-gate-close')) dialog.close();
    // clicking the backdrop closes it: the dialog element itself is the backdrop area
    else if (e.target === dialog) dialog.close();
  });

  // return focus to whatever opened it
  dialog.addEventListener('close', function () {
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  });
})();
