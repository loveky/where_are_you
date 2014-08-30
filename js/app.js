(function(window, $) {

  var myFirebaseRef;
  var geoFire;
  var map = window.map = new BMap.Map("map");
  map.addControl(new BMap.ScaleControl());
  map.addControl(new BMap.NavigationControl());
  map.centerAndZoom(new BMap.Point(116.404, 39.915), 17);

  var myName = prompt("Please enter your name");
  var myPosition;
  var geoQuery;
  var friends;
  var setIntervalTimer;

  var onFriendEnteredRegistration;
  var onFriendExitedRegistration;
  var onFriendMovedRegistration;
  var initialized = false;
  var myPositionCentered = false;

  // Config noty plugin
  $.extend($.noty.defaults, {
    maxVisible: 3,
    timeout: 2000,
    layout: "bottom",
    type: "information"
  });

  var currentRoomID = window.location.hash.substr(1) || "default";
  enterRoom(currentRoomID);

  $("#changeRoom").on("click", changeHash);
  $(window).on("hashchange", changeRoom);

  function changeHash() {
    event.preventDefault();

    var $this = $(this);
    var roomID = $this.siblings().find("input").val();

    if($.trim(roomID) !== "" && $.trim(roomID) !== window.location.hash.substr(1)) {
      window.location.hash = roomID;
    }
  }

  function changeRoom(event) {
    event.preventDefault();

    if(currentRoomID !== window.location.hash.substr(1)){
      // leave current room
      geoFire.remove(myName);

      currentRoomID = window.location.hash.substr(1);
      enterRoom(currentRoomID);
    }
  }


  function enterRoom(roomID) {
    if(initialized) {
      clearInterval(setIntervalTimer);
      geoQuery.cancel();
    }

    // initialize geoFire data reference
    myFirebaseRef = new Firebase("https://brilliant-fire-2393.firebaseio.com/where_are_u/" + roomID);
    geoFire = new GeoFire(myFirebaseRef);

    // clean up all marks
    var markers = map.getOverlays();
    for(var i = 0; i < markers.length; i++) {
      map.removeOverlay(markers[i]);
    }

    map.centerAndZoom(new BMap.Point(116.404, 39.915), 17);
    myPositionCentered = false;

    friends = {};

    // start query friends position
    findFriends();
    setIntervalTimer = setInterval(getMyPosition, 5000);
    initialized = true;
  }

  /////////////////////////
  // Function defination //
  /////////////////////////

  function findFriends() {
    if(myPosition !== undefined) {
      geoQuery = geoFire.query({
        center: [myPosition.lat, myPosition.lng],
        radius: 5000
      });

      onFriendEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
        noty({text: key + " came in!"});
        updatePosition(key, location);
      });

      onFriendExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
        noty({text: key + " leaved!"});
        var markers = map.getOverlays();
        var i = 0;
        while(i < markers.length) {
          if(markers[i].getTitle() === key) {
            map.removeOverlay(markers[i]);
          }
          i++;
        }
      });

      onFriendMovedRegistration = geoQuery.on("key_moved", function(key, location, distance) {
        debugMessage(key + " moved!");
        location = [39.923482425424 + Math.random()/100, 116.58900186593 + Math.random() / 100];
        updatePosition(key, location);
      });
    }
    else{
      setTimeout(findFriends, 1000);
    }
  }


  function getMyPosition() {
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
    debugMessage("经度: " + position.lng + ", 纬度: " + position.lat);
    // {longitude: position.lng, latitude: position.lat}
    myPosition = position;
    // updatePosition("You", position);
    // map.setCenter(new BMap.Point(position.lng, position.lat));
    // new BMap.Point(116.4035,39.915)
    shareMyLocation(position);
  }

  function updatePosition(name, position) {
    if(position !== null) {
      var point = new BMap.Point(position[1], position[0]);
      var marker = new BMap.Marker(point);
      var markers = map.getOverlays();
      var i = 0;

      marker.setTitle(name);

      if(name !== myName) {
        var label = new BMap.Label(name, {offset:new BMap.Size(15,-10)});
        marker.setLabel(label);

        var friendIcon = new BMap.Icon("image/friend.png", new BMap.Size(20,20));
        marker.setIcon(friendIcon);
      }

      while(i < markers.length) {
        if(markers[i].getTitle() === name) {
          map.removeOverlay(markers[i]);
        }
        i++;
      }

      map.addOverlay(marker);

      if(!myPositionCentered && name === myName){
        map.setCenter(point);
        myPositionCentered = true;
      }
    }
  }

  function shareMyLocation(position) {
    geoFire.set(myName, [position.lat, position.lng]);
  }

  function debugMessage(message) {
    // if($("#messageBox").children().length > 10) {
    //   $("#messageBox").empty();
    // }

    var currentTime = new Date();
    // $("<p>" + currentTime.toLocaleTimeString() + " " + message + "</p>").prependTo("#messageBox");
    console.log(currentTime.toLocaleTimeString() + " " + message);
  }
})(window, window.jQuery);