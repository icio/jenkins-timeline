define(
  ["underscore", "jquery", "./emitter", "uri/URI"],
  function(_, $, Emitter, URI) {

    /**
     * TODO: Setting the server URL to a different host than the view has
     * should result in the view selection changing.
     */
    function Jenkins() {
      this.url = null;
      this.server = null;
      this.view = null;
      this.views = [];
      this.jobs = [];
    }
    Jenkins.prototype = new Emitter();

    Jenkins.prototype.setStateURL = function(url) {
      this.url = url;
      this.trigger("url.changed", url);
    }

    Jenkins.prototype.setURL = function(url) {
      return this.setView(url);
    };

    Jenkins.prototype.setServer = function(url, setState)
    {
      var server = this.getRootURL(url).toString();

      // Do nothing if it's the same jenkins server
      if (server == this.server) {
        return this._viewsLoader;
      }

      this.trigger("server.changing", server);
      if (setState !== false) {
        this.trigger("url.changing", server);
      }

      return this.reloadViews(server)
        .done(function() {
          if (setState !== false) {
            this.setStateURL(server);
          }
          this.server = server;
          this.serverAPIURL = this.getRootAPIURL(server);
          this.trigger("server.changed", server);
        }.bind(this));
    };

    Jenkins.prototype.getRootURL = function(url) {
      url = URI(url);
      return url.path(url.path().replace(/(\/view\/.+)?$/, "")).toString();
    };

    Jenkins.prototype.getRootAPIURL = function(url) {
      return this.getRootURL(url) + "/api/json";
    };

    Jenkins.prototype.setViews = function(views) {
      /* 
       * Here we will determine the API URL of a view. If its URL path
       * is / then then it is the default view for the Jenkins server.
       * We instead point API requests at /view/{name} for the view
       * which we need to access the view-specific API through.
       */
      _.each(views, function(view) {
        var url = URI(view.url),
            root = url.clone().path("/");
        view.indexURL = this.getIndexURL(url);
        if (url.toString() == root.toString()) {
          view.apiURL = url.path("/view/" + encodeURI(view.name)).toString();
        } else {
          view.apiURL = view.url;
        }
      }.bind(this));
      this.views = _.indexBy(views, 'indexURL');
      this.trigger('views.changed', views);
    };

    Jenkins.prototype.getIndexURL = function(url) {
      return URI(url).toString().toLowerCase().replace(/\/+$/, "");
    }

    Jenkins.prototype.reloadViews = function(server) {
      // this.resetView();

      if (this._viewsLoader) {
        this._viewsLoader.abort();
      }

      // Load views from the server
      var url = URI(this.getRootAPIURL(server || this.serverAPIURL))
            .query({"tree": "views[id,name,description,url]"})
            .toString();
      this.trigger("views.loading");

      this._viewsLoader = this.request(url)
        .done(
          function(response) {
            this.setViews(response.views);
          }.bind(this)
        ).fail(
          function(xhr) {
            this.trigger("error", {
              message: "Unable to load jenkins views. " + xhr.status + " received when requesting " + url
            });
          }.bind(this)
        ).always(
          function() {
            this.trigger("views.loaded");
          }.bind(this)
        );

      return this._viewsLoader;
    };

    Jenkins.prototype.getViewByURL = function(url) {
      url = this.getIndexURL(url);
      return this.views[url] || this.views[encodeURI(url)];
    }

    Jenkins.prototype.setView = function(view) {
      if (!view) {
        if (this.view) {
          this.trigger("view.changing", null);
          this.view = null;
          this.trigger("view.changed", null);
          return this.reloadJobs();
        }
        return this._jobsLoader;
      }

      var url;
      if (_.isString(view)) {
        url = URI(view);
      } else if (view instanceof URI) {
        url = view;
      } else {
        url = URI(view.url);
      }
      url = this.getIndexURL(url);

      // if (this.view && url == this.view.url) {
      //   return this._jobsLoader;
      // }

      var deferred = new $.Deferred();
      this.trigger("url.changing", url);
      this.trigger("view.changing", url);

      this.setServer(url, false)
        .done(
          function() {
            this.view = this.getViewByURL(url);
            if (!this.view) {
              console.error("View not found", url, url);
              this.trigger("error", {
                message: "Unable to find view " + url
              });
              deferred.reject();
              return;
            }

            this.setStateURL(this.view.url);
            this.trigger("view.changed", this.view);
            this.reloadJobs()
              .done(function() {
                deferred.resolve();
              })
              .fail(function() {
                deferred.reject();
              });
          }.bind(this)
        )
        .fail(function() {
          deferred.reject();
        });

      return deferred;
    };

    Jenkins.prototype.setJobs = function(jobs) {
      if (!jobs) {
        jobs = [];
      }

      this.jobs = _.sortBy(jobs, function(job) {
        // Format builds
        _.each(job.builds, function(build) {
          build.start = new Date(build.timestamp);
          build.end = new Date(build.timestamp + build.duration);
        });
        if (job.lastSuccessfulBuild) {
          // Format lastSuccessfulBuild
          var build = job.lastSuccessfulBuild;
          build.start = new Date(build.timestamp);
          build.end = new Date(build.timestamp + build.duration);

          return build.timestamp + build.duration;
        }
        return -Infinity;
      });

      this.trigger("jobs.changed", this.jobs);
    };

    Jenkins.prototype.reloadJobs = function() {
      if (!this.view) {
        this.setJobs(null);
        return;
      }

      if (this._jobsLoader) {
        this._jobsLoader.abort();
      }

      var buildProps = "timestamp,duration,result,url,number",
          url = URI(this.view.apiURL);
      url
        .path(url.path() + "/api/json")
        .query({
          tree: "jobs[url,name,displayName,lastSuccessfulBuild[" + buildProps + "],color,builds[" + buildProps + "]]"
        });

      this.trigger("jobs.loading");
      this._jobsLoader = this.request(url.toString())
        .done(
          function(data) {
            this.setJobs(data.jobs);
          }.bind(this)
        ).fail(
          function() {
            this.trigger("error", "Couldn't load teh jobs");
          }.bind(this)
        ).always(
          function() {
            this.trigger("jobs.loaded");
          }.bind(this)
        );

      return this._jobsLoader;
    };

    Jenkins.prototype.setProxy = function(proxy) {
      this.request = proxy;
      this.trigger("proxy.changed", proxy);
    };

    Jenkins.prototype.request = function(url) {
      // TODO -- Don't assume that we've got a query string already
      return $.getJSON(url + "&jsonp=?")
    };

    return Jenkins;
  }
);
