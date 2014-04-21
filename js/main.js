//application constructor -> bind events/listeners -> deviceready -> update and display -> report
//deviceready event handler, the scope of 'this' is the event. In order to call the 'report' function, we must explicity call 'app.report(...);', same for any others
//app.report is an event handler so the scope is that of the event so we need to call app.report(), and not this.report()
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
		//default settings should be set here as well
    },
    report: function(id) {
		console.log("report:" + id);
    },
};


/*Sets up the device storage environment to use, automatically selects the best library
/*depending what is supported by the device. Uses store.js, based on Mozilla LocalStorage.
-----------------------------------------------------------------------------------------*/
function setStorage() {
	var db = indexedDB || window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
	
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
	
	window.storeConfig = {
		name        : "visit_cheltenham_app",
		version     : 1.0,
		size        : 4980736, //size of database, in bytes. WebSQL-only
		storeName   : "vc_storage",
		description : "Config settings and other application data"
	};
};

function reloadApp() {
	location.reload(true); //refresh the app, true tells the app that the restart is valid and not a crash
};

var searchRadius, travelMode, unitSystem, userName;
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
	
	store.getItem("userName").then(function(value) {
		userName = value;
		//console.log(userName);
	});
};

function backButton() {
	console.log("backbutton"); //works
	navigator.notification.confirm("Exit?", function(button) { // :(
		if (button == 1) {
			navigator.app.exitApp();
		};
	}, "Exit", "Yes, No");
};

/*-----------------------------------------------------------------------------------------*/

//we add the header like this incase we need it different pages and sections
var header =	"<header role=\"banner\" data-role=\"header\" class=\"app-header container inner-wrap\">" +
                	"<div role=\"button\" data-role=\"button\" class=\"menu-stack push\"></div>" +
                    "<nav role=\"navigation\" data-role=\"navbar\" class=\"main-menu menu-closed\">" +
                    	"<div class=\"nav-links\">" +
                        	"<a data-goto=\"#home\" data-push=\"page\" data-get=\"settings\" class=\"page\"><i class=\"fa fa-border fa-home\"></i>Home</a>" +
                            "<a data-goto=\"#places\" data-push=\"page\" class=\"page\"><i class=\"fa fa-border fa-location-arrow\"></i>My Places</a>" +
                            "<a data-goto=\"#offers\" data-push=\"page\" class=\"page\"><i class=\"fa fa-border fa-shopping-cart\"></i>Offers<span class=\"offer-count\">0</span></a>" +
                            "<a data-goto=\"#settings\" data-push=\"page\" class=\"page\"><i class=\"fa fa-border fa-cog\"></i>Settings</a>" +
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
			toggleMenu();
		});
		
		overlay.hammer().on("tap", function(e) {
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
		$currentPage = $("#settings").addClass("current"); //FOR DEV-REMOVE LATER
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
	}); 
	
	$("[data-get=\"settings\"]").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		getSettings();
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
	var mapStyles = [{featureType:"road",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi",elementType:"labels",stylers:[{visibility:"simplified"}]},{featureType:"transit",elementType:"labels.text",stylers:[{visibility:"off"}]},{featureType:"water",elementType:"geometry",stylers:[{color:"#a2daf2"}]},{featureType:"landscape.man_made",elementType:"geometry",stylers:[{color:"#f7f1df"}]},{featureType:"landscape.natural",elementType:"geometry",stylers:[{color:"#d0e3b4"}]},{featureType:"landscape.natural.terrain",elementType:"geometry",stylers:[{visibility:"off"}]},{featureType:"poi.park",elementType:"geometry",stylers:[{color:"#bde6ab"}]},{featureType:"poi.medical",elementType:"geometry",stylers:[{color:"#fbd3da"}]},{featureType:"road",elementType:"geometry.stroke",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{color:"#ffe15f"}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#efd151"}]},{featureType:"road.arterial",elementType:"geometry.fill",stylers:[{color:"#ffffff"}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{color:"black"}]},{featureType:"transit.station.airport",elementType:"geometry.fill",stylers:[{color:"#cfb2db"}]}];
	
	getSettings();
	
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
		
		$("#place-search").submit(function(e) {
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
									"<div class=\"opt\"><i data-destination=\"" + place.geometry.location + "\" id=\"get-directions\" class=\"fa fa-2x fa-location-arrow\"></i></div>" +
									"<div class=\"opt\"><i data-placename=\"" + place.name + "\" id=\"add-place\" class=\"fa fa-2x fa-star\"></i></div>" +
								"</div></li>");
								
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
					}//search
				});
			}
			
			detailsList.hammer().on("tap", "li", function(e) {
				e.stopPropagation(); e.preventDefault();
				var change = $(this);
				var dist = $(this).data("distance")
				var dura = $(this).data("duration")
				//if distance is shown, show duration else show distance and vice-versa
				if (change.text() == dist) {
					change.text(dura);
				} else {
					change.text(dist);
				};
			});
			
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
	});//placesMap
})(); //end map scope

