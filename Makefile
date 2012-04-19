node_modules:
	npm install

test: node_modules
	PATH=./node_modules/.bin:$$PATH jshint css-explain.js
	PATH=./node_modules/.bin:$$PATH nodeunit test.js

.PHONY: test
