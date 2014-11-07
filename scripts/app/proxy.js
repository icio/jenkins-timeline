define(["jquery", "./emitter", "jsonp"], function($, Emitter) {
  function Proxy(useProxy) {
    this.setUseProxy(useProxy);
  }
  Proxy.prototype = new Emitter();

  Proxy.prototype.request = function(url) {
    if (this.useProxy) {
      return $.jsonp({ url: url });
    } else {
      return $.getJSON(url + "&jsonp=?");
    }
  };

  Proxy.prototype.getCallable = function() {
    return this.request.bind(this);
  }

  Proxy.prototype.setUseProxy = function(useProxy) {
    this.useProxy = (useProxy !== false);
    this.trigger("useProxy.changed", this.useProxy);
  };

  return Proxy;
});
