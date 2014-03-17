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
	var showMenu = function() {
		$("body").toggleClass("push-active");
		$(".main-menu").toggleClass("menu-open");
	};
	
	var hideMenu = function() {
		$("body").removeClass("push-active");
		$(".main-menu").removeClass("menu-open");
	};
	
	$(".menu-stack").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		showMenu();
	});
	
	$("html").hammer().on("swipe", function(e) {
		if (!$(".main-menu").hasClass("menu-open") && e.gesture.direction === "right") {
			e.stopPropagation(); e.preventDefault();
			//console.log(this, e);
			showMenu();
		} else if ($(".main-menu").hasClass("menu-open") && e.gesture.direction === "left") {
			e.stopPropagation(); e.preventDefault();
			//console.log(this, e);
			hideMenu();
		}
	});
	
	$("html").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		hideMenu();
	});
});


/*Page swapping
-----------------------------------------------------------------------------------------*/

//$(document).pjax("a", "#content")

$("[data-push=\"page\"]").hammer().on("tap", function(e) {
	e.stopPropagation(); e.preventDefault();
});






/*Map on start page, with geolocation
-----------------------------------------------------------------------------------------*/
$(function(homeMap) {
	
	if (!Modernizr.geolocation) {
		$(".location-map").html("<p class=\"no-geo message warning\">Sorry, this feature isn't supported on your device.</p>");
		return false;
	}
	
	var map;
	var cheltenham = "51.902707,-2.073361";
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
		zoom: 14, //19 is optimal for our use as it shows POI marker icons but is perhaps too zoomed in, 14 is good for testing
		disableDefaultUI: true,
		styles: mapStyles,
	});
	
	map.addLayer("places", {
		location : new google.maps.LatLng(51.902707,-2.073361),
		radius : 500,
		types : ["store"], //need to see how this works
		
		//I think we need to use text search or both - we need to research these
		nearbySearch: function (results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var place = results[i];
					
					map.addMarker({
						lat: place.geometry.location.lat(),
						lng: place.geometry.location.lng(),
						title : place.name,
						infoWindow : {
							content : '<h2>'+place.name+'</h2><p>'+(place.vicinity ? place.vicinity : place.formatted_address)+'</p><img src="'+place.icon+'"" width="100"/>'
						}
					});
				}
			}
		}
	});
	
	
	
	
	
	
	
	
	
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
					removeMarkers();
					var result = results[0].geometry.location;
					console.log(result);
					map.setCenter(result.lat(), result.lng());
					
					map.addMarker({
						lat: result.lat(),
						lng: result.lng(),
						icon: "img/location-marker-pink.svg",
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
	
	$("#search").submit(function(e){
		e.stopPropagation(); e.preventDefault();
	});
	
	function locateUser() {
		if (Modernizr.geolocation) {
			GMaps.geolocate({
				success: function(position) {
					removeMarkers(); //remove markers from the map
					map.setCenter(position.coords.latitude, position.coords.longitude); //I think smooth panning works if the new location is within a certain radius
					
					//update var
					currentLocation = position.coords.latitude + ", " + position.coords.longitude;
					
					//add marker at user current location
					map.addMarker({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
						icon: "img/location-marker-blue.svg",
						animation: google.maps.Animation.DROP,
					});
					map.setZoom(19);
				},
				error: function(error) {
					geoError();
					console.log("Geolocation failed: " + error.message);
				},
				not_supported: function() {
					noGeo();
					console.log("This browser does not support geolocation");
				},
				always: function() {
					console.log(currentLocation);
				},
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
	}
	
	function noGeo() {
		$(".location-map").append("<p class=\"no-geo message warning\">Sorry, this feature isn't supported on your device.</p>");
	}
	
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


/*var resultList = [];
var service = new google.maps.places.PlacesService(map);
var query = $("#query").val();
var request = {
    location: map.getCenter(),
    radius: "5000",
    query: query  
};

service.textSearch(request, function(results, status, pagination){
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        resultList = resultList.concat(results);
        plotResultList();
    }
});*/










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
					rel: "prefetch", href: Element
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