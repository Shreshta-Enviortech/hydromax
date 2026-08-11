/**
 * contact-form.js
 * AJAX submission for the Netlify-backed contact form.
 *
 * Why this file exists:
 * The page still loads Webflow's runtime (hydromax.js), which binds its own
 * submit handler to anything inside a .w-form wrapper and tries to POST to
 * Webflow's servers. That would swallow the submission before Netlify ever
 * sees it. We capture the submit event first (capture phase + stopPropagation)
 * so Webflow's handler never runs, then POST to Netlify ourselves.
 *
 * Netlify receives a urlencoded POST to "/" that includes `form-name`, which
 * is how it routes the submission to the right form.
 */
(function () {
  'use strict';

  function init() {
    var form    = document.getElementById('contact-form');
    var success = document.getElementById('contact-success');
    var error   = document.getElementById('contact-error');
    var button  = document.getElementById('contact-submit');

    if (!form) return;

    // Hide both status panels until we have a result.
    if (success) success.style.display = 'none';
    if (error)   error.style.display   = 'none';

    form.addEventListener('submit', function (e) {
      // Stop Webflow's own form handler from running.
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Let the browser's native validation run first.
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var originalLabel = button ? button.textContent : '';
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending...';
      }
      if (error) error.style.display = 'none';

      // Build a urlencoded body from the form fields (incl. form-name).
      var data = new FormData(form);
      var body = new URLSearchParams(data).toString();

      fetch('/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Submission failed: ' + res.status);

          form.style.display = 'none';
          if (success) {
            success.style.display = 'block';
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        })
        .catch(function () {
          if (error) error.style.display = 'block';
          if (button) {
            button.disabled = false;
            button.textContent = originalLabel || 'Submit';
          }
        });
    }, true); // capture phase — runs before Webflow's bubbling handler
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
