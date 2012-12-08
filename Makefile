node_modules:
	npm install

test: node_modules
	PATH=./node_modules/.bin:$$PATH jshint lib/css-explain.js
	PATH=./node_modules/.bin:$$PATH nodeunit test.js

.PHONY: test
