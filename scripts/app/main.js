define(
  ["./jenkins", "./jobsView", "./loader", "./urlPrompt", "./viewSelector", "./timeline", "./colorControl", "./timelineViewControl", "./history", "./proxy", "./proxyControl", "./refresher", "./refresherControl"],
  function(Jenkins, JobsView, Loader, URLPrompt, ViewSelector, Timeline, ColorControl, TimelineViewControl, History, Proxy, ProxyControl, Refresher, RefresherControl) {
    function Main() {

      var jenkins = window.jenkins = new Jenkins();
      jenkins.debugTriggers();

      var loader = new Loader(jenkins, "#loader");
      var viewSelector = new ViewSelector(jenkins, "#view-selector");

      var proxy = new Proxy(true);
      jenkins.setProxy(proxy.getCallable());

      var urlPrompt = new URLPrompt(jenkins, proxy, "#url-prompter", "#url-input", "#url-input-error");

      var jobs = new JobsView(jenkins);
      jobs.debugTriggers();
      jobs.hideColor("notbuilt", false);
      jobs.hideColor("disabled", false);

      var colorControl = new ColorControl(jobs, ".color-toggle");

      var timeline = new Timeline(jenkins, jobs, ".timeline");
      var timelineViewControl = new TimelineViewControl(timeline, ".timeline-view-control");

      var refresher = new Refresher(jenkins);
      var refresherControl = new RefresherControl(refresher, ".refresher");
      refresher.debugTriggers();

      var history = new History(jenkins, proxy, jobs, timeline, refresher);

      jobs.init();
      loader.init();
      viewSelector.init();
      urlPrompt.init();
      timeline.init();
      colorControl.init();
      timelineViewControl.init();
      refresher.init();
      refresherControl.init();
      history.init(window.location.href);

      $(".navbar-brand").smoothScroll();
      $(document.body).on("click", "a.link-internal", function(e) {
        history.go(this.href);
        e.preventDefault();
      });
    }

    return Main;
  }
);
