/* All main JavaScript */

//define
var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener("deviceready", this.deviceready, false);
    },
    deviceready: function() {
		//app.report("deviceready"); //this is an event handler so the scope is that of the event so we need to call app.report(), and not this.report()
		addEventListeners();
		setStorage();
		
			/* EVERYTHING BAR HELPER FUNCTIONS SHOULD BE IN HERE FOR PHONEGAP FUNCTIONS TO WORK.
			 * All phonegap functionality needs to be in here - a copy and paste should work, but we need to test everything.
			 */
		
    },
    report: function(id) { 
        console.log("report:" + id);
    }
};

/*Sets up the device storage environment to use, automatically selects the best library
/*depending what is supported by the device. Uses store.js, based on Mozilla LocalStorage.
-----------------------------------------------------------------------------------------*/
function setStorage() {
	var db = indexedDB || window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
	
	if (indexedDB) {
		store.setDriver("IndexedDBWrapper").then(function() {
			//console.log(store.driver + " IndexedDB");
		});
	} else if (window.openDatabase) { // WebSQL is available, so we'll use that.
		store.setDriver("WebSQLWrapper").then(function() {
			//console.log(store.driver + " WebSQL");
		});
	} else { // If nothing else is available, we use localStorage.
		store.setDriver("localStorageWrapper").then(function() {
			//console.log(store.driver + " LocalStorage");
		});
	};
	
	window.storeConfig = {
		name        : "visit_cheltenham_app",
		version     : 1.0,
		size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
		storeName   : "vc_storage",
		description : "Config settings and other application data"
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
function online() {
	//here
}

//for later
function offline() {
	//here
};

//for later
function paused() {
	//here	
};

//for later
function resumed() {
	//here
};

function addEventListeners() {
	//touch
	document.addEventListener("touchstart", this, false);
	document.addEventListener("touchmove", this, false);
	document.addEventListener("touchend", this, false);
	document.addEventListener("touchcancel", this, false);
	//phonegap
	document.addEventListener("online", online, false); //device is online
	document.addEventListener("offline", offline, false); //we'll use this to detect if the device is offline or not later
	document.addEventListener("pause", paused, false); //when the app is backgrounded this event is fired
	document.addEventListener("resume", resumed, false); //when the app is resumed from being backgrounded
}

/*-----------------------------------------------------------------------------------------*/

var header =	"<header role=\"banner\" data-role=\"header\" class=\"app-header container inner-wrap\">" +
                	"<div role=\"button\" data-role=\"button\" class=\"menu-stack push\"></div>" +
                    "<nav role=\"navigation\" data-role=\"navbar\" class=\"main-menu menu-closed\">" +
                    	"<div class=\"nav-links\">" +
                        	"<a data-goto=\"#home\" data-push=\"page\" class=\"prefetch page\"><i class=\"fa fa-border fa-home\"></i>Home</a>" +
                            "<a data-push=\"page\" class=\"prefetch page\"><i class=\"fa fa-border fa-location-arrow\"></i>Nearby</a>" +
                            "<a data-push=\"page\" class=\"prefetch page\"><i class=\"fa fa-border fa-shopping-cart\"></i>Offers</a>" +
                            "<a data-goto=\"#settings\" data-push=\"page\" class=\"prefetch page\"><i class=\"fa fa-border fa-cog\"></i>Settings</a>" +
                        "</div>" +
                    "</nav>" +
                    "<div role=\"button\" data-role=\"button\" class=\"locate-button\"></div>" +
                "</header>";
				
$("body").prepend(header);

/*-----------------------------------------------------------------------------------------*/

/*$(document).on("deviceready", function() {
	//backbutton detection for exiting the application
	document.addEventListener("backbutton", function() {
		exitApp();
		
		function exitApp() {
			navigator.notification.confirm("Exit?", function(button) {
				if (button == 1) {
					navigator.app.exitApp();
				} 
			}, "Exit", "Yes, No");  
			return false;
		}
	}, false);
	
	//here

});*/

//$(document).on("deviceready", function() {

/*Pull out menu, using 3dtransforms
-----------------------------------------------------------------------------------------*/
$(function(navigationalHandles) {
	var menu = $(".main-menu"), //menu css class
		body = $("body"),
		container = $("#container"), //container id - NOT USED CURRENTLY AS WOULD CONFLICT WITH OTHER "PAGES" ON THE THE SAME PAGE, MIGHT HAVE TO ADJUST
		push = $(".push"), //used to push content when menu is open
		overlay = $(".overlay"), //invisible overlay for tap body to close
		pushOpen = "menu-open", //applied when menu is open
		pushActiveClass = "push-active", //toggles the overlay visibility for tapping body to close using the body tag
		containerClass = "container-push", //container open class
		pushClass = "pushed", //pushed content
		menuButton = $(".menu-stack"); //menu button
		//view and page handles
		app = $("#app");
		handle = "data-goto";
	
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
	}; //end of modernizr test - not needed for this app, but a jquery or other fallback technique should be here
		
	//determine what the initial view should be
	if ($("#app > .current").length === 0) {
		$currentPage = $("#app > *:first-child").addClass("current");
		//$currentPage = $("#settings").addClass("current"); //FOR DEV-REMOVE LATER
	} else {
		$currentPage = $("#app > .current");
	}
	
	$("[data-push=\"page\"]").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		//console.log(this, e);
		toggleMenu();
		
		var current = $(app).find(".current"); //this won't work more globally as the class current changes
		var newPage = $(this).attr(handle);
		
		//hide current and show new page
		$(current).removeClass("current");
		$(newPage).addClass("current");
		
		return false;
	});
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
	//if not available, then fallover
	if (!Modernizr.geolocation) {
		noGeo();
		return false;
	}
		
	//variables to cache the result lists for faster performance
	var nameList = $(".results-names"),
		distanceList = $(".results-distances"),
		noResults = $(".results h1")
		
	var locationMark, locationCircle;
	
	//vars to the control and store various aspects of the app
	var map;
	var cheltenham = new google.maps.LatLng(51.902707,-2.073361);
	var currentLocation;
	var origin; //this is used for the distance matrix function
	var mapStyles = [{featureType:"road",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi",elementType:"labels",stylers:[{visibility:"simplified"}]},{featureType:"transit",elementType:"labels.text",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"geometry",stylers:[{color:"#a2daf2"}]},{featureType:"landscape.man_made",elementType:"geometry",stylers:[{color:"#f7f1df"}]},{featureType:"landscape.natural",elementType:"geometry",stylers:[{color:"#d0e3b4"}]},{featureType:"landscape.natural.terrain",elementType:"geometry",stylers:[{visibility:"off"}]},{featureType:"poi.park",elementType:"geometry",stylers:[{color:"#bde6ab"}]},{featureType:"poi.medical",elementType:"geometry",stylers:[{color:"#fbd3da"}]},{featureType:"road",elementType:"geometry.stroke",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{color:"#ffe15f"}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#efd151"}]},{featureType:"road.arterial",elementType:"geometry.fill",stylers:[{color:"#ffffff"}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{color:"black"}]},{featureType:"transit.station.airport",elementType:"geometry.fill",stylers:[{color:"#cfb2db"}]}];
	
	var searchRadius,
		travelMode,
		unitSystem
	
	store.getItem("searchRadius").then(function(value) {
		searchRadius = parseInt(value);
	});
	
	store.getItem("travelMode").then(function(value) {
		if (value == "walking") {
			travelMode = google.maps.TravelMode.WALKING;
		} else if (value == "bicycling") {
			travelMode = google.maps.TravelMode.BICYCLING;
		} else if (value == "driving") {
			travelMode = google.maps.TravelMode.DRIVING;
		};
	});
	
	store.getItem("unitSystem").then(function(value) {
		if (value == "imperial") {
			unitSystem = google.maps.UnitSystem.IMPERIAL;
		} else if (value == "metric") {
			unitSystem = google.maps.UnitSystem.METRIC;
		};
	});
	
	map = new GMaps({
		div: "#map-container",
		center: cheltenham, //also accets seperate lat and lng values, e.g. lat: 51.902707, lng: -2.073361
		zoom: 14, //14 is good, 19 is optimal for our use as it shows POI marker icons but is perhaps too zoomed in
		disableDefaultUI: true,
		styles: mapStyles,
		
		dragend: function(e) {
			//do stuff here, update vars or whatever
			console.log("dragend detected");
		}
	});
	
	//get the location of the user and store in currentLocation var
	$(function(initialLocate) {
		if (Modernizr.geolocation) {
			GMaps.geolocate({
				success: function(position) {
					var position = {"lat": position.coords.latitude, "lng": position.coords.longitude};
					currentLocation = new google.maps.LatLng(position.lat, position.lng);
					console.log("currentLocation: " + currentLocation);
				},
				error: function(error) {
					$(".location-map").append("<p class=\"no-geo message warning\">Sorry, we failed to get your current location.</p>");
					console.log(error.message);
				}
			});
		} else {
			noGeo();
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
		var query = $("#place-query").val();
		if (query == "") {
			$("#place-query").focus();
			$("#place-query").attr("placeholder", "You didn't enter any terms") && $("#place-query").addClass("plc-warning"); //jazzy
			setTimeout(function() {
				$("#place-query").attr("placeholder", "Search for places") && $("#place-query").removeClass("plc-warning");;
			}, 2800);
			return false;
		} else {
			$("#place-search").submit();
		}
	});
	
	$("#place-search").submit(function(e){
		e.stopPropagation(); e.preventDefault();
		var query = $("#place-query").val();
		
		if (query == "") { //this check should be a function, but since its calling the submit() function on success, it got all confused (will write better if time permits)
			$("#place-query").focus();
			$("#place-query").attr("placeholder", "You didn't enter any terms") && $("#place-query").addClass("plc-warning");
			setTimeout(function() {
				$("#place-query").attr("placeholder", "Search for places") && $("#place-query").removeClass("plc-warning");;
			}, 2800);
			return false;
		} else {
			map.addLayer("places", {
				location: cheltenham, 
				radius: searchRadius, //distance (in metres) - if they are no or little results in this area, it will expand to get more, but keeping within sensible distance
				query: query,
				sensor: true,
				language: "en-GB",
				
				//text search function, accepts terms like "coffee", "hotels", and returns 20 results in the area or expanded area (see above re searchRadius)
				textSearch: function (results, status) {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						clearResults(); //remove previous results and markers
						
						var bounds = new google.maps.LatLngBounds();
						//console.log(bounds);
						
						//by default the places api returns 20 result sets (I think it is actually a limit imposed by Google unless you're a business customer - Martin)
						for (var i = 0; i < results.length; i++) {
							var place = results[i];
							//console.log(i);
							
							var image = { //set to better sizes and positions (icons from search results)
								url: place.icon,
								size: new google.maps.Size(71, 71),
								origin: new google.maps.Point(0, 0),
								anchor: new google.maps.Point(17, 34),
								scaledSize: new google.maps.Size(20, 20)
							};
							
							nameList.append("<li class=\"name\">" + place.name + "</li>")
							
							/* ---------- */
							
							/*The next section works out the distances and estimated durations to each place from the search results*/
							
							origin = currentLocation;
							var destination = place.geometry.location;
							var service = new google.maps.DistanceMatrixService();
							
							//console.log(origin);
							//console.log(destination);
							
							service.getDistanceMatrix({
								origins: [origin], //aray containing the current location, DistanceMatrix service only accepts an array so it needs to be done
								destinations: [destination], //array of destinations, built from the search results lat + lngs
								travelMode: travelMode,
								unitSystem: unitSystem,
								avoidHighways: false,
								avoidTolls: false
							}, getDistance);
							
							function getDistance(response, status) {
								if (status == google.maps.DistanceMatrixStatus.OK) {
									
									var origins = response.originAddresses;
									var destinations = response.destinationAddresses;
									
									/* do some funky stuff with loops.
									   it is actually looping through each of the search results lat and longs and working out the
									   distance and duration to each places location (using the currentLocation var), then getting
									   data from the results of the calculations, e.g. distance and time
									*/
									
									//note the i and x for counters, i = origins and x = destinations
									for (var i = 0; i < origins.length; i++) {
										var results = response.rows[i].elements;
										
										for (var x = 0; x < results.length; x++) {
											var element = results[x];
											var distance = element.distance.text;
											var duration = element.duration.text;
											
											var from = origins[i];
											var to = destinations[x];
											
											distanceList.append("<li class=\"distance\">" + distance + "</li>"); //put the resuls into the list as items
										}
									}
								} else { //catch errors here
									return false;
									console.log(response + status)
								}
							}
							
							/* ---------- */
							
							map.addMarker({
								lat: place.geometry.location.lat(),
								lng: place.geometry.location.lng(),
								icon: image,
								animation: google.maps.Animation.DROP,
								title: place.name,
								
								//we need to style and build these better - ideas? should be simple I think, Name + Location + Image"<p>Rating: '+place.rating+'</p>'
								infoWindow: {
									content: "<h2>" + place.name + "</h2>" + "<p>" + (place.vicinity ? place.vicinity : place.formatted_address) + "</p>"
								}
							});
							
							bounds.extend(place.geometry.location);
							
						}
						
						map.fitBounds(bounds); //fit to the new bounds
						
						/* now we draw two circles around currentLocation
						   locationCircle has a radius of 500 metres, matching the search result radius
						   locationMark is styled to be a solid dot
						   both are centred on currentLocation meaning to show which places (if any) are - OR TEST WITH 'cheltenham' var
						   in the immediate location of the user.
						*/
						
						//location dot - might remove, what do you think?
						locationMark = map.drawCircle({
							//center: currentLocation,
							center: cheltenham,
							radius: 4, 
							strokeColor: "#00adef",
							strokeOpacity: 1,
							strokeWeight: 8,
							fillColor: "#00adef",
							fillOpacity: 1
						});
						
						//current location circle radius
						locationCircle = map.drawCircle({
							//center: currentLocation,
							center: cheltenham,
							radius: searchRadius,
							strokeColor: "#00adef",
							strokeOpacity: 1,
							strokeWeight: 1,
							fillColor: "#808080",
							fillOpacity: 0.28
						});
					} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
						console.log(status);
						clearResults();
						noResults.after("<p class=\"warning no-results\">Sorry, no places were found matching your search.</p>")
					} else if (status == google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
						console.log(status);
					}
				}
			});
		}
		
		//bias the search results towards places that are within the bounds of the current maps viewport
		google.maps.event.addListener(map, "bounds_changed", function() {
			var bounds = map.getBounds();
			//console.log(bounds);
			//searchBox.setBounds(bounds);
			$("#place-query").setBounds(bounds);
		});
		
	});
	
	//function to locate the user and update the currentLocation variable (could be made cleaner into same function as initialLocate - later if time)
	function locateUser() {
		if (Modernizr.geolocation) {
			GMaps.geolocate({
				success: function(position) {
					//update current location variable
					var position = {"lat": position.coords.latitude, "lng": position.coords.longitude}; //might have to move to global var
					currentLocation = new google.maps.LatLng(position.lat, position.lng); //could be problematic with distance function, as not the same function
					console.log("locate button, currentLocation: " + currentLocation);
					
					removeMarkers(); //remove markers from the map
					
					map.addMarker({//add marker at user current location
						lat: position.lat,
						lng: position.lng,
						icon: "img/location-marker-blue.png",
						animation: google.maps.Animation.DROP,
					});
					map.setCenter(position.lat, position.lng); //I think smooth panning works if the new location is within a certain radius
					map.setZoom(16);
					$(".no-results").remove();
				},
				error: function(error) {
					geoError();
					console.log("Geolocation failed: " + error.message);
				},
				/*always: function() {
					//more here?
				},*/
			});
		} else {//if no geolocation is supported, replace the content
			noGeo();
			console.log("This browser does not support geolocation");
		};
	};
	
	//function to show error message if a problem occurs
	function geoError() {
		$(".location-map").append("<p class=\"no-geo message warning\">Sorry, this feature isn't available right now.</p>");
		setTimeout(function() {
			$(".no-geo").remove();
		}, 3500);
	};
	
	//function if geolocation is not supported on the device (unlikely to occur)
	function noGeo() {
		$(".location-map").append("<p class=\"no-geo message warning\">Sorry, this feature isn't supported on your device.</p>");
	};
	
	//function remove markers off the map
	function removeMarkers() {
		map.removeMarkers();
	};
	
	//function to remove previous search results
	function clearResults() {
		nameList.html(""); 
		distanceList.html("");
		removeMarkers();
		$(".no-results").remove();
		map.setZoom(14);
					
		//circles are checked for being present, or setMap errors occur
		if (locationCircle && locationMark) {
			locationCircle.setMap(null);
			locationMark.setMap(null);
		};
	};
	
	//function to geocode the current location of the user
	function geocodeCurrent() {
		GMaps.geocode({
			address: currentLocation,
			callback: function(results, status) {
				if (status == "OK") {
					var result = results[0].geometry.location;
					console.log(result);
				} else {
					return false;
					console.log(status);
				}
			}
		});
	};
});

