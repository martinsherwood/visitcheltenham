//application constructor -> bind events/listeners -> deviceready -> update and display -> report
//deviceready event handler, the scope of 'this' is the event. In order to call the 'report' function, we must explicity call 'app.report(...);', same for any others
//app.report is an event handler so the scope is that of the event so we need to call app.report(), and not this.report()

var serverURL = "http://www.martinsherwood.co.uk/visitcheltenham/";
var searchRadius, travelMode, unitSystem, userName, userEmail, userPassword; //password should be encrypted
var offerCount = 0;
var name, userID; //name is only used for fetching the user ID of the user from the database

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener("deviceready", this.onDeviceReady, false);
		document.addEventListener("backbutton", backButton, false);
		//add more here
    },
    onDeviceReady: function() {
		setStorage();
		getSettings();
    },
    report: function(id) {
		console.log("report:" + id);
    },
};

/*Sets up the device storage environment to use, automatically selects the best library
/*depending what is supported by the device. Uses store.js, based on Mozilla LocalForage.
-----------------------------------------------------------------------------------------*/
function setStorage() {
	var db = indexedDB || window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
	
	if (indexedDB) {
		store.setDriver("IndexedDBWrapper").then(function() {
			console.log(store.driver + " IndexedDB"); //this is what we want
		});
	} else if (window.openDatabase) {
		store.setDriver("WebSQLWrapper").then(function() {
			console.log(store.driver + " WebSQL"); //WebSQL is available, so we'll use that
		});
	} else {
		store.setDriver("localStorageWrapper").then(function() {
			console.log(store.driver + " LocalStorage"); //if nothing else is available, we use localStorage
		});
	};
	
	window.storeConfig = {
		name        : "visit_cheltenham_app",
		version     : 1.0,
		size        : 4980736, //size of database, in bytes. WebSQL only
		storeName   : "vc_storage",
		description : "Config settings and other application data"
	};
};


function getSettings() {
	store.getItem("searchSettings").then(function(value) {
		searchRadius = parseInt(value[0].searchRadius);
		
		if (value[1].travelMode == "walking") {
			travelMode = google.maps.TravelMode.WALKING;
		} else if (value[1].travelMode == "bicycling") {
			travelMode = google.maps.TravelMode.BICYCLING;
		} else if (value[1].travelMode == "driving") {
			travelMode = google.maps.TravelMode.DRIVING;
		};
		
		if (value[2].unitSystem == "imperial") {
			unitSystem = google.maps.UnitSystem.IMPERIAL;
		} else if (value[2].unitSystem == "metric") {
			unitSystem = google.maps.UnitSystem.METRIC;
		};
	});
	
	store.getItem("userAccount").then(function(value) {
		userName = value[0].userName;
		userEmail = value[1].userEmail;
		userPassword = value[2].userPassword;
		//console.log(userName + userEmail + userPassword);
	});
};

function getID() {
	store.getItem("userAccount").then(function(value) {
		name = value[0].userName;
		//console.log("name from store: " + name);
	});
		
	$.ajax({
		type: "POST",
		data: {username: name},
		url: serverURL + "getuser.php",
		async: false,
		success: function(id, status) {
			userID = id; //if no name is sent, then it returns 0 to validate new users
		},
		error: function() {
			console.log("Failed to get user id, probably there is no match for the given username in the database.");
		}
	});
	
	console.log("User ID Function: " + userID);
};

$(function(getUserID) {
	store.getItem("userAccount").then(function(value) {
		name = value[0].userName;
		//console.log("name from store: " + name);
	});
		
	$.ajax({
		type: "POST",
		data: {username: name},
		url: serverURL + "getuser.php",
		async: false,
		success: function(id, status) {
			userID = id; //if no name is sent, then it returns 0 to validate new users
		},
		error: function() {
			console.log("Failed to get user id, probably there is no match for the given username in the database.");
		}
	});
	console.log("User ID: " + userID);
});


/*-----------------------------------------------------------------------------------------*/

//we add the header like this incase we need it different pages and sections
var header =	"<header role=\"banner\" data-role=\"header\" class=\"app-header container inner-wrap\">" +
                	"<div role=\"button\" data-role=\"button\" class=\"menu-stack push\"></div>" +
                    "<nav role=\"navigation\" data-role=\"navbar\" class=\"main-menu menu-closed\">" +
                    	"<div class=\"nav-links\">" +
                        	"<a data-goto=\"#search\" data-push=\"page\" data-get=\"settings\" data-user=\"userid\"><i class=\"fa fa-border fa-search\"></i>Search</a>" +
                            "<a data-goto=\"#favourites\" data-push=\"page\" data-get=\"favourites\" data-user=\"userid\"><i class=\"fa fa-border fa-star\"></i>Favourites</a>" +
                            "<a data-goto=\"#offers\" data-push=\"page\"><i class=\"fa fa-border fa-shopping-cart\"></i>Offers<span id=\"offer-count\">" + "</span></a>" +
                            "<a data-goto=\"#settings\" data-push=\"page\"><i class=\"fa fa-border fa-cog\"></i>Settings</a>" +
                        "</div>" +
                    "</nav>" +
                    "<div role=\"button\" data-role=\"button\" class=\"locate-button\"></div>" +
                "</header>";
							
$("body").prepend(header); //or wherever we want on different pages


