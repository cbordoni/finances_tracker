.PHONY: run-server
run-server:
	npm run server

.PHONY: deploy
deploy:
	rm -rf dist/
	mkdir dist
	cp -r application dist
	cp
	cp app.js dist