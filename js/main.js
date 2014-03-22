/* All main JavaScript */

//Define architecture
var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener("deviceready", this.deviceready, false);
    },
    deviceready: function() {
        app.report("deviceready"); //this is an event handler so the scope is that of the event so we need to call app.report(), and not this.report()
		document.addEventListener("offline", offline, false); //we'll use this to detect if the device is offline or not later
		setStorage();
		
			/* All phonegap functionality needs to be in here */
		
    },
    report: function(id) { 
        console.log("report:" + id);
    }
};

/*Sets up the device storage environment to use, automatically selects the best library
/*depending what is supported by the device
-----------------------------------------------------------------------------------------*/
function setStorage() {
	if (indexedDB) {
		store.setDriver("IndexedDBWrapper").then(function() {
			console.log(store.driver + " IndexedDB");
		});
	} else if (window.openDatabase) { // WebSQL is available, so we'll use that.
		store.setDriver("WebSQLWrapper").then(function() {
			console.log(store.driver + " WebSQL");
		});
	} else { // If nothing else is available, we use localStorage.
		store.setDriver("localStorageWrapper").then(function() {
			console.log(store.driver + " LocalStorage");
		});
	};
};

/*
Example of use:

function doSomething(value) {
    console.log(value);
}

//with promises (can also use a callback)
store.setItem("key", "value").then(doSomething);

*/

//for later
function offline() {
	//here
}


//event listeners to help with functions and touchscreens
document.addEventListener("touchstart", this, false);
document.addEventListener("touchmove", this, false);
document.addEventListener("touchend", this, false);
document.addEventListener("touchcancel", this, false);

/*-----------------------------------------------------------------------------------------*/

$(document).on("deviceready", function() {
	
	//here

});

/*Pull out menu
-----------------------------------------------------------------------------------------*/
$(function(mainMenu) {
	var menu = $(".main-menu"), //menu css class
		body = $("body"),
		container = $("#container"), //container id
		push = $(".push"), //used to push content when menu is open
		overlay = $(".overlay"), //invisible overlay for tap body to close
		pushOpen = "menu-open", //applied when menu is open
		pushActiveClass = "push-active", //toggles the overlay visibility for tapping body to close using the body tag
		containerClass = "container-push", //container open class
		pushClass = "pushed", //pushed content
		menuButton = $(".menu-stack"); //menu button
	
	var toggleMenu = function() {
		body.toggleClass(pushActiveClass); //toggle site overlay
		menu.toggleClass(pushOpen);
		container.toggleClass(containerClass);
		push.toggleClass(pushClass); //css class to add pushy capability
	};
	
	if (Modernizr.csstransforms3d) {
		menuButton.hammer().on("tap", function(e) {
			//console.log(this, e);
			toggleMenu();
		});
		
		overlay.hammer().on("tap", function(e) {
			//console.log(this, e);
			toggleMenu();
		});
		
		$("html").hammer().on("swipe", function(e) {
			if (!$(body).hasClass("push-active") && e.gesture.direction === "right") {
				e.stopPropagation(); e.preventDefault();
				//console.log(this, e);
				toggleMenu();
			} else if ($(body).hasClass("push-active") && e.gesture.direction === "left") {
				e.stopPropagation(); e.preventDefault();
				//console.log(this, e);
				toggleMenu();
			};
		});
	}; //end of modernizr test
});


/*Page swapping
-----------------------------------------------------------------------------------------*/

//$(document).pjax("a", "#content")

$("[data-push=\"page\"]").hammer().on("tap", function(e) {
	e.stopPropagation(); e.preventDefault();
});






/*Map on start page, with geolocation

var map - the map on the start page
var cheltenham - lat and long from centre of cheltenham built into a google maps latlng object
var mapStyles - json style array for the map

//IMPORTANT
var position - is used to get the lat and long values from the gps
var currentLocation - holds the users current location from the values in position

-----------------------------------------------------------------------------------------*/



