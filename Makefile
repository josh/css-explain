test:
	PATH=./node_modules/.bin:$$PATH nodeunit test.js

.PHONY: test
