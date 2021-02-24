const express = require('express');
const consign = require('consign');
const path = require('path');

const minifyHTML = require('express-minify-html-2');

const mongoose = require('mongoose');

const AccountController = require('./src/controllers/account.controller');

const Utils = require('./src/utils/utils');

global.appRoot = path.resolve(__dirname);

global.pagesDir = appRoot + '/src/views/pages/';

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(
	express.static(path.join(__dirname, 'public'), {
		maxAge: 24 * 60 * 60 * 1000, // 1 day
	})
);

app.use(
	minifyHTML({
		override: true,
		exception_url: false,
		htmlMinifier: {
			removeComments: true,
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes: true,
			removeEmptyAttributes: true,
			minifyJS: true,
		},
	})
);

app.use((req, res, next) => {
	var date = Utils.getDefaultDate(req.query.from);

	req.referenceDate = date;

	req.renderInfo = {
		user: {
			name: 'John Doe',
			email: 'johndoe@gmail.com',
			isAdmin: true,
		},
		formatMoney: Utils.money.format,
		formatDate: Utils.getMaskedDate,
		date,
	};

	next();
});

consign().include('src/routes').into(app);

app.listen(process.env.PORT, () => {
	console.log('\n> Server up');

	mongoose
		.connect('mongodb://127.0.0.1:27017/app_finances', { useNewUrlParser: true, useUnifiedTopology: true })
		.then(
			() => {
				console.log('> Connected to the database');

				new AccountController().populateDemo();
			},
			(e) => {
				console.log('Error', e.message);
			}
		);
});
