function main(url) {
  url = url + "/api/json?tree=jobs[url,name,displayName,lastSuccessfulBuild[timestamp],color,builds[timestamp,duration,result,url,number]]";

  var timeline = window.timeline = new JobsTimeline(document.getElementById("main-timeline"));

  var client = new JSONPClient();
  function refresh() {
    client.request(url).on('load', function(jenkins) {
      timeline.update(jenkins);
    });
  }

  refresh();
  setTimeout(refresh, 30000);
}

main(window.location.hash.substr(1));
