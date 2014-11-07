define(["underscore", "uri/URI"], function(_, URI) {
  function History(jenkins, proxy, jobsView, timeline)
  {
    this.jenkins = jenkins;
    this.proxy = proxy;
    this.jobsView = jobsView;
    this.timeline = timeline;

    this.history = window.history;
  }

  History.prototype.init = function(href) {
    this.state = this.getState();
    if (href) {
      this.updateComponents(href);
    }
    this.initHistory();

    // Component changes update the history
    this.jenkins.on("url.changed", function(url) {
      this.updateHistory({
        url: url,
        proxy: this.proxy.useProxy ? "yes" : ""
      });
    }.bind(this));

    this.jobsView.on("colors.changed", function() {
      this.updateHistory(this.getColorState());
    }.bind(this));

    this.timeline.on("view.changed", function(view) {
      this.updateHistory({view: view});
    }.bind(this));

    // History changes update the component
    window.addEventListener("popstate", function(event) {
      if (_.isNull(event.state)) return;
      this.updateComponents(event.state);
    }.bind(this));
  };

  History.prototype.go = function(state) {
    this.updateHistory(state);
    this.updateComponents(this.state);
  };

  /**
   * Write the current state to the history stack
   */
  History.prototype.updateHistory = function(state) {
    if (state && !this.updateState(state)) {
      return;
    }
    this.history.pushState(
      this.state,
      document.title,
      URI().query(this.state).toString().replace(/\/+$/, "")
    );
  };

  History.prototype.initHistory = function() {
    this.history.replaceState(
      this.state,
      document.title,
      URI().query(this.state).toString().replace(/\/+$/, "")
    );
  };

  /**
   * Set the state of the current objects
   */
  History.prototype.updateComponents = function(state) {
    state = this.parseState(state);
    this.updateState(state);
    if ("proxy" in state) {
      this.proxy.setUseProxy(!!state.proxy);
    }
    if (state.url) {
      this.jenkins.setURL(state.url);
    }
    if (state.view) {
      this.timeline.setView(state.view);
    }

    var colorsUpdated = false;

    if (state.shown) {
      _.each(state.shown.split(","), function(color) {
        if (!this.jobsView.isColorShown(color)) {
          this.jobsView.showColor(color, false);
          colorsUpdated = true;
        }
      }.bind(this))
    }
    if (state.hidden) {
      _.each(state.hidden.split(","), function(color) {
        if (this.jobsView.isColorShown(color)) {
          this.jobsView.hideColor(color, false);
          colorsUpdated = true;
        }
      }.bind(this));
    }

    if (colorsUpdated) this.jobsView.update();
  };

  History.prototype.parseState = function(state) {
    if (_.isString(state)) {
      state = URI(state);
    }
    if (state instanceof URI) {
      return URI.parseQuery(state.search().replace(/(\/|%2F)+$/, ""));
    }
    return state || {};
  }

  History.prototype.updateState = function(state) {
    state = this.parseState(state);
    var _state = this.state,
        changed = false;
    _.each(state || {}, function(val, key) {
      if (key in _state) {
        if (_state[key] != val) {
          changed = true;
        }
        _state[key] = val;
      }
    });
    return changed;
  }

  History.prototype.getState = function() {
    var colors = this.getColorState();
    return {
      url: this.jenkins.url,
      proxy: this.proxy.useProxy ? "yes" : "",
      view: this.timeline.view,
      shown: colors.shown,
      hidden: colors.hidden,
    };
  };

  History.prototype.getColorState = function() {
    var shown = [], hidden = [];
    _.each(this.jobsView.hiddenColors, function(colorHidden, color) {
      if (colorHidden) {
        hidden.push(color);
      } else {
        shown.push(color);
      }
    });
    return {
      shown: shown.join(","),
      hidden: hidden.join(",")
    };
  };

  return History;
});