/*Settings and options functionality
-----------------------------------------------------------------------------------------*/
$(function(userSettings) {
	
	store.getItem("searchRadius").then(function(value) {
		//console.log(value)
		$("#search-radius").val(value);
	});
	
	store.getItem("travelMode").then(function(value) {
		//console.log(value)
		$("#travel-mode option[value=\"" + value + "\"]").attr("selected", "selected");
	});
	
	store.getItem("unitSystem").then(function(value) {
		//console.log(value)
		$("#unit-system option[value=\"" + value + "\"]").attr("selected", "selected");
	});
	
	$(".save-settings").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		console.log(this, e + "saved");
		
		var searchRadius = $("#search-radius").val(),
			travelMode   = $("#travel-mode").val(),
			unitSystem   = $("#unit-system").val()
			
		store.setItem("searchRadius", searchRadius);
		store.setItem("travelMode", travelMode);
		store.setItem("unitSystem", unitSystem);
		
		//$("#search-settings").append("<p class=\"message success\">Settings have been saved, restart required</p>");
		
		navigator.notification.confirm(
			"Settings Saved",
			confirmRestart,
			"Restart Now",
			"Yes,No"
		);
		
		function confirmRestart() {
			if (button == 1) {
				location.reload();
			} else {
				return false;
			}
		};
		
	});
});

//});//end phonegap device ready

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