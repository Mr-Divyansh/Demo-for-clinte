/* ==========================================================================
   CONTACT PAGE — client-side behaviour
   --------------------------------------------------------------------------
   The contact form is a UI demo for now. There is no backend and no email
   service connected (rules.md 1 - build what the business needs, and rule 11
   - never expose credentials). This script therefore:

     1. Checks the required fields with the browser's own validation so the
        form still behaves like a real form.
     2. Shows an inline, honest "not connected yet" message.

   It never sends data anywhere: there is no fetch, no XHR and no action on the
   <form>, so nothing can leak. When the real contact endpoint exists, replace
   showDemoNotice() with a real submit() call.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  if (!form || !status) return;

  // ASCII only, so this file can never be corrupted by an encoding round-trip.
  var DEMO_MESSAGE =
    'This form is a demo and is not connected yet. ' +
    'Please send your question through the store details on this page.';

  function showDemoNotice() {
    status.textContent = DEMO_MESSAGE;
    status.className = 'form-status form-status--demo';
  }

  function clearNotice() {
    status.textContent = '';
    status.className = 'form-status';
  }

  form.addEventListener('submit', function (event) {
    // No backend yet: stop the submit and explain why.
    event.preventDefault();

    // checkValidity() runs the required-field checks. If anything is missing
    // the browser shows its own message and focuses the first bad field.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    showDemoNotice();
  });

  // Clear the demo notice as soon as the customer edits the form again.
  form.addEventListener('input', clearNotice);
  form.addEventListener('change', clearNotice);

  // FAQ uses native <details>, so nothing to wire up there.
})();