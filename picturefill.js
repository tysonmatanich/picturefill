/*! Picturefill - Responsive Images that work today. (and mimic the proposed Picture element with span elements). Author: Tyson Matanich, 2014 | License: MIT/GPLv2 | Based on Picturefill by Scott Jehl, Filament Group  */

(function( w ){

    // Enable strict mode
    "use strict";

    var images = [];
    var size = {};
    var hasDeferred = false;

	w.picturefill = function( defer ){
	    var ps = w.document.getElementsByTagName("span");

        // Loop the pictures
		for( var i = 0, il = ps.length; i < il; i++ ){
			if( ps[ i ].getAttribute( "data-picture" ) !== null ){

                if( defer === true && ps[ i ].getAttribute( "data-defer" ) !== null ){
                    hasDeferred = true;
                    // Skip further actions if it is using defered loading
                    continue;
                }

                resolvePicture( ps[ i ] );
            }
		}
    };

    w.picturefill.resolveLast = function (){
		var ps = w.document.getElementsByTagName( "span" );

        // Loop the pictures (backwards)
        for( var i = ps.length - 1; i >= 0; i-- ){
            if( ps[ i ].getAttribute( "data-picture" ) !== null ){

                // Find any existing img element in the picture element
                var picImg = ps[ i ].getElementsByTagName( "img" )[ 0 ];

                // Get the last picture that has not yet been resolved and resolve it
                if ( !picImg || picImg.parentNode.nodeName === "NOSCRIPT" ){
                    resolvePicture( ps[ i ] );
                }

                break;
            }
        }
    };

    function resolvePicture( p ){
        var sources = p.getElementsByTagName( "span" ),
            matches = [];

        // See if which sources match
        for( var j = 0, jl = sources.length; j < jl; j++ ){
            var media = sources[ j ].getAttribute( "data-media" );
            // if there's no media specified, OR w.matchMedia is supported 
            if( !media || ( w.matchMedia && w.matchMedia( media ).matches ) ){
                matches.push( sources[ j ] );
            }
        }

        // Find any existing img element in the picture element
        var picImg = p.getElementsByTagName( "img" )[ 0 ];

        if( matches.length ){
            var matchedEl = matches.pop();
            if( !picImg || picImg.parentNode.nodeName === "NOSCRIPT" ){
                picImg = w.document.createElement( "img" );
                var alt = p.getAttribute( "data-alt" );
                if (alt !== null) {
                    picImg.alt = alt;
                }
            }
            else if( matchedEl === picImg.parentNode || p.getAttribute( "data-disable-swap" ) !== null ){
                // Skip further actions if the correct image is already in place
                return;
            }
            else if( p.getAttribute( "data-disable-swap-above" ) !== null ){
                for (var k = sources.length - 1; k >= 0; k--) {
                    if (sources[ k ] === picImg.parentNode) {
                        // Skip further actions if the matched source is defined above the image that is already in place
                        return;
                    }
                    else if (sources[ k ] === matchedEl) {
                        break;
                    }
                }
            }
            else if( p.getAttribute( "data-disable-swap-below" ) !== null ){
                for( var k = 0, kl = sources.length; k < kl; k++ ){
                    if( sources[ k ] === picImg.parentNode ){
                        // Skip further actions if the matched source is defined below the image that is already in place
                        return;
                    }
                    else if( sources[ k ] === matchedEl ){
                        break;
                    }
                }
            }

            var matchSrc = matchedEl.getAttribute("data-src");

            if( picImg.src === "" ||
            	p.getAttribute( "data-ensure-img" ) === null ||
                ( images[ matchSrc ] !== undefined && images[ matchSrc ].complete === true ) ||
                document.images === undefined) {
                // Update the image now
                updateImg( picImg, matchedEl );
            }
            else{
			    // Load the image before updating
			    var imgObject = w.document.createElement( "img" );
			    imgObject.onload = function (){
			        updateImg( picImg, matchedEl );
			    };
			    imgObject.onerror = function (){
				    // Remove the image so it can attempt to load next time
		            imgObject.onerror = null;
		            imgObject.onload = null;
		            imgObject.src = "";
		            images[ matchSrc ] = undefined;

                    //TODO: If no img is loaded, then try to load the closest match
			    };
			    images[ matchSrc ] = imgObject;
			    imgObject.src = matchSrc;
            }
        }
        else if (picImg) {
            //TODO: If ensure img is enabled, try to load the closest match instead of removing the image
            picImg.parentNode.removeChild( picImg );
        }
    }

    function updateImg( picImg, matchedEl ){
        picImg.src = matchedEl.getAttribute( "data-src" );
        matchedEl.appendChild( picImg );
        picImg.removeAttribute( "width" );
        picImg.removeAttribute( "height" );
    }

    // Run on resize and domready (w.load as a fallback)
    if( w.addEventListener ){
		w.addEventListener( "resize", w.picturefill, false );
		w.addEventListener( "DOMContentLoaded", function(){
		    size = {
		        innerWidth: w.innerWidth,
		        innerHeight: w.innerHeight
		    };
            w.picturefill( true );
		}, false );
		w.addEventListener( "load", function(){
            if( hasDeferred === true || size.innerWidth !== w.innerWidth || size.innerHeight !== w.innerHeight ){
                // Only reprocess if size changed or deferred loading was used
                w.picturefill();
            }
		}, false );
	}
    else if( w.attachEvent ){
        w.attachEvent( "onload", w.picturefill );
    }

}( this ));
