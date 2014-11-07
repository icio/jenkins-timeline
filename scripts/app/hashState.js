define(["uri/URI"], function(URI) {
  function HashState(jenkins) {
    this.jenkins = jenkins;
  }
  HashState.prototype.init = function() {
    var self = this;
  }

  HashState.prototype.getURL = function() {
    var hash = window.location.hash.substr(1);
    if (hash) {
      return URI(hash);
    }
  };

  HashState.prototype.setURL = function(url) {
    window.location.hash = url.toString();
  };

  return HashState;
});
