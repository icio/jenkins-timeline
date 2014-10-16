/**
 * JSONPClient for loading information from jenkins instances with jsonp.
 */
function JSONPClient() {}
JSONPClient.prototype = new Emitter;

/**
 * load invokes a JSONP callback request to Jenkins for full-depth info
 */
JSONPClient.prototype.request = function(uri) {
  var self = this,
      promise = new Emitter(),
      callback = this.generateCallbackName();

  window[callback] = function(jenkinsData) {
    promise.trigger("load", jenkinsData);
  };

  uri += ~uri.indexOf('?') ? '&' : '?';
  uri += 'jsonp=' + encodeURIComponent(callback);

  var script = document.createElement("script");
  script.src = uri;
  script.onerror = function(e) { promise.trigger("error", e); }
  document.body.appendChild(script);

  return promise;
};

JSONPClient.prototype.generateCallbackName = function() {
  return "_jsonp_" + Math.random().toString().replace(".", "") + (new Date).getTime();
}
