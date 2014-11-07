define(["jquery"], function($) {
  function ProxyControl(proxy, e) {
    this.proxy = proxy;
    this.e = $(e);
  }

  ProxyControl.prototype.init = function() {
    var proxy = this.proxy;
    proxy.on("useProxy.changed", this.update.bind(this));
    this.e.on("change", function() {
      proxy.setUseProxy(this.checked);
    });
    this.update();
  }

  ProxyControl.prototype.update = function() {
    this.e[0].checked = !!this.proxy.useProxy;
  }

  return ProxyControl;
});