/*Pull out menu, using 3dtransforms (remade from the absolute positioned using left)
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
		app = $("#app");
		handle = "goto";
		
	var toggleMenu = function() {
		body.toggleClass(pushActiveClass); //toggle site overlay
		menu.toggleClass(pushOpen);
		container.toggleClass(containerClass);
		push.toggleClass(pushClass); //css class to add push
	};
	
	if (Modernizr.csstransforms3d) {
		menuButton.hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			toggleMenu();
		});
		
		overlay.hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			toggleMenu();
		});
		
		$("html").hammer().on("swipe", function(e) {
			if (!$(body).hasClass("push-active") && e.gesture.direction === "right") {
				e.stopPropagation(); e.preventDefault();
				toggleMenu();
			} else if ($(body).hasClass("push-active") && e.gesture.direction === "left") {
				e.stopPropagation(); e.preventDefault();
				toggleMenu();
			};
		});
	}; //end of modernizr test - not needed for this app, but a jquery or other fallback technique should be here
		
	//determine what the initial view should be
	if ($("#app > .current").length === 0) {
		//$currentPage = $("#app > *:first-child").addClass("current");
		$currentPage = $("#offers").addClass("current"); //FOR DEV, REMOVE LATER
	} else {
		$currentPage = $("#app > .current");
	};
	
	$("[data-push=\"page\"]").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		toggleMenu();
		
		var current = $(app).find(".current"); //this won't work more globally as the class current changes
		var newPage = $(this).data(handle);
		
		//hide current and show new
		$(current).removeClass("current");
		$(newPage).addClass("current");
		
		//var state = { name: newPage };//history.pushState(state, newPage, newPage.split("#").join(""));
	});
});


/*Main location and map based services
-----------------------------------------------------------------------------------------*/
(function() { //begin main map scope
	//variables to cache the result lists for faster performance
	var nameList = $(".results-names"),
		detailsList = $(".results-details"),
		noResults = $(".results h1")
		
	//vars to the control and store various aspects of the app	
	var locationMark, locationCircle;
	var map;
	var cheltenham = new google.maps.LatLng(51.902707,-2.073361);
	var currentLocation;
	var origin; //this is used for the distance matrix function
	var mapStyles = [{featureType:"road",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"labels.text",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"geometry",stylers:[{color:"#a2daf2"}]},{featureType:"landscape.man_made",elementType:"geometry",stylers:[{color:"#f7f1df"}]},{featureType:"landscape.natural",elementType:"geometry",stylers:[{color:"#d0e3b4"}]},{featureType:"landscape.natural.terrain",elementType:"geometry",stylers:[{visibility:"off"}]},{featureType:"poi.park",elementType:"geometry",stylers:[{color:"#bde6ab"}]},{featureType:"poi.medical",elementType:"geometry",stylers:[{color:"#fbd3da"}]},{featureType:"road",elementType:"geometry.stroke",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{color:"#ffe15f"}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#efd151"}]},{featureType:"road.arterial",elementType:"geometry.fill",stylers:[{color:"#ffffff"}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{color:"black"}]},{featureType:"transit.station.airport",elementType:"geometry.fill",stylers:[{color:"#cfb2db"}]}];
	
	getSettings(); //this always fires, but we call it here because we need direct access to the vars which control the search
	
	//get the location of the user and store in currentLocation var
	$(function(initialLocate) {
		if (Modernizr.geolocation) {
			GMaps.geolocate({
				success: function(position) {
					var position = {"lat": position.coords.latitude, "lng": position.coords.longitude};
					currentLocation = new google.maps.LatLng(position.lat, position.lng);
					//console.log("currentLocation: " + currentLocation);
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
	
	$(function(placesMap) {
		//if not available, then fallover
		if (!Modernizr.geolocation) {
			noGeo();
			return false;
		}
		
		map = new GMaps({
			div: "#map-container",
			center: cheltenham, //also accets seperate lat and lng values, e.g. lat: 51.902707, lng: -2.073361
			zoom: 14, //14 is good, 19 is optimal for our use as it shows POI marker icons but is perhaps too zoomed in
			disableDefaultUI: true,
			styles: mapStyles,
		});
	
		$(".locate-button").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			if (Modernizr.geolocation) {
				locateUser();
			} else {
				geoError();
			}
		});
		
		$("[data-action=\"submit-place-search\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#place-search").submit();
		});
		
		$("#place-search").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			var query = $("#place-query").val();
			
			if (query == "") {
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
					textSearch: function (results, status) { //pagination needs to be in this function for the more results experiment to work
						if (status == google.maps.places.PlacesServiceStatus.OK) {
							clearResults(); //remove previous results and markers
							
							var bounds = new google.maps.LatLngBounds();
							//console.log(bounds);
							
							//by default the places api returns 20 result sets (I think it is actually a limit imposed by Google unless you're a business customer)
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
								
								nameList.append("<li data-animate=\"place-name\" data-placename=\"" + place.name + "\">" + 
								
									"<span class=\"placename\">" + place.name + "</span>" +
									
									"<div class=\"options\">" +
										"<div class=\"opt\"><div data-destination=\"" + place.formatted_address + "\" id=\"get-directions\" class=\"directions-button\"></div></div>" +
										"<div class=\"opt\"><div data-placename=\"" + place.name + "\" data-address=\"" + place.formatted_address + "\" id=\"add-favourite\" class=\"add-favourite-button\"></div></div>" +
									"</div></li>");
								
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
										
										/* do some stuff with loops.
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
												
												//put the resuls into the list as items, tap the list for distance or duration
												detailsList.append("<li data-animate=\"place-details\" data-distance=\"" + distance + "\"" + "data-duration=\"" + duration + "\">" + distance + "</li>");
											}
										}
									} else { //catch errors here
										return false;
										console.log(response + status)
									}
								}
								
								map.addMarker({
									lat: place.geometry.location.lat(),
									lng: place.geometry.location.lng(),
									icon: image,
									animation: google.maps.Animation.DROP,
									title: place.name,
									//allow tappable information windows with basic information
									infoWindow: {
										content: "<h2 class=\"iw-heading\">" + place.name + "</h2>" +
													"<p class=\"iw-address\">" + (place.vicinity ? place.vicinity : place.formatted_address) + "</p>"
									}
								});
								bounds.extend(place.geometry.location); //extend the bounds to show all search results on map
							}
							
							//experimenting with getting more results after the initial 20
							/*if (pagination.hasNextPage) {
								//console.log("more results exist");
								$("#loadmore").hammer().on("tap", function(e) {
									e.stopPropagation(); e.preventDefault();
									pagination.nextPage();
								});
							};*/
							
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
			};
			
			//allow user to change between showing distance or estimated time to get there via their chosen travel mode
			detailsList.hammer().on("tap", "li", function(e) {
				e.stopPropagation(); e.preventDefault();
				var change = $(this);
				var dist = $(this).data("distance")
				var dura = $(this).data("duration")
				//if distance is shown, show duration else show distance and vice-versa, we start on distance
				if (change.text() == dist) {
					change.text(dura);
				} else {
					change.text(dist);
				};
			});
			
			//bias the search results towards places that are within the bounds of the current maps viewport
			google.maps.event.addListener(map, "bounds_changed", function() {
				var bounds = map.getBounds();
				$("#place-query").setBounds(bounds);
			});
		});
		
		//function to locate the user and update the currentLocation variable
		function locateUser() {
			if (Modernizr.geolocation) {
				GMaps.geolocate({
					success: function(position) {
						//update current location variable
						var position = {"lat": position.coords.latitude, "lng": position.coords.longitude}; //might have to move to global var
						currentLocation = new google.maps.LatLng(position.lat, position.lng); //could be problematic with distance function, as not the same function
						console.log("locate button, currentLocation: " + currentLocation);
						
						removeMarkers(); //remove markers from the map
						
						if (locationCircle && locationMark) {
							locationCircle.setMap(null);
							locationMark.setMap(null);
						};
						
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
				console.log("This browser/device does not support geolocation");
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
			detailsList.html("");
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
	
	//options for search results
	$(function(doMore) {
		var placeName, placeAddress, directionsTo;
		var directionsOverlay = "<div id=\"directions-box\" class=\"modal-window\">" +
									"<h1 class=\"inner-wrap\" data-transition=\"slide-down-in\">Directions<div id=\"close-directions\" class=\"close-modal\"></div></h1>" +
									"<div id=\"directions-list\"></div>" +
								"</div>"
								
		$(".results-names").hammer().on("swipeleft tap", "li", function(e) {
			e.stopPropagation(); e.preventDefault();
			//placeName = $(this).data("placename");
			$(this).children("span").toggleClass("swiped");
			$(this).children("div").toggleClass("shown"); //options div
		});
		
		//a check needs to be in place to prevent the same place being added twice, here or in php
		$(".results-names").hammer().on("tap", "#add-favourite", function(e) {
			e.stopPropagation(); e.preventDefault();
			placeName = $(this).data("placename");
			placeAddress = $(this).data("address");
			
			$.ajax({
				context: this,
				type: "POST",
				data: {userid: userID, placename: placeName, placeaddress: placeAddress},	
				url: serverURL + "addfavourite.php",
				beforeSend: function() {
					console.log("adding to favourites");
				},
				success: function() {
					$(this).attr("id", "remove-favourite");
					$(this).addClass("remove-favourite-button");
					console.log("added " + placeName + " to favourites");
				},
				error: function() {
					console.log("error: " + this);
				},
			});
			//I can't figure out how get back that if a user has added the place before, to change these depending of what they have added already
			//getting the list of favourites and comparing to the data value didn't work, would be difficult as google regularly make updates to the place pages
		});
		
		//remove a favourite
		$(".results-names").hammer().on("tap", "#remove-favourite", function(e) {
			e.stopPropagation(); e.preventDefault();
			placeName = $(this).data("placename");
			
			$.ajax({
				context: this,
				type: "POST",
				data: {userid: userID, placename: placeName},	
				url: serverURL + "removefavourite.php",
				beforeSend: function() {
					console.log("deleting from favourites");
				},
				success: function() {
					$(this).attr("id", "add-favourite");
					$(this).removeClass("remove-favourite-button");
					console.log("deleted " + placeName + " from favourites");
				},
				error: function() {
					console.log("There was a problem processing your request.");
				},
			});
		});
		
		$(".results-names").hammer().on("tap", "#get-directions", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#home").removeClass("current");
			$("body").prepend(directionsOverlay); //sometimes this doesn't render properly on the display
			
			
			directionsTo = $(this).data("destination");
			var panel = document.getElementById("directions-list");
			var dirServ = new google.maps.DirectionsService();
			var dirDisp = new google.maps.DirectionsRenderer();
			
			dirDisp.setPanel(panel);
			
			dirServ.route({
				origin: currentLocation,
				destination: directionsTo,
				travelMode: travelMode,
				unitSystem: unitSystem
			}, function(result, status) {
				if (status === google.maps.DirectionsStatus.OK)
				dirDisp.setDirections(result);
			});
			
			$("#close-directions").hammer().on("tap", function(e) {
				e.stopPropagation(); e.preventDefault();
				$("#directions-box").remove();
				$("#home").addClass("current");
			});
		});
	});//do more
})();//end map scope


/*Favourited places list page
-----------------------------------------------------------------------------------------*/
$(function(favouritedPlaces) {
	var favouritesList = $(".favourites-list");
	var count = 1;
	var place;
	
	var commentsOverlay = "<div id=\"comments-box\" class=\"modal-window\">" +
						      "<h1 class=\"inner-wrap\" data-transition=\"slide-down-in\">Comments<div id=\"close-comments\" class=\"close-modal\"></div></h1>" +
							  "<div class=\"add-comment\">" +
							      "<form id=\"place-comment\" method=\"post\">" +
							          "<textarea id=\"comment\" name=\"comment\" placeholder=\"Enter a comment\" autocorrect=\"on\" autocapitalize=\"on\" maxlength=\"180\"></textarea>" +
									  "<div id=\"post-comment\" class=\"comments-button inner-wrap\">Post Comment<div class=\"submit-icon\"></div></div>" +
								  "</form>" +
							  "</div>" +
						      "<div id=\"comments-list\" class=\"inner-wrap\"></div>" +
						  "</div>"
						  
	var commentsList = $("#comments-list");
	
	function getFavourites() {
		$.ajax({
			type: "POST",
			data: {userid: userID},
			url: serverURL + "getfavourites.php",
			async: true, //might have to be false
			beforeSend: function() {
				favouritesList.append("<p class=\"message getting\">Getting your favourites...<br><i class=\"fa fa-2x fa-spinner fa-spin\"></i></p>")
			},
			success: function(placenames, status) {
				$(".getting").remove();
				objects = JSON.parse(placenames);
				
				$.each(objects, function(i, place) { 
					//console.log(place);
					favouritesList.append("<li class=\"entry\" data-animate=\"favourite\" data-place=\"" + place + "\"><span class=\"place-count\">" + count + "</span><span class=\"place\">" + place + "</span>" +					
											  "<div class=\"more\">" +
											  	  "<div class=\"p-action\"><div data-place=\"" + place + "\" id=\"comment-place\" class=\"comment-place-button\"></div></div>" +
												  "<div class=\"p-action\"><div data-place=\"" + place + "\" id=\"share-place\" class=\"share-place-button\"></div></div>" +
												  "<div class=\"p-action\"><div data-place=\"" + place + "\" id=\"delete-favourite\" class=\"delete-place-button\"></div></div>" +
											  "</div>" +
										  "</li>");
					count++;
				});
				
				$("#refresh-favourites").removeClass("fa-spin");
			},
			error: function() {
				console.log("oh no"); //make better error
			}
		});
	};
	
	//getFavourites(); //testing
	
	$("#refresh-favourites").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		$(this).addClass("fa-spin");
		console.log("refreshing");
		clearFavs();
		getFavourites();
	});
	
	favouritesList.hammer().on("swipeleft tap", "li", function(e) {
		e.stopPropagation(); e.preventDefault();
		$(this).children("span").toggleClass("swiped");
		$(this).children("div").toggleClass("shown"); //more div
	});
	
	favouritesList.hammer().on("tap", "#comment-place", function(e) {
		e.stopPropagation(); e.preventDefault();
		
		$(".comment-error").remove();
		
		place = $(this).data("place");
		
		$("#favourites").removeClass("current");
		$("body").prepend(commentsOverlay); //sometimes this doesn't render properly on the display
		
		$.ajax({
			type: "POST",
			data: {placename: place},
			url: serverURL + "getcomments.php",
			async: true,
			beforeSend: function() {
				$("#comments-list").append("<p class=\"message getting\">Getting comments...<br><i class=\"fa fa-2x fa-spinner fa-spin\"></i></p>")
			},
			success: function(data, status) {
				$(".getting").remove();
				objects = JSON.parse(data);
				//console.log(objects);
				
				$.each(objects, function(i, item) { 
					$("#comments-list").append("<div data-animate=\"comment\" class=\"comment\"><span class=\"by\">" + item.username + "<span class=\"on\">" + item.date + "</span></span><p>" + item.comment + "</p></div>");
				});
			},
			error: function() {
				$(".getting").remove();
				$("#comments-list").append("<p class=\"warning comment-error\">Sorry, there was an error getting the comments.</p>")
				//console.log(this);
			}
		});
		
		$("#comment").focus(function(e) {
            $("#comments-list").addClass("making-comment");
			$("#comment").blur(function(e) {
				$("#comments-list").removeClass("making-comment");
			});
        });
		
		$("#post-comment").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#place-comment").submit();
		});
		
		$("#place-comment").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			//console.log(userID + userName + place);
			var comment = $("#comment").val();
			
			if (comment == "") {
				$("#comment").focus();
				$("#comment").attr("placeholder", "You didn't enter a comment") && $("#comment").addClass("plc-warning");
				setTimeout(function() {
					$("#comment").attr("placeholder", "Enter a comment") && $("#comment").removeClass("plc-warning");;
				}, 2800);
				return false;
			};
			
			$(".comment-error").remove();
			
			$.ajax({
				context: this,
				type: "POST",
				data: {userid: userID, username: userName, placename: place, comment: comment},	
				url: serverURL + "comment.php",
				async: true,
				beforeSend: function() {
					$("#place-comment").append("<p class=\"message success prominent posting\">Posting comment...<br><i class=\"fa fa-2x fa-spinner fa-spin\"></i></p>");
				},
				success: function() {
					$(".posting").remove();
					$("#place-comment").append("<p class=\"message success prominent timed\">Your comment has been posted.</p>");
					setTimeout(function() {
						$(".timed").remove();
						$("#comments-list").prepend("<div data-animate=\"comment\" class=\"comment\"><p>" + "<span class=\"by\">" + userName + "</span>" + comment + "</p></div>");
						$("#comment").val("");
					}, 3500);
				},
				error: function() {
					$("#place-comment").append("<p class=\"warning comment-error\">Sorry, there was an error getting the comments.</p>")
				}
			});
		});
		
		$("#comments-list").hammer().on("tap", ".comment", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("p", this).toggleClass("expanded");
		});
		
		$("#close-comments").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#comments-box").remove();
			$("#favourites").addClass("current");
		});
	});
	
	favouritesList.hammer().on("tap", "#share-place", function(e) {
		e.stopPropagation(); e.preventDefault();
		place = $(this).data("place");
		window.location.href = "mailto:?subject=Check this place out!&body=Hey, I found this really good place called, " + place + "."; //should open the devices default mail client
	});
	
	favouritesList.hammer().on("tap", "#delete-favourite", function(e) {
		e.stopPropagation(); e.preventDefault();
		place = $(this).data("place");
		$.ajax({
			context: this,
			type: "POST",
			data: {userid: userID, placename: place},	
			url: serverURL + "removefavourite.php",
			beforeSend: function() {
				console.log("deleting from favourites");
			},
			success: function() {
				$(this).parents("div div li.entry").remove(); //remove the list item
				console.log("deleted " + place + " from favourites");
			},
		});
	});
	
	$("[data-get=\"favourites\"]").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		clearFavs();
		getFavourites();
	});
	
	function clearFavs() {
		favouritesList.html("");
		count = 1;
	};
});