$(function(homeMap) {
	
	if (!Modernizr.geolocation) {
		$(".location-map").html("<p class=\"no-geo message warning\">Sorry, this feature isn't supported on your device.</p>");
		return false;
	}
	
	var map;
	var cheltenham = new google.maps.LatLng(51.902707,-2.073361);
	var currentLocation;
	var mapStyles = 
	[
		{
			"featureType": "road",
			"elementType": "labels",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "poi",
			"elementType": "labels",
			"stylers": [
				{
					"visibility": "simplified"
				}
			]
		},
		{
			"featureType": "transit",
			"elementType": "labels.text",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		//styles for colours
		{
			"featureType": "water",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#a2daf2"
				}
			]
		},
		{
			"featureType": "landscape.man_made",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#f7f1df"
				}
			]
		},
		{
			"featureType": "landscape.natural",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#d0e3b4"
				}
			]
		},
		{
			"featureType": "landscape.natural.terrain",
			"elementType": "geometry",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "poi.park",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#bde6ab"
				}
			]
		},
		{
			"featureType": "poi.medical",
			"elementType": "geometry",
			"stylers": [
				{
					"color": "#fbd3da"
				}
			]
		},
		{
			"featureType": "road",
			"elementType": "geometry.stroke",
			"stylers": [
				{
					"visibility": "off"
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#ffe15f"
				}
			]
		},
		{
			"featureType": "road.highway",
			"elementType": "geometry.stroke",
			"stylers": [
				{
					"color": "#efd151"
				}
			]
		},
		{
			"featureType": "road.arterial",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#ffffff"
				}
			]
		},
		{
			"featureType": "road.local",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "black"
				}
			]
		},
		{
			"featureType": "transit.station.airport",
			"elementType": "geometry.fill",
			"stylers": [
				{
					"color": "#cfb2db"
				}
			]
		}
	]
	
	map = new GMaps({
		div: "#map-container",
		lat: 51.902707, //these coords are Cheltenham, from the centre
		lng: -2.073361,
		zoom: 14, //14 is good, 19 is optimal for our use as it shows POI marker icons but is perhaps too zoomed in, 14 is good for testing
		disableDefaultUI: true,
		styles: mapStyles,
	});
	
	$(function(initialLocate) {
		if (Modernizr.geolocation) {
			GMaps.geolocate({
				success: function(position) {
					//var position = {"lat": position.coords.latitude, "lng": position.coords.longitude}; //might have to move to global var
					//currentLocation = new google.maps.LatLng(position.lat, position.lng);
					
					currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					
					console.log(currentLocation);
				},
				error: function(error) {
					$(".location-map").append("<p class=\"no-geo message warning\">Sorry, we failed to get your current location.</p>");
				},
				not_supported: function() {
					noGeo();
				}
			});
		} else {
			noGeo();
		}	
	});
	
	
		
		/* --------- */
		
		//THIS NEEDS MORE WORK TO USE THE CURRENT LOCATION OF THE USER
		
		var origin = new google.maps.LatLng(51.902707,-2.073361);
		var destination = new google.maps.LatLng(51.899464, -2.074641);
		
		var service = new google.maps.DistanceMatrixService();
		service.getDistanceMatrix({
			origins: [origin],
			destinations: [destination],
			travelMode: google.maps.TravelMode.WALKING,
			unitSystem: google.maps.UnitSystem.IMPERIAL,
			avoidHighways: false,
			avoidTolls: false
		}, callback);
		
		function callback(response, status) {
			if (status == "OK") {
				//origin.value = response.destinationAddresses[0];
				destination.value = response.rows[0].elements[0].distance.text;
				
				var distanceTxt = response.rows[0].elements[0].distance.text;
				var distanceVal = response.rows[0].elements[0].distance.value; //the one I need
				
				console.log(distanceTxt);
				
			} else {
				return false;
			}
		}
		
		callback();
		
		/* --------- */
	
	
	
	
	
	$(".locate-button").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		if (Modernizr.geolocation) {
			locateUser();
		} else {
			geoError();
		}
	});
	
	$("#geocode-search").submit(function(e) {
		e.stopPropagation(); e.preventDefault();
		GMaps.geocode({
			address: $("#address").val().trim(),
			callback: function(results, status) {
				if (status == "OK") {
					removeMarkers(); //clear past results
					var result = results[0].geometry.location;
					console.log(result);
					map.setCenter(result.lat(), result.lng());
					
					map.addMarker({
						lat: result.lat(),
						lng: result.lng(),
						icon: "img/location-marker-pink.png",
						animation: google.maps.Animation.DROP,
					});
					
				} else {
					$("#address").focus();
					console.log("oh no");
				}
			}
		});
		map.setZoom(19);
	}); 
	
	$(".search-button").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		var check = $("#place-query").val();
		
		if (check == "") {
			$("#place-query").focus();
			$("#place-query").attr("placeholder", "You didn't enter any terms") && $("#place-query").addClass("plc-warning");
			setTimeout(function() {
				$("#place-query").attr("placeholder", "Search for places") && $("#place-query").removeClass("plc-warning");;
			}, 2500);
			return false;
		} else {
			$("#place-search").submit();
		}
	});
	
	
	function placeCheck() {
		var query = $("#place-query").val();
		
		if (query == "") {
			$("#place-query").focus();
			$("#place-query").attr("placeholder", "You didn't enter any terms") && $("#place-query").addClass("plc-warning");
			setTimeout(function() {
				$("#place-query").attr("placeholder", "Search for places") && $("#place-query").removeClass("plc-warning");;
			}, 2500);
			return false;
		} else {
			$("#place-search").submit();
		}
	}
	
	$("#place-search").submit(function(e){
		e.stopPropagation(); e.preventDefault();
		var query = $("#place-query").val();
		
		map.addLayer("places", {
			location: new google.maps.LatLng(51.902707,-2.073361),
			radius: 500, //experiment with the distance
			query: query,
			//types : ["store"], //for nearby search using places - we could use a switch or user setting for multiple types of searce, radio buttons or something
			
			//I think we need to use text search or both - we need to research these
			//nearbySearch, textSearch, radarSearch
			textSearch: function (results, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					$(".results-list").html(""); //remove previous results
					
					removeMarkers(); //remove previous markers
					
					var bounds = new google.maps.LatLngBounds();
					//console.log(bounds);
					
					//I think if we set i to say 10, it will limit the search results - by default the places api returns 10 result sets
					for (var i = 0; i < results.length; i++) {
						//console.log(i);
						var place = results[i];
						
						var image = { //set to better sizes and positions (icons from search results)
							url: place.icon,
							size: new google.maps.Size(71, 71),
							origin: new google.maps.Point(0, 0),
							anchor: new google.maps.Point(17, 34),
							scaledSize: new google.maps.Size(25, 25)
						};
						
						map.addMarker({
							lat: place.geometry.location.lat(),
							lng: place.geometry.location.lng(),
							icon: image,
							animation: google.maps.Animation.DROP,
							title: place.name,
							infoWindow: {
								content: '<h2>'+place.name+'</h2>' + '<p>Rating: '+place.rating+'</p>' +  '<p>'+(place.vicinity ? place.vicinity : place.formatted_address)+'</p><img src="'+place.icon+'"" width="100"/>'
							}	
						});
						
						bounds.extend(place.geometry.location);
						$(".results-list").append("<li>" + place.name + "</li>"); //IMPORTANT: this needs to be cleared for new results upon a new search and the html needs better styling (main.scss)
						
					}//end for loop
					map.fitBounds(bounds); //fit to the new bounds
				}//end if ok
			}//end search
		});//end place layer
		
		//bias the search results towards places that are within the bounds of the current maps viewport
		google.maps.event.addListener(map, "bounds_changed", function() {
			var bounds = map.getBounds();
			console.log(bounds);
			//searchBox.setBounds(bounds);
			$("#place-query").setBounds(bounds);
		});
		
	});
	
	function locateUser() {
		if (Modernizr.geolocation) {
			GMaps.geolocate({
				success: function(position) {
					removeMarkers(); //remove markers from the map
					map.setCenter(position.coords.latitude, position.coords.longitude); //I think smooth panning works if the new location is within a certain radius
					
					//update current location variable
					//var position = {"lat": position.coords.latitude, "lng": position.coords.longitude};
					//currentLocation = new google.maps.LatLng(position.lat, position.lng);
					currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					console.log(currentLocation);
					
					//add marker at user current location
					map.addMarker({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
						icon: "img/location-marker-blue.png",
						animation: google.maps.Animation.DROP,
					});
					map.setZoom(16);
				},
				error: function(error) {
					geoError();
					console.log("Geolocation failed: " + error.message);
				},
				not_supported: function() {
					noGeo();
					console.log("This browser does not support geolocation");
				},
				/*always: function() {
					
				},*/
			});
		} else {//if no geolocation is supported, replace the content
			noGeo();
		};
	};
	
	function geoError() {
		$(".location-map").append("<p class=\"no-geo message warning\">Sorry, this feature isn't available right now.</p>");
		setTimeout(function() {
			$(".no-geo").remove();
		}, 3500);
	};
	
	function noGeo() {
		$(".location-map").append("<p class=\"no-geo message warning\">Sorry, this feature isn't supported on your device.</p>");
	};
	
	function removeMarkers() {
		map.removeMarkers();
	};
	
	function geocodeCurrent() {
		GMaps.geocode({
			address: currentLocation,
			callback: function(results, status) {
				if (status == "OK") {
					var result = results[0].geometry.location;
					//alert(result);
				} else {
					return false;
				}
			}
		});
	};
});





/*Prefetch facility - add class "prefetch" to any links
-----------------------------------------------------------------------------------------*/
$(function(prefetch) {
	//create object and build array of urls to prefetch, to use add class prefetch to link (later: make it use data-attr, e.g. data-prefetch="true" or false
	var links = {
		prefetchLinks: function() {
			var hrefs = $("a.prefetch").map(function(index, domElement) { //returns an array of each a.prefetch link's href
				return $(this).attr("href");
			});
			return $.unique(hrefs); //returns the array of hrefs without duplicates
		},
	
		//adds a link tag to the document head for each of prefetchLinks()
		addPrefetchTags: function() {
			this.prefetchLinks().each(function(index, Element){
				$("<link />", { //create a link element and add to head
					rel: "dns-prefetch", href: Element
				}).appendTo("head");            
			});
		},
	};
	
	$(function(prefetchStart) {
		links.addPrefetchTags(); //call the method
	});
});

/*Capatilise first letter in a string
-----------------------------------------------------------------------------------------*/
String.prototype.capitalise = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}