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
      go(link.href, link.getAttribute('data-name') || (link.textContent || '').trim());
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

/* The book.
   Pages are turned one at a time, like the book screen in the game:
   arrows at the foot, hidden at either end, and the arrow keys work
   too. Without this file every page is simply shown in turn. */
(function () {
  'use strict';

  var book = document.getElementById('pages');
  if (!book) return;

  var pages = book.querySelectorAll('.page');
  var prev = book.querySelector('.turn.prev');
  var next = book.querySelector('.turn.next');
  var current = 0;

  function show(i) {
    current = Math.max(0, Math.min(pages.length - 1, i));
    pages.forEach(function (page, n) {
      page.classList.toggle('is-current', n === current);
    });
    prev.hidden = current === 0;
    next.hidden = current === pages.length - 1;

    // keep focus on the book when the arrow just used disappears
    if (document.activeElement && document.activeElement.hidden) {
      (prev.hidden ? next : prev).focus();
    }
  }

  prev.addEventListener('click', function () { show(current - 1); });
  next.addEventListener('click', function () { show(current + 1); });

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  show(0);
})();
