define(["underscore", "app/emitter"], function(_, Emitter) {

  function JobsView(jenkins) {
    this.jenkins = jenkins;
    this.jobs = [];
    this.hiddenColors = {};
  }
  JobsView.prototype = new Emitter;

  JobsView.prototype.init = function() {
    this.jenkins.on("jobs.changed", this.update.bind(this));
  };

  JobsView.prototype.showColor = function(color, update) {
    this.hiddenColors[color] = false;
    this.trigger("colors.changed", color, false);
    if (update !== false) this.update();
  };

  JobsView.prototype.hideColor = function(color, update) {
    this.hiddenColors[color] = true;
    this.trigger("colors.changed", color, true);
    if (update !== false) this.update();
  };

  JobsView.prototype.isColorShown = function(color) {
    return !this.hiddenColors[color];
  }

  JobsView.prototype.update = function() {
    var earliestBuild = Infinity,
        earliestSuccessfulBuild = Infinity,
        earliestLastSuccessfulBuild = Infinity,
        latestBuild = -Infinity,
        latestSuccessfulBuild = -Infinity;

    this.jobs = _.filter(this.jenkins.jobs, function(job) {
      if (this.isColorShown(job.color)) {
        // Track build stats
        _.each(job.builds, function(build) {
          earliestBuild = Math.min(build.start, earliestBuild);
          latestBuild = Math.max(build.end, latestBuild);
          if (build.result == "SUCCESS") {
            earliestSuccessfulBuild = Math.min(build.start, earliestSuccessfulBuild);
          }
        });

        // Track lastSuccessfulBuild stats
        if (job.lastSuccessfulBuild) {
          var build = job.lastSuccessfulBuild;
          earliestLastSuccessfulBuild = Math.min(build.start, earliestLastSuccessfulBuild);
          latestSuccessfulBuild = Math.max(build.end, latestSuccessfulBuild);
        }

        return true;
      }

      return false;
    }.bind(this));

    this.earliestBuild = earliestBuild;
    this.earliestSuccessfulBuild = earliestSuccessfulBuild;
    this.earliestLastSuccessfulBuild = earliestLastSuccessfulBuild;
    this.latestBuild = latestBuild;
    this.latestSuccessfulBuild = latestSuccessfulBuild;

    this.trigger("jobs.changed", this.jobs);
  };

  return JobsView;
});
