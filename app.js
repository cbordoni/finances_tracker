const express = require('express');
const consign = require('consign');
const axios = require('axios');

const path = require('path');

global.appRoot = path.resolve(__dirname);

require('dotenv').config();

const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

consign().include('application/routes').into(app);

const getDate = () => {
	const date = new Date();

	return `${date.getFullYear()}-${
		date.getMonth() + 1
	}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

const request = (url, content = { method: 'get' }) => {
	console.log('Starting request: ' + url);

	const time = new Date().getTime();

	return axios({ url, ...content }).then((e) => {
		console.log(`Elapsed time: ${new Date().getTime() - time}ms`);

		return e;
	});
};

global.request = request;

if (process.env.DEBUG) {
	app.use((req, res, next) => {
		console.log(`[${getDate()}] ${req.method}: ${req.originalUrl}`);

		next();
	});
}

app.listen(process.env.PORT, () => {
	console.log('Server up');

	const todosUrl = `http://${process.env.HOST}:${process.env.PORT}/todos.json`; //https://jsonplaceholder.typicode.com/todos

	const commentsUrl = `http://${process.env.HOST}:${process.env.PORT}/comments.json`; //https://jsonplaceholder.typicode.com/todos

	request(todosUrl).then((e) => {
		global.todos = e.data;
	});

	request(commentsUrl).then((e) => {
		global.comments = e.data;
	});
});
