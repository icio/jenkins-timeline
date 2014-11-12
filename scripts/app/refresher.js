define(
  ["jquery", "underscore", "./emitter", "countdown"],
  function($, _, Emitter, Countdown) {

    function Refresher(jenkins, interval, play) {
      this.jenkins = jenkins;
      this.setInterval(interval || 30);
      this.playing = false;
      if (play) {
        this.play();
      }
    }
    Refresher.prototype = new Emitter();

    Refresher.prototype.init = function() {
      this.jenkins.on("view.changed", this.reset.bind(this));
    };

    Refresher.prototype.setInterval = function(seconds) {
      this.interval = parseInt(seconds);
      if (!this.interval || this.interval <= 0) {
        throw "Refresher interval must be a non-negative integer";
      }
      this.trigger("interval.changed", this.interval);
      this.reset();
    };

    Refresher.prototype.toggle = function() {
      if (this.playing) {
        this.stop();
      } else {
        this.play();
      }
    };

    Refresher.prototype.reset = function() {
      if (this.playing) {
        this.beginCountdown();
      } else {
        this.stop();
      }
    };

    Refresher.prototype.play = function() {
      if (this.playing) {
        return;
      }

      this.playing = true;
      this.trigger("playing", true);
      this.beginCountdown();
    };

    Refresher.prototype.beginCountdown = function() {
      if (this.countdown) {
        this.countdown.abort();
      }
      this.countdown = new Countdown(
        this.interval,
        function(seconds) {
          this.trigger("tick", seconds);
        }.bind(this),
        function() {
          this.trigger("reloading");
          this.jenkins.reloadJobs();
          this.beginCountdown();
        }.bind(this)
      );
    }

    Refresher.prototype.stop = function() {
      if (this.countdown) {
        this.countdown.abort();
        this.countdown = null;
      }
      this.playing = false;
      this.trigger("playing", false);
    };

    return Refresher;

  }
);
