(function($) {
  var myFirebaseRef = new Firebase("https://brilliant-fire-2393.firebaseio.com/geofile");
  var geoFire = new GeoFire(myFirebaseRef);

  var map = new BMap.Map("map");
  map.addControl(new BMap.ScaleControl());
  map.addControl(new BMap.NavigationControl());

  map.setCenter("中国");

  var myName = prompt("Please enter your name");
  var myPosition;
  var geoQuery;

  dataRef.on("value", function(snapshot) {
    var position = snapshot.val();
    if(position !== null) {    
      var point = new BMap.Point(position.longitude, position.latitude);
      var marker = new BMap.Marker(point);

      var markers = map.getOverlays();
      var i = 0;
      while(i < markers.length) {
        map.removeOverlay(markers[i]);
        i++;
      }

      map.addOverlay(marker);
      map.centerAndZoom(point, 18);
    }
  });

  findFirends();
  setInterval(geoFindMe, 5000);

  function findFriends() {
    var geoQuery = geoFire.query({
      center: []
    });
  }

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
      console.log("Unable to retrieve your location");
    };

    navigator.geolocation.getCurrentPosition(success, error);
  }

  function translateCallback(position) {
    if($("#messageBox").children().length > 10) {
      $("#messageBox").empty();
    }

    var currentTime = new Date();
    $("<p>" + currentTime.toLocaleTimeString() + " 经度: " + position.lng + ", 纬度: " + position.lat + "</p>").prependTo("#messageBox");
    updateLocation({longitude: position.lng, latitude: position.lat});
    geoFire.set(person, [position.lat, position.lng]);

    if(geoQuery === undefined){
      geoQuery = geoFire.query({
        center: [position.lat, position.lng],
        radius: 5000
      });

      geoQuery.on();
    }
  }
})(window.jQuery);