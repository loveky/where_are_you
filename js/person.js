(function(window, $) {
  function Person(name) {
    this.name = name;
    this.marker = (function() {
      var markers = window.map.getOverlays();
      for(var i = 0; i < markers.length; i++) {
        if(markers[i].getTitle() === this.name){
          return markers[i];
        }
      }
    })();
  }

  $.extend(Person.prototype, {
    leave: function() {
      
    },
    move: function(position) {
      // create new point based on position
      // var point = 
      this.marker.updatePosition(point);
    },
    enter: function() {}
  });

  window.Person = Person;
})(window, window.jQuery);