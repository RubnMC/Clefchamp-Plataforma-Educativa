(function () {
  const SAFE = ['GET', 'HEAD', 'OPTIONS'];

  function getToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }

  // Patch fetch
  const _fetch = window.fetch;
  window.fetch = function (input, init) {
    init = init || {};
    const method = (init.method || 'GET').toUpperCase();
    if (!SAFE.includes(method)) {
      if (init.headers instanceof Headers) {
        init.headers.set('X-CSRF-Token', getToken());
      } else {
        init.headers = Object.assign({}, init.headers, { 'X-CSRF-Token': getToken() });
      }
    }
    return _fetch.call(this, input, init);
  };

  // Patch jQuery AJAX once it's available
  function patchJQuery() {
    if (typeof $ !== 'undefined' && $.ajaxSetup) {
      $.ajaxSetup({
        beforeSend: function (xhr, settings) {
          if (!SAFE.includes((settings.type || 'GET').toUpperCase())) {
            xhr.setRequestHeader('X-CSRF-Token', getToken());
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchJQuery);
  } else {
    patchJQuery();
  }
})();
