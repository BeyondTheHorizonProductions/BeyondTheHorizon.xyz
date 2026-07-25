/* Leaving overlay.
   The links are ordinary anchors and work with this file absent —
   everything here is layered on top of that.

   There is no artificial delay: navigation is handed off on the next
   painted frame. The overlay stays up for however long the browser
   actually takes to reach the subdomain, which is the only honest
   thing for it to be showing. */
(function () {
  'use strict';

  var overlay = document.getElementById('leaving');
  var target = document.getElementById('leaving-target');

  if (!overlay || !target) return;

  var leaving = false;

  function go(href, name) {
    if (leaving) return;
    leaving = true;

    target.textContent = name;
    overlay.hidden = false;

    // Two frames: one to clear the hidden state, one to let the
    // overlay actually paint before the navigation takes the thread.
    requestAnimationFrame(function () {
      overlay.classList.add('is-on');
      requestAnimationFrame(function () {
        window.location.href = href;
      });
    });
  }

  document.querySelectorAll('.portal').forEach(function (link) {
    link.addEventListener('click', function (e) {
      // leave new-tab / new-window / download clicks alone
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      e.preventDefault();
      go(link.href, (link.textContent || '').trim());
    });
  });

  // Returning via the back button restores this page from the bfcache
  // with the overlay still up — reset it.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    leaving = false;
    overlay.classList.remove('is-on');
    overlay.hidden = true;
  });
})();
