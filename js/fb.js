// TESTING
var myDataRef = new Firebase('https://v8x9g5gob7f.firebaseio-demo.com/');
var myUserID = null;

var name = 'init';
var text = 'init_text';
var snapshot; 

var newData = myDataRef.push({name: name, text: text});
var postID = newData.key();
myDataRef.on('child_added', function(snapshot) {
  var message = snapshot.val();
  console.log(snapshot);
  console.log(message);
});

function onLoginClick() {
	
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function initMap() {
  var default_coord = new google.maps.LatLng(40.7280862,-73.9937973);
  var map = new google.maps.Map(document.getElementById('map'), {
    center: default_coord,
    zoom: 17,
    scrollwheel: true
  });
  var infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  
  /*
  // Specify location, radius and place types for your Places API search.
  var request = {
    location: default_coord,
    radius: '500',
    types: ['bakery', 'bar', 'cafe', 'food', 'meal_delivery', 'meal_takeaway', 'night_club', 'restaurant']
  };

  // Create the PlaceService and send the request.
  // Handle the callback with an anonymous function.
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        var place = results[i];
        // If the request succeeds, draw the place location on
        // the map as a marker, and register an event to handle a
        // click on the marker.
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
      }
    }
  });
  */
  
  
// Create the search box and link it to the UI element.
  var input = /** @type {!HTMLInputElement} */(
      document.getElementById('pac-input'));
  var searchBox = new google.maps.places.SearchBox(input);
  
  var types = document.getElementById('type-selector');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
 
}

// Run the initialize function when the window has finished loading.
google.maps.event.addDomListener(window, 'load', initMap);


// DEV

var db = new Firebase('https://cenemus.firebaseio.com/')

// Allows for empty polls. Possible for users to enter values. 
// TODO: Think how to remove exploit. Bots could easily spam or "save poll names"
function getPollOp() {
	var opts = $('input[name^=opt]');//new Array($('#polldata .opt').length);
	var rops = [];
	for (var i = 0; i < $('#polldata .opt').length; i++) {
		if(opts[i].value) {
			rops.push(opts[i].value);
		}
	}
	return rops;
}

function remOp(){
	$('#last_opt').remove();
}

function focusOpt(focus) {
	fid = $('[id^=focus]').index(focus)+1;
	//$('#map-wrapper').insertAfter($('#optl li:eq('+fid+')'));
	var offset = $('#map-wrapper').offset();
	$('html, body').animate({
		scrollTop: offset.top,
		scrollLeft: offset.left
	});
	$('#pac-input').focus();
}

function addOp(){
	$('#extra_opt').removeAttr("oninput").removeAttr("id").attr("placeholder","Enter an option here.");
	$('#extra_optl').removeAttr("id");

	var opti = $('#polldata .opt').length;
	if (opti < 25) {
		$('#optl').append(
			"		<li><input type=\"text\" name=\"opt"+(opti+1)+"\" class=\"opt\" id=\"extra_opt\" oninput=\"addOp(this)\" value=\"\" placeholder=\"Enter an extra option!\">\
 <button type=\"button\" id=\"focus"+(opti+1)+"\" onClick=\"focusOpt(this)\"> Search for a place </button></li>"
		);
	} else {
		$('#optl').append( 
		"<div style=\"font-size: .8em;\">Research shows that having too many options usually results in a lower particiaption rate. We recommend under 24 options. <br> \
Check out <a href=\"http://www.apa.org/monitor/jun04/toomany.aspx\"> this article <a> from the American Psychological Association for details.</div>");
	}
}


var required = function () {
    if (getPollOp() < 2) {
		if (opts.length < 2) {
			if ($('[name="opt1"]').val()) {
				$('[name="opt2"]').prop('required',true);
			} else {
				$('[name="opt1"]').prop('required',true);
			}
			return false;
		}
    }
    else {
        $('input[name^=opt]').attr('required', false);
    }
};
$('input[name^=opt]').on('change', required);

function createPoll(){
	$('#extra_optl').removeAttr("id");
	var opts = getPollOp();
	
	var pOptions = [];
	for (var i in opts) {
		pOptions.push( {
			Value:opts[i],
			Votes:0
			}
		)
	}
	var newPoll = myDataRef.push({Op: pOptions, Que: $('input[name=que]').val()});
	var UUIDkey = newPoll.key();
	var customLink = $('input[name=custom]').val();
	if ($('input[name=custom]').val()) {
		var lookup = {};
		lookup[customLink] = UUIDkey;
		myDataRef.child('lookup').set(lookup);
	} else {
		customLink = UUIDkey;
	}
	window.location.replace("https://spellchaser.github.io/Cenemus/#" + customLink) // window.location.href
	//$("#polldata").attr("action", "/" + newPollID).submit();
	//window.location = "https://www.youtube.com"; 
	return false;
}


// Resources 

/*
https://www.firebase.com/docs/web/guide/saving-data.html
https://www.firebase.com/docs/web/guide/retrieving-data.html
https://www.firebase.com/docs/web/recipes.html
https://cenemus.firebaseio.com/?page=Auth
https://player.vimeo.com/video/55640600
https://www.firebase.com/docs/security/api/rule/
http://stackoverflow.com/questions/14963776/get-users-by-name-property-using-firebase
http://stackoverflow.com/questions/25859514/how-to-get-current-user-on-firebase

{
  "Op" : [ null, {
	"Value" : "This is the option",
	"Votes" : 0
  }, {
	"Value" : "This is another option",
	"Votes" : 3
  } ],
  "PollSettings" : {
	"Admin" : "UUID",
	"Captcha" : "True",
	"Notify" : "Text",
	"ValidationType" : "None",
	"uAddChoice" : "False"
  },
  "Que" : "Hello. Poll Question?"
}
*/