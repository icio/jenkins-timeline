define(["underscore", "jquery"], function(_, $) {
  function ColorControl(jobs, colorControls) {
    this.jobs = jobs;
    this.colorControls = $(colorControls);
  }

  ColorControl.prototype.init = function() {
    var self = this;
    this.jobs.on("colors.changed", this.update.bind(this));
    this.colorControls.on("change", function() {
      var color = $(this).data("color");
      if (this.checked) {
        self.jobs.showColor(color);
      } else {
        self.jobs.hideColor(color);
      }
    });
    this.update();
  };

  ColorControl.prototype.update = function() {
    var jobs = this.jobs;
    this.colorControls.each(function() {
      this.checked = jobs.isColorShown($(this).data("color"));
    });
  };

  return ColorControl;
});
