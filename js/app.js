(function(window, $) {
  var myFirebaseRef;
  var geoFire;

  var myName;
  var myPosition;
  var geoQuery;
  var friends;
  var setIntervalTimer;
  var onFriendEnteredRegistration;
  var onFriendExitedRegistration;
  var onFriendMovedRegistration;
  var myPositionCentered = false;
  var i;
  var currentRoomID;

  var map = window.map = new BMap.Map("map");
  map.addControl(new BMap.ScaleControl());
  map.addControl(new BMap.NavigationControl());
  map.centerAndZoom(new BMap.Point(116.404, 39.915), 17);

  // Config noty plugin
  $.extend($.noty.defaults, {
    maxVisible: 3,
    timeout: 2000,
    layout: "bottom",
    type: "information"
  });

  $("#askForNameModal").modal({keyboard: false, show: true, backdrop: "static"})
    .on("hidden.bs.modal", function() {
      currentRoomID = window.location.hash.substr(1) || "default";
      enterRoom(currentRoomID);
    });

  $("#changeRoom").on("click", changeHash);
  $(window).on("hashchange", changeRoom);
  $("#askForNameModal input").on("keyup", checkNameInput);
  $("#askForNameModal button").on("click", setMyName);
  $(window).on("resize", resizeMap)
    .trigger("resize");


  /////////////////////////
  // Function defination //
  /////////////////////////

  function resizeMap() {
    var height = $(window).innerHeight() - $("nav.navbar").height();
    $("#map").height(height);
  }

  function checkNameInput() {
    var $this = $(this);
    $this.closest(".modal-content")
      .find("button")
      .attr("disabled", $.trim($this.val()) === "");
  }

  function setMyName() {
    var $this = $(this);
    myName = $.trim($("#askForNameModal input").val());
    $("#askForNameModal").modal("hide");
  }

  function changeHash() {
    event.preventDefault();

    var $this = $(this);
    var roomID = $this.closest("form").find("input").val();

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
    try {clearInterval(setIntervalTimer);} catch(e) {}
    try {geoQuery.cancel();} catch(e) {}

    // initialize geoFire data reference
    myFirebaseRef = new Firebase("https://brilliant-fire-2393.firebaseio.com/where_are_u/" + roomID);
    geoFire = new GeoFire(myFirebaseRef);

    // clean up all marks
    removeAllMarkers();

    map.centerAndZoom(new BMap.Point(116.404, 39.915), 17);
    myPositionCentered = false;

    friends = {};

    // start query friends position
    findFriends();
    setIntervalTimer = setInterval(getMyPosition, 5000);
    initialized = true;
  }

  function findFriends() {
    if(myPosition !== undefined) {
      geoQuery = geoFire.query({
        center: [myPosition.lat, myPosition.lng],
        radius: 5000
      });

      onFriendEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
        noty({text: key + " 进入房间"});
        updatePosition(key, location);
      });

      onFriendExitedRegistration = geoQuery.on("key_exited", function(key, location, distance) {
        noty({text: key + " 离开房间"});
        removeMarker(key);
      });

      onFriendMovedRegistration = geoQuery.on("key_moved", function(key, location, distance) {
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
    myPosition = position;
    shareMyLocation(myPosition);
  }

  function updatePosition(name, position) {
    if(position !== null) {
      var point = new BMap.Point(position[1], position[0]);
      var marker = new BMap.Marker(point);
      marker.setTitle(name);

      if(name !== myName) {
        var label = new BMap.Label(name, {offset:new BMap.Size(15,-10)});
        marker.setLabel(label);

        var friendIcon = new BMap.Icon("image/friend.png", new BMap.Size(20,20));
        marker.setIcon(friendIcon);
      }

      removeMarker(name);
      map.addOverlay(marker);

      if(!myPositionCentered && name === myName){
        map.setCenter(point);
        myPositionCentered = true;
      }
    }
  }

  function removeMarker(title) {
    var markers = map.getOverlays();
    for(i = 0; i < markers.length; i++) {
      if(markers[i].getTitle() === title) {
        map.removeOverlay(markers[i]);
      }
    }
  }

  function removeAllMarkers() {
    var markers = map.getOverlays();
    for(var i = 0; i < markers.length; i++) {
      map.removeOverlay(markers[i]);
    }
  }

  function shareMyLocation(position) {
    geoFire.set(myName, [position.lat, position.lng]);
  }
})(window, window.jQuery);