test:
	PATH=./node_modules/.bin:$$PATH jshint css-explain.js
	PATH=./node_modules/.bin:$$PATH nodeunit test.js

.PHONY: test
