.PHONY: bower_components scripts/lib

styles: bower_components
	cp bower_components/fontawesome/css/font-awesome.min.css styles/font-awesome.min.css
	cp bower_components/bootstrap/dist/css/bootstrap.min.css styles/bootstrap.min.css

scripts/lib: bower_components
	# Collect together the scripts from their vendor dirs
	cp bower_components/bootstrap/dist/js/bootstrap.min.js scripts/lib/bootstrap.js
	cp bower_components/jquery/dist/jquery.min.js scripts/lib/jquery.js
	cp bower_components/jquery/dist/jquery.min.map scripts/lib/jquery.min.map
	cp bower_components/jquery-smooth-scroll/jquery.smooth-scroll.min.js scripts/lib/jquery.smooth-scroll.js
	cp bower_components/jsonproxy/jsonp.js scripts/lib/jsonp.js
	cp bower_components/requirejs/require.js scripts/lib/require.js
	cp bower_components/underscore/underscore-min.map scripts/lib/underscore-min.map
	cp bower_components/underscore/underscore-min.js scripts/lib/underscore.js
	cp -R bower_components/uri.js/src/ scripts/lib/uri

bower_components: bower.json
	bower install
