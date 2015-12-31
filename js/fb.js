// Mirroring Script event
$.event.special.inputchange = {
    setup: function() {
        var self = this, val;
        $.data(this, 'timer', window.setInterval(function() {
            val = self.value;
            if ( $.data( self, 'cache') != val ) {
                $.data( self, 'cache', val );
                $( self ).trigger( 'inputchange' );
            }
        }, 100));
    },
    teardown: function() {
        window.clearInterval( $.data(this, 'timer') );
    },
    add: function() {
        $.data(this, 'cache', this.value);
    }
};

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

var map, places, infoWindow, autocomplete, searchBox;
var markers = [];
var hostnameRegexp = new RegExp('^https?://.+?/');
function initMap() {
	
  // Initialize 
  var default_coord = new google.maps.LatLng(40.729887,-73.99109);
  map = new google.maps.Map(document.getElementById('map'), {
    center: default_coord,
    zoom: 17,
	mapTypeControl: false,
    scrollwheel: true
  });
  infoWindow = new google.maps.InfoWindow({
	  content: document.getElementById('info-content')
  });

  
  // Create the search box and link it to the UI element.
  var input = /** @type {!HTMLInputElement} */(
      document.getElementById('pac-input'));
  var types = document.getElementById('type-selector');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);
  
  searchBox = new google.maps.places.SearchBox(input);
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  
  places = new google.maps.places.PlacesService(map);
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //infoWindow.setPosition(pos);
      //infoWindow.setContent('Location found.');
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  

  // Listeners 
  google.maps.event.addListener(map, 'click', function() {
        infoWindow.close();
  });

  // The idle event is a debounced event, so we can query & listen without
  // throwing too many requests at the server.
  map.addListener('idle', performSearch);
  
  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
	infowindow.close();
    var rplaces = searchBox.getPlaces();

    if (rplaces.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    rplaces.forEach(function(place) {
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
	
	function performSearch() {
	  var request = {
		bounds: map.getBounds(),
		keyword: 'best view'
	  };
	  service.radarSearch(request, callback);
	}
	
	function callback(results, status) {
	  if (status !== google.maps.places.PlacesServiceStatus.OK) {
		console.error(status);
		return;
	  }
	  for (var i = 0, result; result = results[i]; i++) {
		addMarker(result);
	  }
	}

	function addMarker(place) {
	  var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: {
		  url: 'http://maps.gstatic.com/mapfiles/circle.png',
		  anchor: new google.maps.Point(10, 10),
		  scaledSize: new google.maps.Size(10, 17)
		}
	  });

	  google.maps.event.addListener(marker, 'click', function() {
		service.getDetails(place, function(result, status) {
		  if (status !== google.maps.places.PlacesServiceStatus.OK) {
			console.error(status);
			return;
		  }
		  infoWindow.setContent(result.name);
		  infoWindow.open(map, marker);
		});
	  });
	}
	
  // Sets a listener on a radio button to change the filter type on Places Autocomplete.
  function setupClickListener(id, types) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      autocomplete.setTypes(types);
    });
  }

  setupClickListener('changetype-all', []);
  setupClickListener('changetype-limited', ['bakery', 'bar', 'cafe', 'food', 'meal_delivery', 'meal_takeaway', 'night_club', 'restaurant']);
  setupClickListener('changetype-address', ['address']);
  setupClickListener('changetype-establishment', ['establishment']);
  setupClickListener('changetype-geocode', ['geocode']);
}

function dropMarker(i) {
  return function() {
    markers[i].setMap(map);
  };
}

function addResult(result, i) {
  var results = document.getElementById('results');
  var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
  var markerIcon = MARKER_PATH + markerLetter + '.png';

  var tr = document.createElement('tr');
  tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
  tr.onclick = function() {
    google.maps.event.trigger(markers[i], 'click');
  };

  var iconTd = document.createElement('td');
  var nameTd = document.createElement('td');
  var icon = document.createElement('img');
  icon.src = markerIcon;
  icon.setAttribute('class', 'placeIcon');
  icon.setAttribute('className', 'placeIcon');
  var name = document.createTextNode(result.name);
  iconTd.appendChild(icon);
  nameTd.appendChild(name);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
}

