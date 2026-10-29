// Same-origin external script: Arabic startup recovery under strict production CSP.
(function () {
  var statusId = 'rhythm-boot-status';
  var failedMessage = 'تعذر بدء التطبيق. يُرجى تحديث الصفحة والمحاولة مرة أخرى.';
  var timeoutMessage = 'لم يبدأ التطبيق بعد 8 ثوانٍ. يُرجى تحديث الصفحة والمحاولة مرة أخرى.';

  function showRecovery(message) {
    var status = document.getElementById(statusId);
    if (status) status.textContent = message;
  }

  window.addEventListener('error', function () {
    showRecovery(failedMessage);
  });
  window.addEventListener('unhandledrejection', function () {
    showRecovery(failedMessage);
  });
  window.setTimeout(function () {
    var status = document.getElementById(statusId);
    if (status && status.textContent !== failedMessage) {
      showRecovery(timeoutMessage);
    }
  }, 8000);
})();