/*Offers and redemption
-----------------------------------------------------------------------------------------*/
$(function(offersFeatures) {
	
	function getOffers() {
		return $.ajax({
			url: serverURL + "getoffers.php",
			async: true, //might have to be false
			beforeSend: function() {
				console.log("getting offers");
				$(".offer-roll").append("<p class=\"message getting\">Getting offers...<br><i class=\"fa fa-2x fa-spinner fa-spin\"></i></p>");
			},
			success: function() {
				$(".getting").remove();
			},
			error: function() {
				$("#place-comment").append("<p class=\"warning comment-error\">Sorry, there was an error getting the comments.</p>")
				console.log("failed to get offers");
			},
		});
	};

	function handleData(data) {
		objects = JSON.parse(data);
		//console.log(objects);
		$.each(objects, function(i, item) {
			offerCount++;
			
			if (offerCount > 99) {
				offerCount = 99;
			} else if (offerCount < 0 || offerCount == 0) {
				offerCount = 0;
			};
			
			console.log(item);
		});	
		$("#offer-count").html(offerCount); //update count in nav
	};
	
	getOffers().done(handleData);
	
	//---
	
	/*(function worker() {
		$.ajax({
			url: 'ajax/test.html', 
			success: function(data) {
				$('.result').html(data);
			},
			complete: function() {
				setTimeout(worker, 5000); //schedule the next request when the current one's complete
			}
		});
	})();*/
	
	
	//---
	/*SlidesJS 3.0.4 http://slidesjs.com*/
	/*(function(){(function(e,t,n){var r,i,s;s="slidesjs";i={width:940,height:528,start:1,navigation:{active:false,effect:"slide"},pagination:{active:false,effect:"slide"},play:{active:!1,effect:"slide",interval:5e3,auto:!1,swap:!0,pauseOnHover:!1,restartDelay:2500},effect:{slide:{speed:500},fade:{speed:300,crossfade:!0}},callback:{loaded:function(){},start:function(){},complete:function(){}}};r=function(){function t(t,n){this.element=t;this.options=e.extend(!0,{},i,n);this._defaults=i;this._name=s;this.init()}return t}();r.prototype.init=function(){var n,r,i,s,o,u,a=this;n=e(this.element);this.data=e.data(this);e.data(this,"animating",!1);e.data(this,"total",n.children().not(".slidesjs-navigation",n).length);e.data(this,"current",this.options.start-1);e.data(this,"vendorPrefix",this._getVendorPrefix());if(typeof TouchEvent!="undefined"){e.data(this,"touch",!0);this.options.effect.slide.speed=this.options.effect.slide.speed/2}n.css({overflow:"hidden"});n.slidesContainer=n.children().not(".slidesjs-navigation",n).wrapAll("<div class='slidesjs-container'>",n).parent().css({overflow:"hidden",position:"relative"});e(".slidesjs-container",n).wrapInner("<div class='slidesjs-control'>",n).children();e(".slidesjs-control",n).css({position:"relative",left:0});e(".slidesjs-control",n).children().addClass("slidesjs-slide").css({position:"absolute",top:0,left:0,width:"100%",zIndex:0,display:"none",webkitBackfaceVisibility:"hidden"});e.each(e(".slidesjs-control",n).children(),function(t){var n;n=e(this);return n.attr("slidesjs-index",t)});if(this.data.touch){e(".slidesjs-control",n).on("touchstart",function(e){return a._touchstart(e)});e(".slidesjs-control",n).on("touchmove",function(e){return a._touchmove(e)});e(".slidesjs-control",n).on("touchend",function(e){return a._touchend(e)})}n.fadeIn(0);this.update();this.data.touch&&this._setuptouch();e(".slidesjs-control",n).children(":eq("+this.data.current+")").eq(0).fadeIn(0,function(){return e(this).css({zIndex:10})});if(this.options.navigation.active){o=e("<a>",{"class":"slidesjs-previous slidesjs-navigation",href:"#",title:"Previous",text:"Previous"}).appendTo(n);r=e("<a>",{"class":"slidesjs-next slidesjs-navigation",href:"#",title:"Next",text:"Next"}).appendTo(n)}e(".slidesjs-next",n).click(function(e){e.preventDefault();a.stop(!0);return a.next(a.options.navigation.effect)});e(".slidesjs-previous",n).click(function(e){e.preventDefault();a.stop(!0);return a.previous(a.options.navigation.effect)});if(this.options.play.active){s=e("<a>",{"class":"slidesjs-play slidesjs-navigation",href:"#",title:"Play",text:"Play"}).appendTo(n);u=e("<a>",{"class":"slidesjs-stop slidesjs-navigation",href:"#",title:"Stop",text:"Stop"}).appendTo(n);s.click(function(e){e.preventDefault();return a.play(!0)});u.click(function(e){e.preventDefault();return a.stop(!0)});this.options.play.swap&&u.css({display:"none"})}if(this.options.pagination.active){i=e("<ul>",{"class":"slidesjs-pagination"}).appendTo(n);e.each(new Array(this.data.total),function(t){var n,r;n=e("<li>",{"class":"slidesjs-pagination-item"}).appendTo(i);r=e("<a>",{href:"#","data-slidesjs-item":t,html:t+1}).appendTo(n);return r.click(function(t){t.preventDefault();a.stop(!0);return a.goto(e(t.currentTarget).attr("data-slidesjs-item")*1+1)})})}e(t).bind("resize",function(){return a.update()});this._setActive();this.options.play.auto&&this.play();return this.options.callback.loaded(this.options.start)};r.prototype._setActive=function(t){var n,r;n=e(this.element);this.data=e.data(this);r=t>-1?t:this.data.current;e(".active",n).removeClass("active");return e(".slidesjs-pagination li:eq("+r+") a",n).addClass("active")};r.prototype.update=function(){var t,n,r;t=e(this.element);this.data=e.data(this);e(".slidesjs-control",t).children(":not(:eq("+this.data.current+"))").css({display:"none",left:0,zIndex:0});r=t.width();n=this.options.height/this.options.width*r;this.options.width=r;this.options.height=n;return e(".slidesjs-control, .slidesjs-container",t).css({width:r,height:n})};r.prototype.next=function(t){var n;n=e(this.element);this.data=e.data(this);e.data(this,"direction","next");t===void 0&&(t=this.options.navigation.effect);return t==="fade"?this._fade():this._slide()};r.prototype.previous=function(t){var n;n=e(this.element);this.data=e.data(this);e.data(this,"direction","previous");t===void 0&&(t=this.options.navigation.effect);return t==="fade"?this._fade():this._slide()};r.prototype.goto=function(t){var n,r;n=e(this.element);this.data=e.data(this);r===void 0&&(r=this.options.pagination.effect);t>this.data.total?t=this.data.total:t<1&&(t=1);if(typeof t=="number")return r==="fade"?this._fade(t):this._slide(t);if(typeof t=="string"){if(t==="first")return r==="fade"?this._fade(0):this._slide(0);if(t==="last")return r==="fade"?this._fade(this.data.total):this._slide(this.data.total)}};r.prototype._setuptouch=function(){var t,n,r,i;t=e(this.element);this.data=e.data(this);i=e(".slidesjs-control",t);n=this.data.current+1;r=this.data.current-1;r<0&&(r=this.data.total-1);n>this.data.total-1&&(n=0);i.children(":eq("+n+")").css({display:"block",left:this.options.width});return i.children(":eq("+r+")").css({display:"block",left:-this.options.width})};r.prototype._touchstart=function(t){var n,r;n=e(this.element);this.data=e.data(this);r=t.originalEvent.touches[0];this._setuptouch();e.data(this,"touchtimer",Number(new Date));e.data(this,"touchstartx",r.pageX);e.data(this,"touchstarty",r.pageY);return t.stopPropagation()};r.prototype._touchend=function(t){var n,r,i,s,o,u,a,f=this;n=e(this.element);this.data=e.data(this);u=t.originalEvent.touches[0];s=e(".slidesjs-control",n);if(s.position().left>this.options.width*.5||s.position().left>this.options.width*.1&&Number(new Date)-this.data.touchtimer<250){e.data(this,"direction","previous");this._slide()}else if(s.position().left<-(this.options.width*.5)||s.position().left<-(this.options.width*.1)&&Number(new Date)-this.data.touchtimer<250){e.data(this,"direction","next");this._slide()}else{i=this.data.vendorPrefix;a=i+"Transform";r=i+"TransitionDuration";o=i+"TransitionTimingFunction";s[0].style[a]="translateX(0px)";s[0].style[r]=this.options.effect.slide.speed*.85+"ms"}s.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd",function(){i=f.data.vendorPrefix;a=i+"Transform";r=i+"TransitionDuration";o=i+"TransitionTimingFunction";s[0].style[a]="";s[0].style[r]="";return s[0].style[o]=""});return t.stopPropagation()};r.prototype._touchmove=function(t){var n,r,i,s,o;n=e(this.element);this.data=e.data(this);s=t.originalEvent.touches[0];r=this.data.vendorPrefix;i=e(".slidesjs-control",n);o=r+"Transform";e.data(this,"scrolling",Math.abs(s.pageX-this.data.touchstartx)<Math.abs(s.pageY-this.data.touchstarty));if(!this.data.animating&&!this.data.scrolling){t.preventDefault();this._setuptouch();i[0].style[o]="translateX("+(s.pageX-this.data.touchstartx)+"px)"}return t.stopPropagation()};r.prototype.play=function(t){var n,r,i,s=this;n=e(this.element);this.data=e.data(this);if(!this.data.playInterval){if(t){r=this.data.current;this.data.direction="next";this.options.play.effect==="fade"?this._fade():this._slide()}e.data(this,"playInterval",setInterval(function(){r=s.data.current;s.data.direction="next";return s.options.play.effect==="fade"?s._fade():s._slide()},this.options.play.interval));i=e(".slidesjs-container",n);if(this.options.play.pauseOnHover){i.unbind();i.bind("mouseenter",function(){return s.stop()});i.bind("mouseleave",function(){return s.options.play.restartDelay?e.data(s,"restartDelay",setTimeout(function(){return s.play(!0)},s.options.play.restartDelay)):s.play()})}e.data(this,"playing",!0);e(".slidesjs-play",n).addClass("slidesjs-playing");if(this.options.play.swap){e(".slidesjs-play",n).hide();return e(".slidesjs-stop",n).show()}}};r.prototype.stop=function(t){var n;n=e(this.element);this.data=e.data(this);clearInterval(this.data.playInterval);this.options.play.pauseOnHover&&t&&e(".slidesjs-container",n).unbind();e.data(this,"playInterval",null);e.data(this,"playing",!1);e(".slidesjs-play",n).removeClass("slidesjs-playing");if(this.options.play.swap){e(".slidesjs-stop",n).hide();return e(".slidesjs-play",n).show()}};r.prototype._slide=function(t){var n,r,i,s,o,u,a,f,l,c,h=this;n=e(this.element);this.data=e.data(this);if(!this.data.animating&&t!==this.data.current+1){e.data(this,"animating",!0);r=this.data.current;if(t>-1){t-=1;c=t>r?1:-1;i=t>r?-this.options.width:this.options.width;o=t}else{c=this.data.direction==="next"?1:-1;i=this.data.direction==="next"?-this.options.width:this.options.width;o=r+c}o===-1&&(o=this.data.total-1);o===this.data.total&&(o=0);this._setActive(o);a=e(".slidesjs-control",n);t>-1&&a.children(":not(:eq("+r+"))").css({display:"none",left:0,zIndex:0});a.children(":eq("+o+")").css({display:"block",left:c*this.options.width,zIndex:10});this.options.callback.start(r+1);if(this.data.vendorPrefix){u=this.data.vendorPrefix;l=u+"Transform";s=u+"TransitionDuration";f=u+"TransitionTimingFunction";a[0].style[l]="translateX("+i+"px)";a[0].style[s]=this.options.effect.slide.speed+"ms";return a.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd",function(){a[0].style[l]="";a[0].style[s]="";a.children(":eq("+o+")").css({left:0});a.children(":eq("+r+")").css({display:"none",left:0,zIndex:0});e.data(h,"current",o);e.data(h,"animating",!1);a.unbind("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd");a.children(":not(:eq("+o+"))").css({display:"none",left:0,zIndex:0});h.data.touch&&h._setuptouch();return h.options.callback.complete(o+1)})}return a.stop().animate({left:i},this.options.effect.slide.speed,function(){a.css({left:0});a.children(":eq("+o+")").css({left:0});return a.children(":eq("+r+")").css({display:"none",left:0,zIndex:0},e.data(h,"current",o),e.data(h,"animating",!1),h.options.callback.complete(o+1))})}};r.prototype._fade=function(t){var n,r,i,s,o,u=this;n=e(this.element);this.data=e.data(this);if(!this.data.animating&&t!==this.data.current+1){e.data(this,"animating",!0);r=this.data.current;if(t){t-=1;o=t>r?1:-1;i=t}else{o=this.data.direction==="next"?1:-1;i=r+o}i===-1&&(i=this.data.total-1);i===this.data.total&&(i=0);this._setActive(i);s=e(".slidesjs-control",n);s.children(":eq("+i+")").css({display:"none",left:0,zIndex:10});this.options.callback.start(r+1);if(this.options.effect.fade.crossfade){s.children(":eq("+this.data.current+")").stop().fadeOut(this.options.effect.fade.speed);return s.children(":eq("+i+")").stop().fadeIn(this.options.effect.fade.speed,function(){s.children(":eq("+i+")").css({zIndex:0});e.data(u,"animating",!1);e.data(u,"current",i);return u.options.callback.complete(i+1)})}return s.children(":eq("+r+")").stop().fadeOut(this.options.effect.fade.speed,function(){s.children(":eq("+i+")").stop().fadeIn(u.options.effect.fade.speed,function(){return s.children(":eq("+i+")").css({zIndex:10})});e.data(u,"animating",!1);e.data(u,"current",i);return u.options.callback.complete(i+1)})}};r.prototype._getVendorPrefix=function(){var e,t,r,i,s;e=n.body||n.documentElement;r=e.style;i="transition";s=["Moz","Webkit","Khtml","O","ms"];i=i.charAt(0).toUpperCase()+i.substr(1);t=0;while(t<s.length){if(typeof r[s[t]+i]=="string")return s[t];t++}return!1};return e.fn[s]=function(t){return this.each(function(){if(!e.data(this,"plugin_"+s))return e.data(this,"plugin_"+s,new r(this,t))})}})(jQuery,window,document)}).call(this);
	
	$(function() {
    	$("#roller").slidesjs({
      		width: 940,
      		height: 528
    	});
    });*/
	
	/*Excolo Slider*/
	;(function(d,c,a,e){var b;b=(function(){function f(h,g){this.elem=h;this.$elem=d(h);this.options=g;this.metadata=this.$elem.data("plugin-options")}return f})();b.prototype={defaults:{width:800,height:530,autoSize:true,touchNav:true,mouseNav:true,prevnextNav:true,prevnextAutoHide:true,pagerNav:true,startSlide:1,autoPlay:true,delay:0,interval:3000,repeat:true,playReverse:false,hoverPause:true,captionAutoHide:false,animationCssTransitions:true,animationDuration:500,animationTimingFunction:"linear",prevButtonClass:"slide-prev",nextButtonClass:"slide-next",prevButtonImage:"Images/prev.png",nextButtonImage:"Images/next.png",activeSlideClass:"es-active",slideCaptionClass:"es-caption",pagerClass:"es-pager",pagerImage:"Images/pagericon.png"},init:function(){var f,m,h,i,g,k,o,j,l,n;f=this;f.config=d.extend({},f.defaults,f.options,f.metadata);f.data=d.data(f);d.data(f,"currentSlide",f.config.playReverse&&f.config.startSlide==1?f.$elem.children().length-1:f.config.startSlide-1);d.data(f,"nextSlide",f.data.currentSlide);d.data(f,"totalslides",f.$elem.children().length);d.data(f,"browserEnginePrefix",f._getBrowserEnginePrefix());d.data(f,"isPlaying",false);d.data(f,"isAnimating",false);d.data(f,"playPaused",false);d.data(f,"justTouched",false);d.data(f,"isMoving",false);d.data(f,"width",f.config.width);f.$elem.addClass("slider");f.$elem.css({position:"relative"});f.$elem.wrapInner("<div class='slide-wrapper'>",f.$elem).children();f.$elem.wrapInner("<div class='slide-container'>",d(".slide-wrapper",f.$elem)).children();f.$elem.wrapInner("<div class='slide-dragcontainer'>",d(".slide-container",f.$elem)).children();d(".slide-container",f.$elem).css({position:"relative"});n=d(".slide-dragcontainer",f.$elem);j=d(".slide-wrapper",f.$elem);l=j.children();if(f.config.prevnextNav){j.after("<div class='"+f.config.nextButtonClass+"'>");j.after("<div class='"+f.config.prevButtonClass+"'>");i=d("."+f.config.nextButtonClass,f.$elem);h=d("."+f.config.prevButtonClass,f.$elem);i.append("<img src='"+f.config.nextButtonImage+"'>");h.append("<img src='"+f.config.prevButtonImage+"'>");g=i.add(h);if(f.config.prevnextAutoHide){g.hide();f.$elem.hover(function(){g.fadeIn("fast")},function(){g.fadeOut("fast")})}h.on("click",function(p){f.previous()});i.on("click",function(p){f.next()})}if(f.config.pagerNav){f.$elem.append("<ul class='"+f.config.pagerClass+"'>");l.each(function(){d("<li />").appendTo(d("."+f.config.pagerClass,f.$elem)).attr("rel",d(this).index()).css({"background-image":"url('"+f.config.pagerImage+"')"}).on("click",function(){d.data(f,"nextSlide",parseInt(d(this).attr("rel")));f._prepareslides(true);f._slide(true);f._manualInterference()})})}l.each(function(){k=d(this);o=k.data("plugin-slide-caption");if(o===e){return}if(this.tagName=="IMG"){k.wrap("<div>");k.after("<div class='"+f.config.slideCaptionClass+"'>");k.next().append(o)}else{k.append("<div class='"+f.config.slideCaptionClass+"'>");k.children().last().append(o)}if(f.config.captionAutoHide){d("."+f.config.slideCaptionClass,f.$elem).hide();f.$elem.hover(function(){d("."+f.config.slideCaptionClass,f.$elem).fadeIn("fast")},function(){d("."+f.config.slideCaptionClass,f.$elem).fadeOut("fast")})}});j.children().addClass("slide").css({position:"absolute",top:0,left:0,width:f.data.width,height:f.config.height,zIndex:0,display:"none",webkitBackfaceVisibility:"hidden"});m=l.height();j.css({position:"relative",left:0,height:m});d(".slide-container",f.$elem).css({width:f.data.width,overflow:"hidden",height:m});if(f.config.touchNav){n.on("touchstart",function(q){var p=q.originalEvent.touches[0];q.preventDefault();f._onMoveStart(p.pageX,p.pageY);return q.stopPropagation()});n.on("touchmove",function(q){var p=q.originalEvent.touches[0];q.preventDefault();f._onMove(p.pageX,p.pageY);return q.stopPropagation()});n.on("touchend",function(p){p.preventDefault();f._onMoveEnd();return p.stopPropagation()})}if(f.config.mouseNav){n.css("cursor","pointer");n.on("dragstart",function(p){return false});n.on("mousedown",function(p){f._onMoveStart(p.clientX,p.clientY);d(c).attr("unselectable","on").on("selectstart",false).css("user-select","none").css("UserSelect","none").css("MozUserSelect","none");return p.stopPropagation()});d(c).on("mousemove",function(p){f._onMove(p.clientX,p.clientY);return p.stopPropagation()});d(c).on("mouseup",function(p){f._onMoveEnd();d(c).removeAttr("unselectable").unbind("selectstart").css("user-select",null).css("UserSelect",null).css("MozUserSelect",null);return p.stopPropagation()})}if(f.config.autoSize){setTimeout(function(){f._resize()},50);d(c).resize(function(){return setTimeout(function(){f._resize()},50)})}f._prepareslides();f.gotoSlide(f.data.currentSlide);if(f.config.autoPlay){setTimeout(function(){f.start()},f.config.delay)}return this},previous:function(){var f,g;f=this;d.data(f,"slideDirection","previous");g=(f.data.nextSlide-1)%f.data.totalslides;if(!f.config.repeat&&(f.data.nextSlide-1)<0){if(f.config.playReverse){d.data(f,"playPaused",true);f.stop()}return}else{if(f.data.playPaused&&(f.data.nextSlide-1)>0){d.data(f,"playPaused",false);f.start()}}d.data(f,"nextSlide",g);return this._slide()},next:function(){var f,g;f=this;d.data(f,"slideDirection","next");g=(f.data.nextSlide+1)%f.data.totalslides;if(!f.config.repeat&&(f.data.nextSlide+1)>(f.data.totalslides-1)){if(!f.config.playReverse){d.data(f,"playPaused",true);f.stop()}return}else{if(f.data.playPaused&&(f.data.nextSlide+1)<(f.data.totalslides-1)){d.data(f,"playPaused",false);f.start()}}d.data(f,"nextSlide",g);return this._slide()},start:function(){var g,f,h;g=this;f=d(".slide-container",g.$elem);if(g.data.isPlaying&&g.data.playTimer){clearInterval(g.data.playTimer)}h=setInterval((function(){if(g.config.playReverse){g.previous()}else{g.next()}}),g.config.interval);d.data(g,"playTimer",h);if(g.config.hoverPause){f.unbind();f.hover(function(){d.data(g,"playPaused",true);return g.stop()},function(){d.data(g,"playPaused",false);return g.start()})}d.data(g,"isPlaying",true)},stop:function(){var g,f;g=this;f=d(".slide-container",g.$elem);clearInterval(g.data.playTimer);d.data(g,"playTimer",null);if(g.config.hoverPause&&!g.data.playPaused){f.unbind()}d.data(g,"isPlaying",false)},gotoSlide:function(k){var h,g,l,j,i,f;h=this;d.data(h,"nextSlide",(k)%h.data.totalslides);g=(k)%h.data.totalslides;d.data(h,"currentSlide",g);l=d(".slide-wrapper",h.$elem);j=l.children();i=l.children(":eq("+g+")");f=i.position().left;h._setActive(j,i);if(h.config.animationCssTransitions&&h.data.browserEnginePrefix){h._transition((-f),0)}else{l.position().left=-f}h._alignSlides(f)},_manualInterference:function(){var f=this;if(f.data.isPlaying){f.stop();f.start()}},_prepareslides:function(f){var k,m,l,h,j,g;k=this;m=d(".slide-wrapper",k.$elem);l=m.children();h=k.data.width;j=Math.floor(k.data.totalslides/2);g=0;l.each(function(){d(this).css({display:"block",left:h*g,zIndex:10});g++;if(!f&&k.config.repeat&&g>j){g=k.data.totalslides%2?-j:-(j-1)}})},_onMoveStart:function(f,h){var g=this;if(!g.data.isMoving){d.data(g,"touchTime",Number(new Date()))}d.data(g,"touchedX",f);d.data(g,"touchedY",h);d.data(g,"isMoving",true);if(g.data.isPlaying){d.data(g,"playPaused",true);g.stop()}},_onMove:function(m,l){var f,n,j,i,k,g,h;f=this;if(!f.data.isMoving){return}n=d(".slide-wrapper",f.$elem);d.data(f,"scrolling",Math.abs(m-f.data.touchedX)<Math.abs(l-f.data.touchedY));if(!f.data.scrolling&&!f.data.isAnimating){j=n.children(":eq("+f.data.nextSlide+")");i=j.position().left;k=f.data.browserEnginePrefix.css;g=m-f.data.touchedX;h=f.data.width*0.1;if(!f.config.repeat){if(f.data.currentSlide<=0&&-g<-h){g=h}else{if(f.data.currentSlide>=(f.data.totalslides-1)&&-g>h){g=-h}}}f._transition(-i+g,0)}},_onMoveEnd:function(){var j,l,k,g,i,f,h;j=this;if(!j.data.isMoving){return}l=d(".slide-wrapper",j.$elem);d.data(j,"justTouched",true);k=l.children(":eq("+j.data.nextSlide+")");g=k.position().left;i=j.data.width*0.5;f=j.data.width*0.1;h=(Number(new Date())-j.data.touchTime<250);if(!j.config.repeat&&(l.position().left<-(g)&&j.data.currentSlide>=(j.data.totalslides-1)||l.position().left>(-g)&&j.data.currentSlide<=0)){j._transition((-g),0.15)}else{if(l.position().left>(-g+i)||(l.position().left>(-g+f)&&h)){this.previous()}else{if(l.position().left<-(g+i)||(l.position().left<-(g+f)&&h)){this.next()}else{j._transition((-g),0.15)}}}j._alignSlides(g);d.data(j,"isMoving",false);d.data(j,"justTouched",false);if(j.data.playPaused){j.start()}},_alignSlides:function(p){var g,q,o,m,r,h,f,j,l,k,n;g=this;if(!g.config.repeat){return}q=d(".slide-wrapper",g.$elem);o=q.children();if(p===e){m=q.children(":eq("+g.data.nextSlide+")");p=m.position().left}p=Math.round(p,0);r=Math.ceil(g.data.totalslides/2);h=g.data.width;f=0;o.each(function(){var i=d(this).position().left;if(i>p-h){f++}});j=r-f;if(j<0){j=g.data.totalslides%2==0?j+1:j}for(l=0;l<Math.abs(j);l++){k=[].reduce.call(o,function(i,s){return d(i).offset().left<d(s).offset().left?i:s});n=[].reduce.call(o,function(i,s){return d(i).offset().left>d(s).offset().left?i:s});if(j>0){d(k).css("left",Math.round(d(n).position().left+h))}else{d(n).css("left",Math.round(d(k).position().left-h))}}},_slide:function(f){var i,h,l,k,j,g;i=this;h=i.data.nextSlide;l=d(".slide-wrapper",i.$elem);k=l.children();j=l.children(":eq("+h+")");g=Math.round(j.position().left);i._setActive(k,j);if(!f){i._alignSlides(g)}d.data(i,"isAnimating",true);if(i.config.animationCssTransitions&&i.data.browserEnginePrefix){i._transition((-g),(i.data.justTouched?0.5:1));l.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd",function(){d.data(i,"currentSlide",h);l.unbind("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd");if(f){i._alignSlides(g)}})}else{l.stop().animate({left:-g},i.config.animationDuration,function(){d.data(i,"currentSlide",h);d.data(i,"isAnimating",false);d.data(i,"justTouched",false)})}},_transition:function(g,i){var k,m,j,f,l,h;k=this;m=d(".slide-wrapper",k.$elem);if(i===e||i<0){i=1}j=k.data.browserEnginePrefix.css;f=j+"Transform";l=j+"TransitionDuration";h=j+"TransitionTimingFunction";m[0].style[l]=(k.config.animationDuration*i)+"ms";m[0].style[h]=k.config.animationTimingFunction;m[0].style[f]="translateX("+g+"px)";m.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd",function(){d.data(k,"isAnimating",false);d.data(k,"justTouched",false);m.unbind("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd")})},_setActive:function(j,i){var h=this,g,f;g=h.config.activeSlideClass;j.removeClass(g);i.addClass(g);if(h.config.pagerNav){f=d("."+h.config.pagerClass,h.$elem);f.children().removeClass("act");f.find("[rel="+i.index()+"]").addClass("act")}},_resize:function(){var j,f,h,g,i;j=this;if(j.data.isPlaying){d.data(j,"playPaused",true);j.stop()}f=j.$elem.width();h=j.config.height/j.config.width;g=f*h;d.data(j,"width",f);d(".slide",j.$elem).css({width:f,height:g});i=d(".slide-wrapper",j.$elem).children().height();d(".slide-wrapper",j.$elem).css({height:i});d(".slide-container",j.$elem).css({width:f,height:i});if(j.data.playPaused){d.data(j,"playPaused",false);j.start()}j._prepareslides();j.gotoSlide(j.data.currentSlide)},_getBrowserEnginePrefix:function(){var g,h,f;g="Transition";h=["Moz","Webkit","Khtml","O","ms"];f=0;while(f<h.length){if(typeof a.body.style[h[f]+g]==="string"){return{css:h[f]}}f++}return false}};b.defaults=b.prototype.defaults;d.fn.excoloSlider=function(f){return this.each(function(){new b(this,f).init()})}})(jQuery,window,document);
	
	$(function () {
		$("#roller").excoloSlider({
			width: 800,
			height: 400,
			autoSize: true,
			touchNav: true,
			mouseNav: true,
			prevnextNav: false,
			prevnextAutoHide: false,
			pagerNav: false,
			startSlide: 1,
			autoPlay: false,
			delay: 0,
			interval: 3000,
			repeat: false,
			playReverse: false,
			hoverPause: true,
			captionAutoHide: false,
			animationCssTransitions: true,
			animationDuration: 650,
			animationTimingFunction: "linear",
			activeSlideClass: "offer-active",
		});
	});
	
	
});