$(function(doMore) {
	
	var placeName;
	var directionsTo;
	
	var directionsOverlay = "<div id=\"directions-box\" class=\"directions\" data-transition=\"slide-down-in\">" +
								"<h1 class=\"inner-wrap\">Directions<i class=\"fa fa-times close-directions\"></i></h1>" +
							"</div>"
							
	$(".results-names").hammer().on("swipeleft tap", "li", function(e) {
		e.stopPropagation(); e.preventDefault();

		//placeName = $(this).data("placename");

		$(this).children("span").toggleClass("swiped");
		$(this).children("div").toggleClass("shown"); //options div
		
	});
	
	$(".results-names").hammer().on("tap", "i#add-place", function(e) {
		e.stopPropagation(); e.preventDefault();
		placeName = $(this).data("placename");
		console.log(placeName)
		//add as fav and change colour of star here, also set to storage and colour star according to it
	});
	
	$(".results-names").hammer().on("tap", "i#get-directions", function(e) {
		e.stopPropagation(); e.preventDefault();
		directionsTo = $(this).data("destination");
		console.log(directionsTo);
		
		$("#home").removeClass("current");
		
		$("body").prepend(directionsOverlay);
		
		//finish this and the overlay styles and do the directions stuff - test everything
		
		$(".close-directions").hammer().on("tap", function(e) {
			console.log("closed");
			$("#directions-box").remove();
			$("#home").addClass("current");
		});
		
	});
});

/*Settings and options functionality
-----------------------------------------------------------------------------------------*/
$(function(userSettings) {
	$(function(searchSettings) {
		store.getItem("searchSettings").then(function(value) {
			//console.log(value);
			$("#search-radius").val(value[0].searchRadius);
			$("#travel-mode option[value=\"" + value[1].travelMode + "\"]").attr("selected", "selected");
			$("#unit-system option[value=\"" + value[2].unitSystem + "\"]").attr("selected", "selected");
		});
		
		$("[data-action=\"save-settings\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			//console.log(this, e + "saved");
			
			var searchRadius = $("#search-radius").val(),
				travelMode   = $("#travel-mode").val(),
				unitSystem   = $("#unit-system").val()
				
			var searchSettings = [{searchRadius: searchRadius}, {travelMode: travelMode}, {unitSystem: unitSystem}];
			
			store.setItem("searchSettings", searchSettings).then(function(value) {
				$("#search-settings").append("<p class=\"message success saved s-set\">Settings have been saved.</p>");
				setTimeout(function() {
					$(".s-set").remove();
				}, 3500);
			});
		});
	});
	
	$(function(postcodeLookup) {
		$("[data-action=\"submit-geocode-search\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#geocode-search").submit();
		});
		
		$("#geocode-search").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			if ($("#postcode").val() == "") {
				$("#postcode").focus();
				$("#postcode").attr("placeholder", "No postcode entered") && $("#postcode").addClass("plc-warning"); //jazzy
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
	
	//sign in via google - not fully working, it throws up at then end when getting the auth token
	//the code should get the token from the url in the inappbrowser window (I don't know why it won't work)
	//you can console.log and get the code before it chucks up the error so I can't see why the code from the
	//url in the inappbrowser window isn't being retrieved.
	/* ----- */
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
		/*end*/
	});
	/* ----- */
	
	$(function(manualName) {
		store.getItem("userName").then(function(value) {
			$("#username").val(value);
		});
		
		$("[data-action=\"save-username\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			$("#user").submit();
		});
		
		$("#user").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			var username = $("#username").val()
			
			if (username == "") {
				$("#username").attr("placeholder", "No username entered") && $("#username").addClass("plc-warning"); //jazzy
				setTimeout(function() {
					$("#username").attr("placeholder", "Enter a username") && $("#username").removeClass("plc-warning");;
				}, 2800);
				return false;
			} else {
				store.setItem("userName", username).then(function(value) {
					$("#user").append("<p class=\"message success saved s-set\">Username has been saved.</p>");
					setTimeout(function() {
						$(".s-set").remove();
						$("#username").val(username);
					}, 3500);
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
			var feedback = $(this).serialize();
			
			$.ajax({
				type: "POST",
				data: feedback,		
				url: "http://martinsherwood.co.uk/visitcheltenham/feedback.php", //feedback.php sends the mail
				beforeSend: function() {
					$("#send-feedback").append("<p class=\"message\">Sending...<br><i class=\"fa fa-spinner fa-spin\"></i></p>"); //finish styling this
				},
				success: function() {
					//console.log(feedback);
					$("#send-feedback").html("<p class=\"message sent\">Thanks, we've got your message and we'll reply shortly!</p>"); //finish styling this
				},
			});
			
		});
		
		
	});
});


/*Offers and redemption
-----------------------------------------------------------------------------------------*/
$(function(getOffers) {
	
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