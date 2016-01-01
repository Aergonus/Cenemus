// Mirroring Script event
$.event.special.inputchange = {
	setup: function() {
		var self = this,
			val;
		$.data(this, 'timer', window.setInterval(function() {
			val = self.value;
			if ($.data(self, 'cache') != val) {
				$.data(self, 'cache', val);
				$(self).trigger('inputchange');
			}
		}, 100));
	},
	teardown: function() {
		window.clearInterval($.data(this, 'timer'));
	},
	add: function() {
		$.data(this, 'cache', this.value);
	}
};

function rainbow(step, numOfSteps) {
  // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
  // Adam Cole, 2011-Sept-14
  // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  var r, g, b;
  var h = step / numOfSteps;
  var i = ~~(h * 6);
  var f = h * 6 - i;
  var q = 1 - f;
  switch(i % 6){
	  case 0: r = 1; g = f; b = 0; break;
	  case 1: r = q; g = 1; b = 0; break;
	  case 2: r = 0; g = 1; b = f; break;
	  case 3: r = 0; g = q; b = 1; break;
	  case 4: r = f; g = 0; b = 1; break;
	  case 5: r = 1; g = 0; b = q; break;
  }
  var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
  return (c);
}

// TESTING
var myDataRef = new Firebase('https://v8x9g5gob7f.firebaseio-demo.com/');
var myUserID = null;

var name = 'init';
var text = 'init_text';
var snapshot;
/*
var newData = myDataRef.push({
	name: name,
	text: text
});
var postID = newData.key();
*/
myDataRef.on('child_added', function(snapshot) {
	var message = snapshot.val();
	console.log(snapshot);
	console.log(message);
});

function onLoginClick() {

}

// MAP
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
		'Error: The Geolocation service failed.' :
		'Error: Your browser doesn\'t support geolocation.');
}

var map, service, infoWindow, autocomplete, searchBox, cPlace;
var markers = [];
var hostnameRegexp = new RegExp('^https?://.+?/');

var pollKey;
var pollInfo;
function oninit() {
	if (location.hash.replace("#","")) {
		myDataRef.child("Lookup").child(location.hash.replace("#","")).once('value', function(snap) {
			pollKey = snap.val();
			
		if (pollKey) {
			myDataRef.child("PollDB").child(pollKey).once('value', function(snap) {
				pollInfo = snap.val();
			});
			$('#mirror-wrapper').hide();
			$('#polldata').hide();
			// TODO : LOAD MAP WITH THE LOCATIONS
			$('#map-wrapper').hide();

			$('<h3 type="text" name="que" value="">'+pollInfo.Que+'</h3>').appendTo($('#pollInfo-wrapper'));
			for (op in pollInfo.Op) {
				$('<label><input type="checkbox" class="radio" pid="'+pollInfo.Op[op].PlaceId+'" value="'+op+'" name="poll" />'+pollInfo.Op[op].Value+'</label><br>').appendTo($('#pollInfo-wrapper'));
			}
			$('<button type="button" id="vote" onClick="submitVote()" value="Submit Vote!">Submit Vote!</button>').appendTo($('#pollInfo-wrapper'));
			
		// the selector will match all input controls of type :checkbox
		// and attach a click event handler 
		$("input:checkbox").on('click', function() {
		  // in the handler, 'this' refers to the box clicked on
		  var $box = $(this);
		  if ($box.is(":checked")) {
			// the name of the box is retrieved using the .attr() method
			// as it is assumed and expected to be immutable
			var group = "input:checkbox[name='" + $box.attr("name") + "']";
			// the checked state of the group/box on the other hand will change
			// and the current value is retrieved using .prop() method
			$(group).prop("checked", false);
			$box.prop("checked", true);
		  } else {
			$box.prop("checked", false);
		  }
		});


		} else {
			$('#pollInfo-wrapper').hide();
			initMap();
		}
		});
	} else {
		$('#pollInfo-wrapper').hide();
		initMap();
	}
}


