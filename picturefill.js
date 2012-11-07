/*! Picturefill | Includes: GetViewportWidth, GetDevicePixelWidth, and GetDevicePixelRatio | Author: Tyson Matanich, 2012 | License: MIT/GPLv2 | Based on Picturefill by Scott Jehl and the W3C Picture Element Proposal. */
(function (w) {

	// Enable strict mode
	"use strict";

	var images = [];

	var removePX = function (value) {

		value = value.substring(0, value.length - 2);
		return Number(value);
	};

	var matchMedia = function (query) {

		query = (query == null || query === undefined) ? "" : (query + "").replace(/^[\s]+|[\s]+$/g, "");

		if (query.length > 0) {

			// Make media query lowercase
			query = query.toLowerCase();

			// Remove the first '(' and last ')'
			query = query.substring(1, query.length - 1);

			// Split into parts
			var parts = query.split(") and (");

			for (var i = 0, l = parts.length; i < l; i++) {

				var j = parts[i].indexOf(":");

				// Get the property's name
				var property = parts[i].substring(0, j).replace(/^[\s]+|[\s]+$/g, "");

				// Get the property's value
				var value = parts[i].substring(j + 1).replace(/^[\s]+|[\s]+$/g, "");

				// Evaluate rule
				switch (property) {

					// Minimum viewport width                                                                             
					case "min-width":
						value = removePX(value);
						if (value > w.getViewportWidth()) {

							// Rule failed
							return false;
						}
						break;

					// Maximum viewport width                                                                              
					case "max-width":
						value = removePX(value);
						if (value < w.getViewportWidth()) {

							// Rule failed
							return false;
						}
						break;

					// Minimum actual device pixel width                                                                               
					case "min-device-pixel-width":
						value = removePX(value);
						if (value > w.getDevicePixelWidth()) {

							// Rule failed
							return false;
						}
						break;

					// Maximum actual device pixel width                                                                                 
					case "max-device-pixel-width":
						value = removePX(value);
						if (value < w.getDevicePixelWidth()) {

							// Rule failed
							return false;
						}
						break;

					// Device pixel ratio                                                                            
					case "min-device-pixel-ratio":
						if (Number(value) > w.getDevicePixelRatio()) {

							// Rule failed
							return false;
						}
						break;

					default:
						// Rule type not supported, therefore failed
						return false;
				}
			}
		}

		// Rule passed
		return true;
	};

	var resolvePicture = function (element) {

		// Flag picture as resolved
		element.setAttribute("data-resolved", "true");

		// Get all source elements
		var sources = element.getElementsByTagName("div")

		var matchSrc;
		var matchIndex;

		// Evaluate @data-media to locate the first match (processed in reverse order)
		for (var i = sources.length - 1; i >= 0; i--) {
			var isMatch = matchMedia(sources[i].getAttribute("data-media"));
			if (isMatch == true) {

				// Found a match
				matchSrc = sources[i].getAttribute("data-src");
				matchIndex = i;
				break;
			}
		}

		// Find the existing image
		var imgElement = element.getElementsByTagName("img")[0];

		if (matchSrc !== undefined) {
			var isFirst = false;

			if (!imgElement) {
				// Create the image for the first time
				isFirst = true;
				imgElement = w.document.createElement("img");
				imgElement.alt = element.getAttribute("data-alt");
				element.appendChild(imgElement);
			}
			else {
				// Check if the existing image should be updated
				var existingIndex = imgElement.getAttribute("data-source-index");
				if (existingIndex == matchIndex || (element.getAttribute("data-disable-swap-above") !== null && existingIndex >= matchIndex) || (element.getAttribute("data-disable-swap-below") !== null && existingIndex <= matchIndex)) {
					// Don't swap out the image
					return;
				}
			}

			if (isFirst) {
				// Set the new src and index
				imgElement.src = matchSrc;
				imgElement.setAttribute("data-source-index", matchIndex);
			}
			else {
				swapImageWhenLoaded(imgElement, matchSrc, matchIndex);
			}
		}
		else if (!imgElement) {
			// Get contents of the noscript block as a fallback
			var noscriptElement = element.getElementsByTagName("noscript")[0];
			if (noscriptElement !== undefined) {
				element.innerHTML = element.innerHTML + (noscriptElement.innerText || noscriptElement.innerHTML);
			}
		}
	};

	var swapImageWhenLoaded = function (imgElement, matchSrc, matchIndex) {

		if (typeof images[matchSrc] == "object" && images[matchSrc].complete) {
			// The image is already loaded, swap it out
			imageLoaded(imgElement, matchSrc, matchIndex);
		}
		else if (document.images) {
			// Load the image 
			var imgObject = w.document.createElement("img");

			imgObject.onload = function () {
				imageLoaded(imgElement, imgObject.src, matchIndex);
			};
			imgObject.onerror = function () {
				imageError(matchSrc, imgObject);
			};

			images[matchSrc] = imgObject;
			imgObject.src = matchSrc;
		}
		else {
			// Browser does not have document.images, just load the image
			imageLoaded(imgElement, matchSrc, matchIndex);
		}
	};

	var imageLoaded = function (imgElement, matchSrc, matchIndex) {

		// Swap the image
		imgElement.src = matchSrc;
		imgElement.setAttribute("data-source-index", matchIndex);
	};

	var imageError = function (matchSrc, imgObject) {

		// Remove the image so it can load next time
		imgObject.onerror = null;
		imgObject.onload = null;
		imgObject.src = '';

		images[matchSrc] = undefined;
	};

	w.picturefill = {};

	w.picturefill.init = function (resolveDeferredPictures) {

		if (typeof resolveDeferredPictures != "boolean") {
			// Set all pictures to be resolved if param was not passed
			resolveDeferredPictures = true;
		}

		var ps = w.document.getElementsByTagName("div");

		// Loop the pictures
		for (var i = 0, il = ps.length; i < il; i++) {
			if (ps[i] !== undefined && ps[i].getAttribute("data-picture") !== null) {

				// Check if the picture uses deferred loading
				if ((ps[i].getAttribute("data-resolved") === null || ps[i].getAttribute("data-disable-swap") === null)
					&& (resolveDeferredPictures === true || ps[i].getAttribute("data-defer") === null)) {

					// Resolve picture
					resolvePicture(ps[i]);
				}
			}
		}
	};

	w.picturefill.resolveLast = function () {

		var ps = w.document.getElementsByTagName("div");

		// Loop the pictures

		for (var i = ps.length - 1; i >= 0; i--) {
			if (ps[i].getAttribute("data-picture") !== null) {

				// Get the last picture that has not yet been resolved and resolve it
				if (ps[i].getAttribute("data-resolved") === null && ps[i].getAttribute("data-defer") === null) {

					// Resolve picture
					resolvePicture(ps[i]);
					break;
				}
			}
		}
	};

	//TODO: Uncomment following line to start resolving pictures before DOM ready has fired
	//w.picturefill.init(false);

	// Run on resize and domready (w.load as a fallback)
	if (w.addEventListener) {
		w.addEventListener("resize", w.picturefill.init, false);
		w.addEventListener("DOMContentLoaded", function () {
			w.picturefill.init(false);
			// Run once only
			w.removeEventListener("load", w.picturefill.init, false);
		}, false);
		w.addEventListener("load", w.picturefill.init, false);
	}
	else if (w.attachEvent) {
		w.attachEvent("onload", w.picturefill.init);
	}

} (this));

