define(
  ["underscore", "jquery", "uri/URI"],
  function(_, $, URI) {

    var templates = {
      message: _.template('<p><%- message %></p>'),
      viewMismatch: _.template('<p><%- message %> &mdash; looking on <code><%- server %></code> for view with URL <code><%- url %></code>. Perhaps try <a class="link-internal" href="?url=<%- alternative %>"><%- alternative %></a>.</p>')
    };

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

      this.jenkins.on("error", this.error.bind(this));
    }

    URLPrompt.prototype.prompt = function(val) {
      if (typeof val != "undefined") {
        this.input.val(val);
      }
      this.input.select();
    };

    URLPrompt.prototype.error = function(error) {
      this.feedback.find(".message").html(this.formatErrorHTML(error));
      this.feedback.show();
      this.prompt(error.url ? error.url.toString() : "");
    };

    URLPrompt.prototype.formatErrorHTML = function(error) {
      if (error.url && error.views && !(error.url in error.views)) {
        // We have a view-not-found error which can occur a lot when the server gives us redirects.
        // Suggest to that use that they use the URL we were redirect to
        var request = URI(error.url),
            alternative = URI(_.first(_.sortBy(_.keys(error.views), 'length'))),
            server = alternative.clone().pathname("/");

        return templates.viewMismatch({
          message: error.message,
          url: error.url,
          server: server,
          alternative: alternative
        });
      }

      return templates.message(error);
    };

    return URLPrompt;
  }
);
