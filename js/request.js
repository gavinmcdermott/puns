(function() {

  // Global Setup
  // 
  lib = window.lib || {};
  if (lib.Request) {
    return;
  }


  // Constants
  // 
  // Basic Errors
  var ERRORS = {
    XML: {
      HANDLER: 'invalid callback provided',
      URL: 'invalid url param'
    }
  };


  // Request Class
  // 
  // XMLHTTP Handler
  lib.Request = function () {
    var resources = {
      google: 'https://www.googleapis.com/customsearch/v1',
    };

    // Don't tack this onto the prototype as it experiences issues in the browser
    function get(url, params, onSuccess, onError) {
      var fetch = new XMLHttpRequest();
      var initialParam = true;  // used when building the param string

      // Quick sanity check
      if (!url) {
        throw new Error(ERRORS.XML.URL);
      }
      if (!onSuccess || !onError ||
          typeof(onSuccess) !== 'function' || typeof(onError) !== 'function') {
        throw new Error(ERRORS.XML.HANDLER);
      }

      // Add the query params
      for (var param in params) {
        if (params.hasOwnProperty(param)) {
          url += (initialParam ? '?' : '&') +
                  encodeURIComponent(param) + '=' +
                  encodeURIComponent(params[param]);
        }
        initialParam = false;
      }

      // handle resolution
      fetch.onreadystatechange = function () {
        if (fetch.readyState !== 4) {
          return;
        }
        if (fetch.status === 200 && onSuccess) {
          onSuccess({
            request: fetch,
            data: JSON.parse(fetch.response) // assuming valid JSON for now
          });
        } else if (onError) {
          onError({
            request: fetch,
            data: JSON.parse(fetch.response)
          });
        }
      }

      fetch.open('GET', url, true);
      fetch.send();
    };

    // Request API
    return { 
      resources: resources,
      get: get
    };
  }


})();