function clearResults() {
  var results = document.getElementById('results');
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
  var marker = this;
  places.getDetails({placeId: marker.placeResult.place_id},
      function(place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        infoWindow.open(map, marker);
        buildIWContent(place);
      });
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
  document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
      'src="' + place.icon + '"/>';
  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
  document.getElementById('iw-address').textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById('iw-phone-row').style.display = '';
    document.getElementById('iw-phone').textContent =
        place.formatted_phone_number;
  } else {
    document.getElementById('iw-phone-row').style.display = 'none';
  }

  // Assign a five-star rating to the hotel, using a black star ('&#10029;')
  // to indicate the rating the hotel has earned, and a white star ('&#10025;')
  // for the rating points not achieved.
  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      } else {
        ratingHtml += '&#10029;';
      }
    document.getElementById('iw-rating-row').style.display = '';
    document.getElementById('iw-rating').innerHTML = ratingHtml;
    }
  } else {
    document.getElementById('iw-rating-row').style.display = 'none';
  }

  // The regexp isolates the first part of the URL (domain plus subdomain)
  // to give a short URL for displaying in the info window.
  if (place.website) {
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
    if (website === null) {
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    document.getElementById('iw-website-row').style.display = '';
    document.getElementById('iw-website').textContent = website;
  } else {
    document.getElementById('iw-website-row').style.display = 'none';
  }
}

// Run the initialize function when the window has finished loading. 
// Called by loading of api. Now despite race condition, both get medals
try {
google.maps.event.addDomListener(window, 'load', initMap);
} catch(err) {
    console.log(err.message);
}




// DEV

var db = new Firebase('https://cenemus.firebaseio.com/')

// Allows for empty polls. Possible for users to enter values. 
// TODO: Think how to remove exploit. Bots could easily spam or "save poll names"
function getPollOp() {
	var opts = $('input[name^=opt]');//new Array($('#polldata .opt').length);
	var ropts = []
	for (var i = 0; i < $('#polldata .opt').length; i++) {
		if(opts[i].value || $(opts[i]).attr("pid")) {
			ropts.push( {
				Value:opts[i].value || null,
				PlaceId:$(opts[i]).attr("pid") || null,
				Votes:0
				});
		}
	}
	return ropts;
}

function remOp(){
	$('#last_opt').remove();
}

function searchMirror() {
	$('#pac-input')[0].value = $('#mirror').val();
	$('#pac-input').focus();
	//TODO: Call new search
}

function focusOpt(focus) {
	//fid = $('[id^=focus]').index(focus)+1;
	console.log(focus);
	$('#mirror').css("background-color",'#e1e1e1');
	$('.opt').not(focus).css("background-color",'#fff').unbind('inputchange');
	$(focus).css("background-color",'#e1e1e1').on('inputchange', function() {
		$('#mirror').text(focus.value);
	});
	//$('.opt').prop('disabled', true);
	//$(focus).prop('disabled', false);
	//$('#map-wrapper').insertAfter($('#optl li:eq('+fid+')'));
	var offset = $('#map-wrapper').offset();
	$('html, body').animate({
		scrollTop: offset.top,
		scrollLeft: offset.left
	});
	//if($('#pac-input').val())
	//	$('#pac-input').focus();
}

function addOp(){
	$('#extra_opt').removeAttr("oninput").removeAttr("id").attr("placeholder","Enter an option here.");
	$('#extra_optl').removeAttr("id");

	var opti = $('#polldata .opt').length;
	if (opti < 25) {
		$('#optl').append(
			"		<li><input type=\"text\" name=\"opt"+(opti+1)+"\" class=\"opt\" id=\"extra_opt\" oninput=\"addOp(this)\" value=\"\" placeholder=\"Enter an extra option!\" onClick=\"focusOpt(this)\">\
 <button type=\"button\" id=\"focus"+(opti+1)+"\" onClick=\"focusOpt(this)\"> Search for a place </button></li>"
		);
	} else {
		$('#optl').append( 
		"<div style=\"font-size: .8em;\">Research shows that having too many options usually results in a lower particiaption rate. We recommend under 24 options. <br> \
Check out <a href=\"http://www.apa.org/monitor/jun04/toomany.aspx\"> this article <a> from the American Psychological Association for details.</div>");
	}
}

/*
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
*/

function createPoll(){
	$('#extra_optl').removeAttr("id");
	var popts = getPollOp();
	
	$('input[name^=opt]').prop('required',false).attr('requried', 'disabled').removeAttr('required');
	if (popts.length < 2) {
		var req = ($('input[name=opt1]').val()) ? $('input[name=opt2]') : $('input[name=opt1]');
		req.prop('required',true);
		req[0].setCustomValidity("What kind of poll has no real choice?");
		$('<input type="submit">').hide().appendTo($('#polldata')).click().remove();
		return false;
	}
	if (!$('input[name=custom]')[0].checkValidity()) {
		$('<input type="submit">').hide().appendTo($('#polldata')).click().remove();
		return false;
	}
	
	var newPoll = myDataRef.push({Op: popts, Que: $('input[name=que]').val()});
	var UUIDkey = newPoll.key();
	var customLink = $('input[name=custom]').val();
	if ($('input[name=custom]').val()) {
		var lookup = {};
		lookup[customLink] = UUIDkey;
		myDataRef.child('lookup').update(lookup);
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
