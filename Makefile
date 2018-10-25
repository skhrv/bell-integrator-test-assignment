install: install-deps

develop:
	npm run webpack-dev-server

install-deps:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npm run webpack

deploy:
	make build
	surge ./dist --domain long-end.surge.sh

test:
	npm test

lint:
	npm run eslint .

publish:
	npm publish

.PHONY: test
