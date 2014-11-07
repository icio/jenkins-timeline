define(
  ["jquery", "underscore", "./emitter"],
  function($, _, Emitter) {

    function timeAgo(time) {
      if (time.getTime) time = time.getTime();
      var ago = ((new Date).getTime() - time) / 1000;
      var d = Math.floor(ago / 86400), h = Math.floor((ago % 86400) / 3600);
      return (d ? d + "d" : "") + (h && d ? " " : "") + (h ? h + "h" : "") || "0h";
    }

    function Timeline(jenkins, jobsView, e) {
      this.jenkins = jenkins;
      this.jobsView = jobsView;
      this.view = null;
      this.e = $(e);
    }
    Timeline.prototype = new Emitter;

    Timeline.prototype.init = function() {
      this.jobsView.on("jobs.changed", this.update.bind(this));
      this.jenkins.on("jobs.loading", this.empty.bind(this));
      this.setView("comfy");
    };

    Timeline.prototype.setView = function(view) {
      if (this.view) {
        this.e.removeClass("timeline-" + this.view);
      }
      this.view = view;
      this.e.addClass("timeline-" + view);
      this.trigger("view.changed", view);
    };

    Timeline.prototype.empty = function(noJobs) {
      this.e.empty();
      if (noJobs) {
        // TODO
      }
    }

    Timeline.prototype.update = function() {
      if (!this.jobsView.jobs) {
        this.empty(true);
        return;
      }
      this.empty();

      var start = this.jobsView.earliestLastSuccessfulBuild,
          m = 100 / (this.jobsView.latestBuild - start);

      function render(job) {
        var base, builds;
        // Jobs
        base = $(document.createElement("div"))
          .attr({"data-job": job.url})
          .addClass("timeline-job")
          .addClass("timeline-job-" + job.color.toLowerCase())
          .append(
            // Job Titles
            $(document.createElement("div"))
              .addClass("timeline-job-head")
              .addClass("timeline-job-head-" + job.color.toLowerCase())
              .append(
                $(document.createElement("a"))
                  .addClass("timeline-job-name")
                  .attr({
                    "href": job.url,
                    "title": job.name,
                    "data-toggle": "tooltip",
                  })
                  .text(job.name)
              )
          )
          .append(
            // Job Builds
            $(document.createElement("div"))
              .addClass("timeline-builds")
              .append(
                builds = $(document.createElement("div"))
                  .addClass("timeline-builds-stage")
              )
          );
        _.each(job.builds, function(build) {
          // Job Build
          var b = $(document.createElement("div"))
            .attr({"data-build": build.url})
            .addClass("timeline-build")
            .addClass("timeline-build-" + (build.result || '').toLowerCase())
            .css({
              "left": ((build.start.getTime() - start) * m) + "%",
              "width": (build.duration * m) + "%",
            });
          if (job.lastSuccessfulBuild && build.number == job.lastSuccessfulBuild.number) {
            b.addClass("timeline-build-last-success");

            var right = (100 - Math.min(100, ((build.end.getTime() - start) * m))),
                left = right > 95 ? 100 - right : null;

            $(document.createElement("span"))
              .addClass("label label-default timeline-build-label")
              .text(timeAgo(build.end))
              .css(left ? {"left": left + "%"} : {"right": right + "%"})
              .appendTo(builds);
          }
          b.appendTo(builds);
        });
        this.e.append(base);
      }
      _.each(
        this.jobsView.jobs,
        render.bind(this)
      );
    };

    return Timeline;
  }
);
