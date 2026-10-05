(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  if (!form || !status) return;
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
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    showDemoNotice();
  });
  form.addEventListener('input', clearNotice);
  form.addEventListener('change', clearNotice);
})();
