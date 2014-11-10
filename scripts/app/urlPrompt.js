define(
  ["jquery", "uri/URI"],
  function($, URI) {
    function URLPrompt(jenkins, proxy, button, form, feedback) {
      this.jenkins = jenkins;
      this.proxy = proxy;
      this.button = $(button);
      this.form = $(form);
      this.input = this.form.find("input:text");
      this.proxyControl = this.form.find("input:checkbox")[0];
      this.feedback = $(feedback);
    }

    URLPrompt.prototype.init = function() {
      var self = this;

      this.button.on("click", (function() {
        this.prompt();
      }).bind(this));

      this.form.on("submit", function(e) {
        e.preventDefault();
        var url = URI(self.input.val());
        self.proxy.setUseProxy(self.proxyControl.checked);
        self.jenkins.setURL(url);
      });

      this.jenkins.on("url.changing", function(url) {
        this.feedback.hide();
        this.proxyControl.checked = this.proxy.useProxy;
        this.input.val(URI(url).toString());
      }.bind(this));

      this.jenkins.on("error", function(error) {
        this.feedback.find(".message").text(error.message);
        this.feedback.show();
        this.prompt();
      }.bind(this));
    }

    URLPrompt.prototype.prompt = function() {
      this.input.select();
    };

    return URLPrompt;
  }
);
