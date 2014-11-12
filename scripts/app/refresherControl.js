define(
  ["jquery"],
  function($) {

    var CLASS_PLAY = "fa-pause";
    var CLASS_PAUSE = "fa-refesh";

    function RefresherControl(refresher, e) {
      this.refresher = refresher;
      this.e = $(e);
    };

    RefresherControl.prototype.init = function() {
      var refresher = this.refresher,
          update = this.update.bind(this);

      refresher.on("playing", update);
      refresher.on("tick", update);

      this.e.on("click", ".refresher-toggle", function(e) {
        refresher.toggle();
        e.preventDefault();
      });

      this.e.on("click", "a.refresher-interval", function(e) {
        refresher.setInterval($(this).data("interval"));
        e.preventDefault();
      });

      this.update();
    };

    RefresherControl.prototype.update = function(timeRemaining) {
      if (this.refresher.playing) {
        var seconds = timeRemaining,
            activeClass = CLASS_PLAY,
            inactiveClass = CLASS_PAUSE;
      } else {
        var seconds = this.refresher.interval,
            activeClass = CLASS_PAUSE,
            inactiveClass = CLASS_PLAY;
      }

      this.e.find(".refresher-state")
        .removeClass(inactiveClass)
        .addClass(activeClass);
      this.e.find(".refresher-countdown")
        .text(seconds + "s");
      this.e.find(".refresher-")
    };

    return RefresherControl;

  }
);
