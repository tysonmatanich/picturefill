# Picturefill

A Responsive Images approach that you can use today, that mimics the [proposed picture element](http://www.w3.org/community/respimg/wiki/Picture_Element_Proposal) using `div`s, for safety sake.

* Author: Tyson Matanich - http://matanich.com
* Original Author: Scott Jehl
* License: MIT/GPLv2

Demo URL: http://tysonmatanich.github.com/picturefill/

**Note:** Picturefill includes three other scripts that help detect the following: viewport width, device pixel width, device pixel ratio. These scripts are also available on GitHub for standalone use.

* [GetViewportWidth]:(http://github.com/tysonmatanich/GetViewportWidth)
* [GetDevicePixelWidth]:(http://github.com/tysonmatanich/GetDevicePixelWidth)
* [GetDevicePixelRatio]:(http://github.com/tysonmatanich/GetDevicePixelRatio)

## Size and delivery

Currently, `picturefill.js` compresses to around 1,973 bytes (~1.9 KB), after minify and gzip. To minify, you might try these online tools: [Microsoft Ajax Minifier]:(http://ajaxmin.codeplex.com/), [Uglify]:(http://marijnhaverbeke.nl/uglifyjs), [Yahoo Compressor]:(http://refresh-sf.com/yui/), or [Closure Compiler](http://closure-compiler.appspot.com/home). Serve with gzip compression.

## Markup pattern and explanation

Mark up your responsive images like this. 

```html
<div data-picture data-alt="Alt text">
	<div data-src="small.jpg"></div>
	<div data-src="medium.jpg"     data-media="(min-width: 400px)"></div>
	<div data-src="large.jpg"      data-media="(min-width: 800px)"></div>
	<div data-src="extralarge.jpg" data-media="(min-width: 1000px)"></div>
	<noscript>
		<img src="small.jpg" alt="Alt text">
	</noscript>
</div>
```

Each `div[data-src]` element’s `data-media` attribute accepts the following media queries:

* `(min-width: 320px)`
* `(max-width: 320px)`
* `(min-device-pixel-width: 800px)` *
* `(max-device-pixel-width: 800px)` *
* `(min-device-pixel-ratio: 2)`

Or you can use a compound media query such as the following:

* `(min-width: 320px) and (min-device-pixel-ratio: 2)`

### Explained...

Notes on the markup above...

* The `div[data-picture]` element's `data-alt` attribute is used as alternate text for the generated `img` element.
* The `div[data-picture]` element can have any number of `source` elements. The above example may contain more than the average situation would call for.
* Each `div[data-src]` element must have a `data-src` attribute specifying the image path. 
* It's generally a good idea to include one source element with no `data-media` qualifier, so it'll apply everywhere.
* Each `data-src` element can have an optional `data-media` attribute to make it apply in different media settings.
* The `noscript` element wraps the fallback image for non-JavaScript environments, and including this wrapper prevents browsers from fetching the fallback image during page load (causing unnecessary overhead). Generally, it's a good idea to reference a small image here, as it's likely to be loaded in older/underpowered mobile devices.
	
### HD media queries

Picturefill natively supports HD image replacement. While numerous other solutions exist, picturefill has the added benefit of performance for the user in only getting served one image.

* The `data-media` attribute supports [compound media queries](https://developer.mozilla.org/en-US/docs/CSS/Media_queries), allowing for very specific behaviors to emerge.  For example, a `data-media="(min-width: 400px) and (min-device-pixel-ratio: 2.0)` value can be used to serve a higher resolution version of the source instead of a standard definition image.

```html
<div data-picture data-alt="Alt text">
	<div data-src="small.jpg"></div>
	<div data-src="small.jpg"         data-media="(min-device-pixel-ratio: 2.0)"></div>
	<div data-src="medium.jpg"        data-media="(min-width: 400px)"></div>
	<div data-src="medium_x2.jpg"     data-media="(min-width: 400px) and (min-device-pixel-ratio: 2.0)"></div>
	<div data-src="large.jpg"         data-media="(min-width: 800px)"></div>
	<div data-src="large_x2.jpg"      data-media="(min-width: 800px) and (min-device-pixel-ratio: 2.0)"></div>	
	<div data-src="extralarge.jpg"    data-media="(min-width: 1000px)"></div>
	<div data-src="extralarge_x2.jpg" data-media="(min-width: 1000px) and (min-device-pixel-ratio: 2.0)"></div>	
	<noscript>
		<img src="small.jpg" alt="Alt text">
	</noscript>
</div>
```

* Note: Supporting this many breakpoints quickly adds size to the DOM and increases implementation and maintenance time, so use this technique sparingly.

### Other options

The following are boolean attributes that can be added to the `div[data-picture]` element.

* Adding `data-defer` causes the picture element to not get resolved until after the body onload event
* Adding `data-disable-swap` causes the picture element to only get resolved once so other image sizes are not downloaded
* Adding `data-disable-swap-above` causes the picture element to not evaluate `div[data=src]` elements above the current one
* Adding `data-disable-swap-below` causes the picture element to not evaluate `div[data=src]` elements below the current one

#### resolveLast()

Calling `window.picturefill.resolveLast()` directly after a picture element will cause it to get resolved before the entire DOM is ready. This tells picturefill to resolve the last `div[data-picture]` that is present in the DOM.

```html
<div data-picture data-alt="Alt text">
	<div data-src="small.jpg"></div>
	<div data-src="medium.jpg"     data-media="(min-width: 400px)"></div>
	<div data-src="large.jpg"      data-media="(min-width: 800px)"></div>
	<div data-src="extralarge.jpg" data-media="(min-width: 1000px)"></div>
	<noscript>
		<img src="small.jpg" alt="Alt text">
	</noscript>
</div>
<script type="text/javascript">window.picturefill.resolveLast();</script>
```


## Support

Picturefill supports a broad range of browsers and devices (there are currently no known unsupported browsers), provided that you stick with the markup conventions provided.

