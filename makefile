.PHONY: run-server
run-server:
	node-sass ./application/scss -o ./public/styles
	node app

.PHONY: run-server-staging
run-server-staging:
	node-sass -w ./application/scss -o ./public/styles
	nodemon app

.PHONY: deploy
deploy:
	rm -rf dist/
	mkdir dist
	cp -r application dist
	cp
	cp app.js dist