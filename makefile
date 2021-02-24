.PHONY: start
start:
	rm -rf public/
	
	mkdir public/
	
	cp -r src/static/* public	

	node-sass src/app/scss -o public/styles
	uglifyjs-folder src/app/js -eo public/js 
	
	node app

.PHONY: build
build: 
	docker-compose up --build