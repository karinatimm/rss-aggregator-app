# Makefile

install: install-deps
	npx simple-git-hooks

install-deps:
	npm ci

publish:
	npm publish --dry-run

lint:
	npx eslint .

fix:
	npx eslint . --fix

develop:
	npx webpack serve

build:
	NODE_ENV=production npx webpack

test:
	npx jest

test-coverage:
	npm test -- --coverage --coverageProvider=v8

.PHONY:	test