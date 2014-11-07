define(["jquery", "underscore"], function($, _)
{
  function ViewSelector(jenkins, e) {
    this.jenkins = jenkins;
    this.selection = null;

    this.e = $(e);
    this.title = this.e.find(".dropdown-title");
    this.menu = this.e.find(".dropdown-menu");
    this.menuDivider = this.menu.find(".divider").first();
  };

  ViewSelector.prototype.init = function() {
    var self = this;
    self.empty();

    this.jenkins.on("views.loading", function() {
      self.empty(true);
    });
    this.jenkins.on("views.changed", function(views) {
      self.update(views);
    });
    this.jenkins.on("view.changed", function(view) {
      self.select(view);
    });

    this.menu.on("click", "a", function(e) {
      var view = $(this).parent().data("view");
      if (!view) return;
      e.preventDefault();
      self.jenkins.setView(view);
    });
  };

  ViewSelector.prototype.empty = function(loading) {
    this.menu.find("li:not(.dropdown-persistent)").remove();
    if (loading) this.title.text("Views loading…");
  };

  ViewSelector.prototype.update = function(views) {
    this.empty();

    var self = this;
    _.each(views, function(view) {
      var item = document.createElement("li"),
          anchor = document.createElement("a");
      anchor.href = "#" + view.url;
      anchor.appendChild(document.createTextNode(view.name));
      item.appendChild(anchor);
      item.setAttribute("data-view", view.indexURL);
      $(item).insertBefore(self.menuDivider);
    });

    this.select(this.selection);
  };

  ViewSelector.prototype.select = function(view) {
    this.menu.find(".active").removeClass("active");

    if (!view) {
      this.title.text("Select a view…");
      return;
    }

    if (_.isString(view)) {
      view = this.jenkins.getViewByURL(view);
    }

    if (!view) {
      return;
    }

    this.selection = view.indexURL;
    this.menu.find('li[data-view="' + view.indexURL + '"]').addClass("active");
    this.title.text(view.name);
  };

  return ViewSelector;
});