/*! GetViewportWidth | Author: Tyson Matanich, 2012 | License: MIT */
(function (window) {
    window.getViewportWidth = function () {
        var width;
        var document = window.document;
        var documentElement = document.documentElement;
        if (window.innerWidth === undefined) {
            // IE6 & IE7 don't have window.innerWidth
            width = documentElement.clientWidth;
        }
        else if (window.innerWidth > documentElement.clientWidth) {
            // WebKit doesn't include scrollbars while calculating viewport width so we have to get fancy

            // Insert markup to test if a media query will match document.doumentElement.clientWidth
            var bodyElement = document.createElement("body");
            bodyElement.id = "vpw-test-b";
            bodyElement.style.cssText = "overflow:scroll";
            var divElement = document.createElement("div");
            divElement.id = "vpw-test-d";
            divElement.style.cssText = "position:absolute;top:-1000px";
            // Getting specific on the CSS selector so it won't get overridden easily
            divElement.innerHTML = "<style>@media(width:" + documentElement.clientWidth + "px){body#vpw-test-b div#vpw-test-d{width:7px!important}}</style>";
            bodyElement.appendChild(divElement);
            documentElement.insertBefore(bodyElement, document.head);

            if (divElement.offsetWidth == 7) {
                // Media query matches document.documentElement.clientWidth
                width = documentElement.clientWidth;
            }
            else {
                // Media query didn't match, use window.innerWidth
                width = window.innerWidth;
            }
            // Cleanup
            documentElement.removeChild(bodyElement);
        }
        else {
            // Default to use window.innerWidth
            width = window.innerWidth;
        }
        return width;
    };
})(this);

/*! GetDevicePixelWidth | Includes: GetDevicePixelRatio | Author: Tyson Matanich, 2012 | License: MIT */
(function (window) {
    window.getDevicePixelWidth = function (assumeLandscape) {
        // Don't assume reorientation to landscape by default
        assumeLandscape = assumeLandscape || false;

        // Get the screen dimension
        var screenWidth = (assumeLandscape == false || window.screen.width > window.screen.height) ? window.screen.width : window.screen.height;

        // Increase size if window inner size is larger (Fix for multi display setups, especially IE)
        var windowWidth = (assumeLandscape == false || window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight;
        if (windowWidth > screenWidth) {
            screenWidth = windowWidth;
        }

        // Multiply screen resolution by the device pixel ratio to get the actual physical pixel dimension
        return screenWidth * window.getDevicePixelRatio();
    };
})(this);

/*! GetDevicePixelRatio | Author: Tyson Matanich, 2012 | License: MIT */
(function (window) {
    window.getDevicePixelRatio = function () {
        var ratio = 1;
        // To account for zoom, change to use deviceXDPI instead of systemXDPI
        if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
            // Only allow for values > 1
            ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
        }
        else if (window.devicePixelRatio !== undefined) {
            ratio = window.devicePixelRatio;
        }
        return ratio;
    };
})(this);