function initMap() {

	// Initialize 
	var default_coord = new google.maps.LatLng(40.729887, -73.99109);
	map = new google.maps.Map(document.getElementById('map'), {
		center: default_coord,
		zoom: 17,
		mapTypeControl: false,
		scrollwheel: true
	});
	infoWindow = new google.maps.InfoWindow({
		content: document.getElementById('info-content')
	});
	google.maps.InfoWindow.prototype.isOpen = function() {
		var map = infoWindow.map; //.getMap();
		return (map !== null && typeof map !== "undefined");
	}

	var setOptionDiv = document.createElement( 'div' ),
    setControlOption = function ( controlDiv, map ) {
        controlDiv.className = "gmnoprint custom-control-container";

        var controlUIContainer = document.createElement( 'div' ),
            controlUI = document.createElement( 'div' );

        controlUIContainer.className = "gm-style-mtc";
        controlDiv.appendChild( controlUIContainer );

        controlUI.className = "custom-control";
        controlUI.title = 'Click to set the current place as an option';
        controlUI.innerHTML = 'Set as option';
        controlUIContainer.appendChild( controlUI );

        google.maps.event.addDomListener( controlUI, 'click', setOption);
    }
		
	var setControl = new setControlOption( setOptionDiv, map );

	setOptionDiv.index = 1;
	map.controls[ google.maps.ControlPosition.LEFT_TOP ]
		.push( setOptionDiv );
	// Create the search box and link it to the UI element.
	var input = /** @type {!HTMLInputElement} */ (
		document.getElementById('pac-input'));
	var types = document.getElementById('type-selector');
	/*
	var use = document.getElementById('use-result');
	var useControl = new setOption(use);
		use.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(useControl);
	*/
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

	searchBox = new google.maps.places.SearchBox(input);
	autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.bindTo('bounds', map);

	service = new google.maps.places.PlacesService(map);

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};

			//infoWindow.setPosition(pos);
			//infoWindow.setContent(document.getElementById('info-content'));
			map.setCenter(pos);
		}, function() {
			handleLocationError(true, new google.maps.InfoWindow({
				map: map,
			}), map.getCenter());
		});
	} else {
		// Browser doesn't support Geolocation
		handleLocationError(false, new google.maps.InfoWindow({
			map: map,
		}), map.getCenter());
	}


	// Listeners 
	google.maps.event.addListener(map, 'click', function() {
		infoWindow.close();
	});

	// The idle event is a debounced event, so we can query & listen without
	// throwing too many requests at the server.
	map.addListener('idle', checkPerformSearch);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	markers = [];
	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		infoWindow.close();
		$('#keep-me').html(ic);
		infoWindow.setContent(document.getElementById('info-content'));
		var places = searchBox.getPlaces();

		if (places.length != 1) {
			performSearch();
		} else {
			clearMarkers();
			clearResults();
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
				var marker = new google.maps.Marker({
					map: map,
					icon: icon,
					title: place.name,
					position: place.geometry.location
				});
				markers.push(marker);

				if (place.geometry.viewport) {
					// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
				
		google.maps.event.addListener(marker, 'click', showInfoWindow);
		//addResult(place, marker);
		
			});
			map.fitBounds(bounds);
		}

	});

	function checkPerformSearch() {
		if (!infoWindow.isOpen()) {
			performSearch();
		}
	}

	function performSearch() {
		var input = /** @type {!HTMLInputElement} */ (
			document.getElementById('pac-input'));
		var request = {
			bounds: map.getBounds(),
			keyword: input.value
		};
		service.nearbySearch(request, callback); // vs radarSearch... less results hmm but no place data :(
	}

	function callback(results, status) {
		if (status !== google.maps.places.PlacesServiceStatus.OK) {
			console.error(status);
			return;
		}
		clearMarkers();
		clearResults();
		results.forEach(function(result) {
			addMarker(result);
		});
	}

	function addMarker(place) {
		var marker = new google.maps.Marker({
			position: place.geometry.location,
			animation: google.maps.Animation.DROP,
			placeResult: place,
			icon: {
				url: 'https://maps.gstatic.com/mapfiles/circle.png',
				anchor: new google.maps.Point(10, 10),
				scaledSize: new google.maps.Size(10, 17)
			}
		});

		//marker.placeResult = place;
		google.maps.event.addListener(marker, 'click', showInfoWindow);
		// TODO: On hover change icon and translate to icon
		//google.maps.event.addListener(marker, 'hover', showIcon);
		markers.push(marker);
		setTimeout(dropMarker(marker), markers.length * 100);
		addResult(place, marker);
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
	/*
	setupClickListener('changetype-address', ['address']);
	setupClickListener('changetype-establishment', ['establishment']);
	setupClickListener('changetype-geocode', ['geocode']);
	*/
}
var ic = " \
	  <div id= info-content > \
		<table> \
		  <tr id= iw-url-row  class= iw_table_row > \
			<td id= iw-icon  class= iw_table_icon ></td> \
			<td id= iw-url ></td> \
		  </tr> \
		  <tr id= iw-address-row  class= iw_table_row > \
			<td class= iw_attribute_name >Address:</td> \
			<td id= iw-address ></td> \
		  </tr> \
		  <tr id= iw-phone-row  class= iw_table_row > \
			<td class= iw_attribute_name >Telephone:</td> \
			<td id= iw-phone ></td> \
		  </tr> \
		  <tr id= iw-rating-row  class= iw_table_row > \
			<td class= iw_attribute_name >Rating:</td> \
			<td id= iw-rating ></td> \
		  </tr> \
		  <tr id= iw-website-row  class= iw_table_row > \
			<td class= iw_attribute_name >Website:</td> \
			<td id= iw-website ></td> \
		  </tr> \
		</table> \
	  </div>"; // hacky fix
