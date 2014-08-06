(function($) {
  var myFirebaseRef = new Firebase("https://brilliant-fire-2393.firebaseio.com/test1");
  var dataRef = myFirebaseRef.child("position");
  var map = new BMap.Map("map");

  dataRef.on("value", function(snapshot) {
    var position = snapshot.val();
    if(position !== null) {    
      var point = new BMap.Point(position.longitude, position.latitude);
      var marker = new BMap.Marker(point);
      map.addOverlay(marker);
      map.centerAndZoom(point, 16);
    }
  });

  geoFindMe();
  setInterval(geoFindMe, 5000);

  function updateLocation(position) {
    dataRef.set({
      longitude: position.longitude,
      latitude: position.latitude
    });
  }

  function geoFindMe() {
    if (!navigator.geolocation){
      alert("Geolocation is not supported by your browser");
      return;
    }

    var success = function(position) {
      var point = new BMap.Point(position.coords.longitude, position.coords.latitude);
      BMap.Convertor.translate(point, 0, translateCallback);
    };

    var error = function() {
      alert("Unable to retrieve your location");
    };

    navigator.geolocation.getCurrentPosition(success, error);
  }

  function translateCallback(position) {
    updateLocation({longitude: position.lng, latitude: position.lat});
  }
})(window.jQuery);