define(["jquery"], function($) {

  function TimelineViewControl(timeline, controls) {
    this.timeline = timeline;
    this.controls = $(controls);
  }

  TimelineViewControl.prototype.init = function() {
    var self = this;
    this.timeline.on("view.changed", this.update.bind(this));
    this.controls.on("change", function() {
      self.timeline.setView(this.value);
    });
    this.update();
  };

  TimelineViewControl.prototype.update = function() {
    var view = this.timeline.view;
    this.controls.each(function() {
      this.checked = (this.value == view);
    });
  };

  return TimelineViewControl;

});
