define(
  ["underscore", "jquery"],
  function(_, $) {

    function Loader(jenkins, e) {
      this.jenkins = jenkins;
      this.e = $(e);
      this.loading = {};
      this.transitions = {
        "views.loading": {target: "views", loading: true},
        "views.loaded": {target: "views", loading: false},
        "jobs.loading": {target: "jobs", loading: true},
        "jobs.loaded": {target: "jobs", loading: false},
      };
    }

    Loader.prototype.init = function() {
      var self = this;
      _.each(
        _.keys(this.transitions),
        function(event) {
          self.jenkins.on(event, function() {
            self.update(event);
          });
        }
      );
      this.update();
    };

    Loader.prototype.update = function(event) {
      // Update loading state
      if (event && event in this.transitions) {
        var transition = this.transitions[event];
        this.loading[transition.target] = transition.loading;
      }

      // Render loading state
      if (_.any(this.loading)) {
        this.e.show();
      } else {
        this.e.hide();
      }
    };

    return Loader;

  }
);
