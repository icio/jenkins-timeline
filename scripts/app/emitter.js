define(["underscore"], function(_) {

  function Emitter() {};

  Emitter.prototype = {
    on: function(eventNames) {
      var handler = (typeof arguments[1] === 'function') ? arguments[1] : arguments[2];
      this.events = this.events || {};

      _.each(eventNames.split(" "), function(eventName) {
        if (!eventName) return;
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(handler);
      }, this);
    },
    off: function(eventName) {
      var handler = (typeof arguments[1] === 'function') ? arguments[1] : arguments[2];
      this.events = this.events || {};

      // If we have an array of events for this event name, and there's a handler function
      if (handler && this.events[eventName] instanceof Array) {
        // Loop through until we find that particular hander, and remove it.
        var i = this.events[eventName].length;
        while (i--) {
          if (this.events[eventName][i] === handler) {
            this.events[eventName].splice(i, 1);
            break;
          }
        }
      } else if (!handler) {
        // If there's no particular handler, just remove all bound events
        delete this.events[eventName];
      };
    },

    trigger: function(eventName) {
      if (this._emitterTriggerDebug) {
        console.log(eventName, this, Array.prototype.slice.call(arguments, 1));
      }
      this.events = this.events || {};
      if (this.events[eventName] instanceof Array) {
        var i = 0;
        for (; i < this.events[eventName].length; i++) {
          this.events[eventName][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
    },

    debugTriggers: function(enabled) {
      this._emitterTriggerDebug = enabled !== false;
    }
  };

  return Emitter;
});
