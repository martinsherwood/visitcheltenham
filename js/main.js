/* All main JavaScript */

//define - offline, and other functions to be built on
var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener("deviceready", this.deviceready, false);
		//add others here
    },
    deviceready: function() {
		app.report("deviceready"); //this is an event handler so the scope is that of the event so we need to call app.report(), and not this.report()
		addEventListeners();
		setStorage();
		
		document.addEventListener("backbutton", onBackKeyDown, false);
		
		function onBackKeyDown() {
			navigator.notification.alert("hello world");
		}
		
		/*document.addEventListener("backbutton", function() {
			exitApp();
			function exitApp() {
				navigator.notification.confirm("Exit?", function(button) {
					if (button == 1) {
						navigator.app.exitApp();
					} 
				}, "Exit", "Yes, No");  
				return false;
			}
		}, false);*/
		
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
		size        : 4980736, //size of database, in bytes. WebSQL-only
		storeName   : "vc_storage",
		description : "Config settings and other application data"
	};
};

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
                        	"<a data-goto=\"#home\" data-push=\"page\" data-settings=\"update\" class=\"page\"><i class=\"fa fa-border fa-home\"></i>Home</a>" +
                            "<a data-goto=\"#places\" data-push=\"page\" class=\"page\"><i class=\"fa fa-border fa-location-arrow\"></i>My Places</a>" +
                            "<a data-goto=\"#offers\" data-push=\"page\" class=\"page\"><i class=\"fa fa-border fa-shopping-cart\"></i>Offers<span class=\"offer-count\">0</span></a>" +
                            "<a data-goto=\"#settings\" data-push=\"page\" class=\"page\"><i class=\"fa fa-border fa-cog\"></i>Settings</a>" +
                        "</div>" +
                    "</nav>" +
                    "<div role=\"button\" data-role=\"button\" class=\"locate-button\"></div>" +
                "</header>";
							
$("body").prepend(header);

/*-----------------------------------------------------------------------------------------*/

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
		toggleMenu();
		
		var current = $(app).find(".current"); //this won't work more globally as the class current changes
		var newPage = $(this).attr(handle);
		
		//hide current and show new
		$(current).removeClass("current");
		$(newPage).addClass("current");
		
		//return false; - we do this up top instead
	});
	
	$("[data-settings=\"update\"]").hammer().on("tap", function(e) {
		e.stopPropagation(); e.preventDefault();
		console.log("update fired");
		//updateSettings(); - for later instead of asking for app restart, if time allows
	});
});


(function() { //begin main scope
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
	
	var searchRadius, travelMode, unitSystem;
	
	store.getItem("searchSettings").then(function(value) {
		//console.log(value);
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
})(); //end scope


/*Map on start page, with geolocation

var map - the map on the start page
var cheltenham - lat and long from centre of cheltenham built into a google maps latlng object
var mapStyles - json style array for the map

//IMPORTANT
var position - is used to get the lat and long values from the gps
var currentLocation - holds the users current location from the values in position

-----------------------------------------------------------------------------------------*/


/*Settings and options functionality
-----------------------------------------------------------------------------------------*/
$(function(userSettings) {
	
	//search settings
	$(function(searchSettings) {
		store.getItem("searchSettings").then(function(value) {
			//console.log(value);
			$("#search-radius").val(value[0].searchRadius);
			$("#travel-mode option[value=\"" + value[1].travelMode + "\"]").attr("selected", "selected");
			$("#unit-system option[value=\"" + value[2].unitSystem + "\"]").attr("selected", "selected");
		});
		
		$("[data-action=\"save-search-settings\"]").hammer().on("tap", function(e) {
			e.stopPropagation(); e.preventDefault();
			console.log(this, e + "saved");
			
			var searchRadius = $("#search-radius").val(),
				travelMode   = $("#travel-mode").val(),
				unitSystem   = $("#unit-system").val()
				
			var searchSettings = [{searchRadius: searchRadius}, {travelMode: travelMode}, {unitSystem: unitSystem}];
			
			store.setItem("searchSettings", searchSettings).then(function(value) {
				console.log(value);
			});
			
			//MAKE PHONEGAP ALERT LIKE THE BACKBUTTON
			$("#search-settings").append("<p class=\"message success saved ss-set\">Settings have been saved, but a restart is required.</p>");
			setTimeout(function() {
				$(".ss-set").remove();
			}, 3500);
		});
	});
	
	/* ----- */
	
	//postcode lookup
	
	$(function(postcodeLookup) {
		$("[data-action=\"submit-geocode-search\"]").hammer().on("tap", function(e) {
			$("#geocode-search").submit();
		});
		
		$("#geocode-search").submit(function(e) {
			e.stopPropagation(); e.preventDefault();
			GMaps.geocode({
				address: $("#address").val().trim(),
				callback: function(results, status) {
					if (status == "OK") {
						//var result = results[0].geometry.location;
						
						var addr = results[0].formatted_address;
						console.log(addr);
						
						$("#address").val(addr);
						
						//save the items in indexeddb too? some sort of history list or whatever?
						
						//$(".geocode-result").append("<p>" + addr + "</p>");
						
					} else {
						$("#address").attr("placeholder", "No results") && $("#address").addClass("plc-warning");
						setTimeout(function() {
							$("#address").attr("placeholder", "Enter a postcode") && $("#address").removeClass("plc-warning");;
						}, 2800);
					};
				}
			});
		});
	});
	
	/* ----- */
	
	//sign in via google (alpha'ish / beta) - TEST
	
	/*start*/
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
	
	//enter name manually here
	
	$(function(manualName) {
		//here
	});
	
});

//offers

$(function(getOffers) {
	
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