/*Settings and options functionality
-----------------------------------------------------------------------------------------*/
$(function(appSettings) {
	$(".show-settings").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		var show = $(this).data("show");
		$("#" + show).toggleClass("settings-shown");
		$("i", this).toggleClass("fa-flip-vertical");
	});
	
	//we need to get the settings again here, as earlier we made them into int from the stored strings
	$(function(searchSettings) {
		store.getItem("searchSettings").then(function(value) {
			//console.log(value);
			$("#search-radius").val(value[0].searchRadius);
			$("#travel-mode option[value=\"" + value[1].travelMode + "\"]").attr("selected", "selected");
			$("#unit-system option[value=\"" + value[2].unitSystem + "\"]").attr("selected", "selected");
		});
		
		$("[data-action=\"save-settings\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#search-settings").submit();
		});
		
		$("#search-settings").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			
			searchRadius = $("#search-radius").val(),
			travelMode   = $("#travel-mode").val(),
			unitSystem   = $("#unit-system").val()
				
			var searchSettings = [{searchRadius: searchRadius}, {travelMode: travelMode}, {unitSystem: unitSystem}];
			
			store.setItem("searchSettings", searchSettings).then(function(value) {
				$("#search-settings").append("<p class=\"message success prominent timed\">Settings have been saved.</p>");
				setTimeout(function() {
					$(".timed").remove();
					getSettings();
				}, 3500);
			});
		});
	});
	
	//sign in via google - not fully working, it throws up at then end when getting the auth token
	//the code should get the token from the url in the inappbrowser window (I don't know why it won't work)
	//you can console.log and get the code before it chucks up the error so I can't see why the code from the
	//url in the inappbrowser window isn't being retrieved.
	$(function(googleSignin) {
		var googleAPI = {
			setToken: function(data) {
				localStorage.access_token = data.access_token; //cache token
				localStorage.refresh_token = data.refresh_token || localStorage.refresh_token; //cache the refresh token, if there is one
				var expiresAt = new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000; //figure out when the token will expire by using the current time, plus the valid time, minus a 1min buffer
				localStorage.expires_at = expiresAt;
			},
			authorize: function(options) {
				var deferred = $.Deferred();
		
				//build the OAuth consent page URL
				var authUrl = "https://accounts.google.com/o/oauth2/auth?" + $.param({
					client_id: options.client_id,
					redirect_uri: options.redirect_uri,
					response_type: "code",
					scope: options.scope
				});
		
				//open the OAuth consent page in the InAppBrowser
				var authWindow = window.open(authUrl, "_blank", "location=no,toolbar=no"); //use inappbrowser for auth
		
				//should actually use the redirect_uri "urn:ietf:wg:oauth:2.0:oob" which sets the authorization code in the title
				//you can't access the title of the InAppBrowser, so I'm passing a bogus redirect_uri of "http://localhost", which means the
				//authorization code will get set in the url (which I can access), find the authorization code and close the InAppBrowser after the user has granted us access to their data
				authWindow.addEventListener("loadstart", googleCallback);
				function googleCallback(e){
					var url = (typeof e.url !== "undefined" ? e.url : e.originalEvent.url);
					var code = /\?code=(.+)$/.exec(url);
					var error = /\?error=(.+)$/.exec(url);
		
					if (code || error) {
						authWindow.close(); //always close the browser when match is found
					}
		
					if (code) {
						//exchange the authorization code for an access token
						$.post("https://accounts.google.com/o/oauth2/token", {
							code: code[1],
							client_id: options.client_id,
							client_secret: options.client_secret,
							redirect_uri: options.redirect_uri,
							grant_type: "authorization_code"
						}).done(function(data) {
							googleapi.setToken(data);
							deferred.resolve(data);
						}).fail(function(response) {
							deferred.reject(response.responseJSON);
						});
					} else if (error) {
						//the user denied access to the app
						deferred.reject({
							error: error[1]
						});
					}
				}
				return deferred.promise();
			},
			getToken: function(options) {
				var deferred = $.Deferred();
		
				if (new Date().getTime() < localStorage.expires_at) {
					deferred.resolve({
						access_token: localStorage.access_token
					});
				} else if (localStorage.refresh_token) {
					$.post("https://accounts.google.com/o/oauth2/token", {
						refresh_token: localStorage.refresh_token,
						client_id: options.client_id,
						client_secret: options.client_secret,
						grant_type: "refresh_token"
					}).done(function(data) {
						googleapi.setToken(data);
						deferred.resolve(data);
					}).fail(function(response) {
						deferred.reject(response.responseJSON);
					});
				} else {
					deferred.reject();
				}
		
				return deferred.promise();
			},
			userInfo: function(options) {
				return $.getJSON("https://www.googleapis.com/oauth2/v1/userinfo", options);
			}
		};
		
		var signIn = {
			client_id: "576726549275.apps.googleusercontent.com",
			client_secret: "7cELIkyAkF1a5ve-Z_6YoAhX",
			redirect_uri: "http://localhost",
			scope: "https://www.googleapis.com/auth/userinfo.profile", //what we want/need access to (we basically need name and email, maybe gender and age)
		
			init: function() {
				$("[data-action=\"google-signin\"]").hammer().on("tap", function(e) {
					signIn.LoginButton();
				});

				
				//check if a valid token exists or get new
				googleAPI.getToken({
					client_id: app.client_id,
					client_secret: app.client_secret
				}).done(function() {
					signIn.showSuccessView(); //show the greet view if we get a valid token
				}).fail(function() {
					signIn.showLoginView(); //show the login view if we have no valid token
				});
			},
			
			showLoginView: function() {
				$("#google-login").show();
				$("#google-login-success").hide();
			},
			
			showSuccessView: function() {
				$("#google-login").hide();
				$("#google-login-success").show();
		
				//get the token, either from the cache or by using the refresh token
				googleAPI.getToken({
					client_id: signIn.client_id,
					client_secret: signIn.client_secret
				}).then(function(data) {
					return googleapi.userInfo({ access_token: data.access_token }); //returns the promise
				}).done(function(user) {
					$("#google-login-success p").html(user.name + " via Google"); //display message
				}).fail(function() {
					app.showLoginView(); //promise not fulfilled
				});
			},
			
			LoginButton: function() {
				googleAPI.authorize({
					client_id: signIn.client_id,
					client_secret: signIn.client_secret,
					redirect_uri: signIn.redirect_uri,
					scope: signIn.scope
				}).done(function() {
					signIn.showSuccessView();
				}).fail(function(data) {
					$("#google-login p").html(data.error);
				});
			}
		};
		signIn.init(); //put in device ready
	});//end google signin
	
	$(function(userAccount) {
		store.getItem("userAccount").then(function(value) {
			$("#username").val(value[0].userName);
			$("#useremail").val(value[1].userEmail);
			$("#userpassword").val(value[2].userPassword);
		});
		
		$("[data-action=\"save-account\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#user-account").submit();
		});
		
		$("#user-account").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			
			userName 	 = $("#username").val()
			userEmail	 = $("#useremail").val()
			userPassword = $("#userpassword").val()
			
			var userAccount = [{userName: userName}, {userEmail: userEmail}, {userPassword: userPassword}]; //password needs encyrpting
			var userRegistration = $(this).serialize(); //used for db
			
			//check for spaces = userName.indexOf(" ") != -1) || userName.indexOf(" ") != -1 || userName.indexOf("-") != -1
			if (userName == "" || userEmail == "" || userPassword == "") {
				$("#user-account").append("<p class=\"message warning prominent timed\">All fields are required.</p>");
				setTimeout(function() {
					$(".timed").remove();
				}, 3500);
				return false;
			} else if (userName.match(/[_\W0-9]/)) { //we could use indexOf() but since we are checking for many characters we just use a quick regular expression
				$("#user-account").append("<p class=\"message warning prominent timed\">Please only use alphabetical characters in your username, no spaces or special characters.</p>");
				setTimeout(function() {
					$(".timed").remove();
				}, 3500);
				return false;
			} else if (userID != 0) { //if the userID is set (from the database) then they have already made an account
				console.log("creation failed");
				$("#user-account").append("<p class=\"message warning prominent timed\">You have already made an account.</p>");
				setTimeout(function() {
					$(".timed").remove();
				}, 3500);
				return false;
			} else {
				store.setItem("userAccount", userAccount).then(function(value) { //we do everything in a promise, because if the promise is met, everything is OK
					//get the username and store ready for getting the id
					store.getItem("userAccount").then(function(value) {
						name = value[0].userName;
						console.log("name from store: " + name);
					});
					
					$.ajax({
						type: "POST",
						data: userRegistration,		
						url: serverURL + "register.php",
						async: false,
						beforeSend: function() {
							console.log("creating");
							$("#user-account").append("<p class=\"message success prominent creating\">Creating...<br><i class=\"fa fa-2x fa-spinner fa-spin\"></i></p>");
						},
						success: function() {
							$(".creating").remove();
							$("#user-account").append("<p class=\"message success prominent timed\">Your account has been registed and saved.</p>");
							setTimeout(function() {
								$(".timed").remove();
							}, 3500);
						},
					});
				});
			};
		});
	});
	
	$(function(postcodeLookup) {
		$("[data-action=\"submit-postcode-lookup\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#postcode-lookup").submit();
		});
		
		$("#postcode-lookup").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			if ($("#postcode").val() == "") {
				$("#postcode").focus();
				$("#postcode").attr("placeholder", "No postcode entered") && $("#postcode").addClass("plc-warning");
				setTimeout(function() {
					$("#postcode").attr("placeholder", "Enter a postcode") && $("#postcode").removeClass("plc-warning");;
				}, 2800);
				return false;
			} else {
				GMaps.geocode({
					address: $("#postcode").val().trim(),
					callback: function(results, status) {
						if (status == "OK") {
							var addr = results[0].formatted_address;
							//console.log(addr);
							$(".geocode-result").text(addr);
							$("#postcode").val("");
						} else {
							$("#address").attr("placeholder", "No results") && $("#address").addClass("plc-warning");
							setTimeout(function() {
								$("#address").attr("placeholder", "Enter a postcode") && $("#address").removeClass("plc-warning");;
							}, 2800);
						};
					}
				});
			};
		});
	});
	
	$(function(sendFeedback) {
		$("[data-action=\"send-feedback\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#send-feedback").submit();
		});
		
		$("#send-feedback").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			if ($("#name").val() == "" || $("#email").val() == "" || $("#message").val() == "") {
				$("#send-feedback").append("<p class=\"message warning prominent timed\">Please fill out all fields.</p>");
				setTimeout(function() {
					$(".timed").remove();
				}, 3500);
			} else {
				var feedback = $(this).serialize();
				$.ajax({
					type: "POST",
					data: feedback,		
					url: serverURL + "feedback.php", //feedback.php sends the mail
					beforeSend: function() {
						$("#send-feedback").append("<p class=\"message success prominent sending\">Sending...<br><i class=\"fa fa-2x fa-spinner fa-spin\"></i></p>");
					},
					success: function() {
						$(".sending").remove();
						$("#send-feedback").append("<p class=\"message success prominent timed\">Thanks for the feedback!</p>");
						setTimeout(function() {
							$(".timed").remove();
							$("#name").val("") && $("#email").val("") && $("#message").val("");
						}, 3500);
					},
				});
			};
		});
	});
	
	$(function(deleteData) {
		$("#confirm-delete").change(function() {
			var confirmDelete = $(this);
			if (confirmDelete.prop("checked")) { //yes
				$(".delete-button").css("display", "block");
			} else { //no
				$(".delete-button").css("display", "none");
			};
		}).change(function(e) {
			$("[data-action=\"delete-data\"]").hammer().on("tap", function(e) {
				e.stopPropagation(); e.preventDefault();
				
				if ($("#confirm-delete").prop("checked") === true) {
					console.log("delete data button hit");
					
					store.removeItem("searchSettings");
					store.removeItem("userAccount");
					
					$.ajax({
						type: "POST",
						data: {id: userID},
						url: serverURL + "deleteuser.php",
						async: false, //important
						beforeSend: function() {
							$("#delete-data").append("<p class=\"message success prominent working\">Working...<br><i class=\"fa fa-2x fa-spinner fa-spin\"></i></p>");
						},
						success: function() {
							$(".working").remove();
							$("#delete-data").append("<p class=\"message success prominent done\">Your account and application data have been deleted, the app will now restart.</p>");
							userID = 0;
							setTimeout(function() {
								reloadApp();
							}, 4000);
						},
						error: function() {
							console.log("Could not complete");
						}
					});
				};
			});
		});
	});
	
	//get settings when going back home
	$("[data-get=\"settings\"]").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		getSettings();
	});
	
	//get userid when going back home
	$("[data-user=\"userid\"]").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		getID();
		/*$.ajax({
			type: "POST",
			data: {username: name},
			url: serverURL + "getuser.php",
			async: false, //important
			success: function(id, status) {
				userID = id; //if no name is sent, then it returns 0 to validate new users
			},
			error: function() {
				console.log("Failed to get user id, probably there is no match for the given username in the database.");
			}
		});
		console.log("User ID: " + userID);*/
	});
});


/*Prefetching - add class "prefetch" to any links
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

/*Simple method to hash a string, used for making unique place ID's for transactions
-----------------------------------------------------------------------------------------*/
String.prototype.hashCode = function() {
	var hash = 0, i, chr, len;
	if (this.length == 0) return hash;
	for (i = 0, len = this.length; i < len; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; //convert to 32bit integer
	}
	return hash;
};

/*Back button handler to exit app
-----------------------------------------------------------------------------------------*/
function backButton() {
	console.log("backbutton"); //this works
	navigator.notification.confirm("Exit?", function(button) { //this doesn't
		if (button == 1) {
			navigator.app.exitApp();
		};
	}, "Exit", "Yes, No");
};

/*Reload app function, it just reloads the index.html page
-----------------------------------------------------------------------------------------*/
function reloadApp() {
	location.reload(true); //refresh the app, true tells the app that the restart is valid and not a crash
};