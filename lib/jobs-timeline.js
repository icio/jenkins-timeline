var day = 86400000;
function roundDown(n, to) {
  return n - (n % to);
}

function put(dataset, obj) {
  try {
    return dataset.add(obj);
  } catch (e) {
    return dataset.update(obj);
  }
}

/**
 * JobsTimeline renders a timeline of Jenkins jobs
 */
function JobsTimeline(e) {
  this.e = e;
  this.canvas = null;
  this.iteration = 0;

  this.jobs = new vis.DataSet();
  this.builds = new vis.DataSet();

  this.timeline = new vis.Timeline(e);
  this.timeline.setGroups(this.jobs);
  this.timeline.setItems(this.builds);
  this.timeline.setOptions({
    stack: false,
    orientation: "top",
    zoomable: false,
    groupOrder: "lastSuccess"
  });
}

/**
 * update method includes extra 
 * @param  {Object} jenkins
 */
JobsTimeline.prototype.update = function(jenkins) {
  var jobs = [],
      builds = [],
      earliest = Infinity,
      earliestLastSuccess = Infinity;

  // Render the jobs to the timeline
  for (var j = 0, jl = jenkins.jobs.length; j < jl; j++) {
    var job = jenkins.jobs[j];

    if (job.lastSuccessfulBuild) {
      earliestLastSuccess = Math.min(job.lastSuccessfulBuild.timestamp, earliestLastSuccess);
    }
    jobs.push({
      id: job.url,
      content: job.name,
      lastSuccess: job.lastSuccessfulBuild ? job.lastSuccessfulBuild.timestamp : -Infinity
    });

    for (var b = 0, bl = job.builds.length; b < bl; b++) {
      var build = job.builds[b];
      earliest = Math.min(earliest, build.timestamp);

      builds.push({
        id: build.url,
        group: job.url,
        build: build,
        start: new Date(build.timestamp),
        // end: new Date(build.timestamp + build.duration),
        className: "build-" + build.result.toLowerCase() +
                   (job.lastSuccessfulBuild && build.timestamp == job.lastSuccessfulBuild.timestamp ? " build-successful-last" : ""),
        content: build.number
      });
    }
  }
  
  // Timeline configuration
  var end = new Date;
  this.timeline.setOptions({
    start: new Date(roundDown(earliestLastSuccess, day)),
    end: end,
    min: new Date(roundDown(earliest, day)),
    max: end,
    // zoomMin: day,
    // zoomMax: day * 31 * 3
  });

  this.jobs.update(jobs);
  this.builds.update(builds);
};