var copt;
/*
function filtercopt() {
		var match = 'rgb(225, 225, 225)'; // match background-color: gray
		return ( $(this).css('background-color') == match );
}

function getcopt() {
	copt = $('.opt').filter(filtercopt);
	return copt;
}
*/
function setOption() {
	var currentOptions = $('.opt');
	for (var i = 0;i < currentOptions.length; i++) {
		if(!currentOptions[i].value) {
			currentOptions = currentOptions[i];
			break;
		}
	}
	currentOptions = copt||currentOptions;
	$(currentOptions).attr("value", cPlace.name).attr("pid",cPlace.place_id);
	if($(currentOptions).attr('id') == 'extra_opt') {
		addOp();
	}
}

function dropMarker(marker) {
	return function() {
		marker.setMap(map);
	};
}

function addResult(result, marker) {
	var results = document.getElementById('results');

	var tr = document.createElement('tr');
	tr.style.backgroundColor = (markers.length % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
	tr.onclick = function() {
		google.maps.event.trigger(marker, 'click');
	};
	/*
	tr.onfocus = function() {
		google.maps.event.trigger(result, 'focus');
	};
	*/
	//var iconTd = document.createElement('td');
	var nameTd = document.createElement('td');
	//var icon = document.createElement('img');
	//icon.src = markerIcon;
	//icon.setAttribute('class', 'placeIcon');
	//icon.setAttribute('className', 'placeIcon');
	var name = document.createTextNode(result.name);
	//iconTd.appendChild(icon);
	nameTd.appendChild(name);
	//tr.appendChild(iconTd);
	tr.appendChild(nameTd);
	results.appendChild(tr);
}

function clearMarkers() {
	// Clear out the old markers.
	markers.forEach(function(marker) {
		marker.setMap(null);
	});
	markers = [];
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
	service.getDetails({
			placeId: marker.placeResult.place_id
		},
		function(place, status) {
			if (status !== google.maps.places.PlacesServiceStatus.OK) {
				return;
			}
			infoWindow.open(map, marker);
			cPlace = place;
			buildIWContent(place);
		});
}

function showIcon() {
	var marker = this;
	var icon = {
		url: place.icon,
		size: new google.maps.Size(71, 71),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(17, 34),
		scaledSize: new google.maps.Size(25, 25)
	};
	this.setIcon(icon);
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
	/*
		document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
				'src="' + place.icon + '"/>';
	*/
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
	google.maps.event.addDomListener(window, 'load', oninit);
} catch (err) {
	console.log(err.message);
}




// DEV

var db = new Firebase('https://cenemus.firebaseio.com/')

// Allows for empty polls. Possible for users to enter values. 
// TODO: Think how to remove exploit. Bots could easily spam or "save poll names"
function getPollOp() {
	var opts = $('input[name^=opt]'); //new Array($('#polldata .opt').length);
	var ropts = []
	for (var i = 0; i < $('#polldata .opt').length; i++) {
		if (opts[i].value ) { // || $(opts[i]).attr("pid") 
			// this won't be filled?... somehow have to verify this. for now asusming people will keep it or set. 
			ropts.push({
				Value: opts[i].value || null,
				PlaceId: $(opts[i]).attr("pid") || null,
				Votes: 0
			});
		}
	}
	return ropts;
}

function remOp() {
	$('#last_opt').remove();
}

function searchMirror() {
	var target = $('#pac-input');
	target[0].value = $('#mirror').val();
	target.focus();
	//TODO: Call new search
	/*
	google.maps.event.trigger(target, 'focus')
	google.maps.event.trigger(target, 'keydown', {
		keyCode: 13
	});
	*/
}

function focusOpt(focus) {
	//fid = $('[id^=focus]').index(focus)+1;
	$('#mirror').css("background-color", '#e1e1e1');
	$('.opt').not(focus).css("background-color", '#fff').unbind('inputchange');
	$(focus).css("background-color", '#e1e1e1').on('inputchange', function() {
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
	copt = focus;
	//if($('#pac-input').val())
	//	$('#pac-input').focus();
}

function addOp() {
	$('#extra_opt').removeAttr("oninput").removeAttr("id").attr("placeholder", "Enter an option here.");
	$('#extra_optl').removeAttr("id");

	var opti = $('#polldata .opt').length;
	if (opti < 25) {
		$('#optl').append(
			"		<li><input type=\"text\" name=\"opt" + (opti + 1) + "\" class=\"opt\" id=\"extra_opt\" oninput=\"addOp(this)\" value=\"\" placeholder=\"Enter an extra option!\" onClick=\"focusOpt(this)\">"
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

function createPoll() {
	$('#extra_optl').removeAttr("id");
	var popts = getPollOp();

	$('input[name^=opt]').prop('required', false).attr('requried', 'disabled').removeAttr('required');
	if (popts.length < 2) {
		var req = ($('input[name=opt1]').val()) ? $('input[name=opt2]') : $('input[name=opt1]');
		req.prop('required', true);
		req[0].setCustomValidity("What kind of poll has no real choice?");
		$('<input type="submit">').hide().appendTo($('#polldata')).click().remove();
		return false;
	}
	if (!$('input[name=custom]')[0].checkValidity()) {
		$('<input type="submit">').hide().appendTo($('#polldata')).click().remove();
		return false;
	}

	var newPoll = myDataRef.child('PollDB').push({
		Op: popts,
		Que: $('input[name=que]').val() || "You are cordially invited to..." // hacky fix to have a prompt
	});
	var UUIDkey = newPoll.key();
	var customLink = $('input[name=custom]').val();
	var lookup = {};
	if ($('input[name=custom]').val()) {
		lookup[customLink] = UUIDkey;
		myDataRef.child('Lookup').update(lookup);
	} else {
		customLink = UUIDkey;
		lookup[customLink] = UUIDkey;
		myDataRef.child('Lookup').update(lookup);
	}
	window.location.replace("https://spellchaser.github.io/Cenemus/#" + customLink) // window.location.href
		//$("#polldata").attr("action", "/" + newPollID).submit();
		//window.location = "https://www.youtube.com"; 
	return false;
}


function countProperties(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}
function submitVote() {
	var vote = $('input[name=poll]:checked');
	var sendvote = [];
	sendvote['Value'] = vote[0].value;
	sendvote['PlaceId'] = vote.attr('pid');
	var user = myDataRef.child('PollDB').child(pollKey).child("Voters").push(vote[0].value);
	userkey = user.key();
	//var sendvote = [];
	//sendvote[userkey] = vote.attr('pid');
	//myDataRef.child('PollDB').child(pollKey).child(vote[0].value).child("Votes").push(sendvote);
	// TERRIBLE FOR NOW, but count votes ._. allows dups oh well
	$('#pollInfo-wrapper').hide();
	var snapPoll;
	myDataRef.child('PollDB').child(pollKey).once('value', function(snap) {
		snapPoll = snap.val();
	});
	var snapVotes = snapPoll.Voters;
	var content = [];
	for (vote in snapVotes) {
		console.log(vote);
		var voteplace = snapVotes[vote];
		console.log(voteplace);
		if (!content[voteplace]) {
			console.log(content[voteplace]);
			var label = snapPoll.Op[voteplace].Value, color = rainbow(voteplace+1,countProperties(snapVotes)+1);
			console.log(label);
			content[voteplace] = {
				"label": label,
				"value": 1,
				"color": color
			};
		} else {
			content[snapVotes[vote]].value += 1;
		}
	}
	console.log(content);
	var pie = new d3pie($('#donut')[0], {
		"header": {
			"title": {
				"text": pollInfo.Que,
				"fontSize": 22,
				"font": "verdana"
			},
			"subtitle": {
				"text": "Where we're going to eat democratized",
				"color": "#999999",
				"fontSize": 10,
				"font": "verdana"
			},
			"titleSubtitlePadding": 12
		},
		"footer": {
			"text": "Source: me, my room, the last couple of months.",
			"color": "#999999",
			"fontSize": 11,
			"font": "open sans",
			"location": "bottom-center"
		},
		"size": {
			"canvasHeight": 600,
			"canvasWidth": 600,
			"pieInnerRadius": "9%",
			"pieOuterRadius": "81%"
		},
		"data": {
			"content": content
		},
		"labels": {
			"outer": {
				"pieDistance": 32
			},
			"inner": {
				"format": "value"
			},
			"mainLabel": {
				"font": "verdana"
			},
			"percentage": {
				"color": "#e1e1e1",
				"font": "verdana",
				"decimalPlaces": 0
			},
			"value": {
				"color": "#e1e1e1",
				"font": "verdana"
			},
			"lines": {
				"enabled": true,
				"color": "#cccccc"
			},
			"truncation": {
				"enabled": true
			}
		},
		"effects": {
			"pullOutSegmentOnClick": {
				"effect": "elastic",
				"speed": 400,
				"size": 8
			}
		},
		"callbacks": {}
	});
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
